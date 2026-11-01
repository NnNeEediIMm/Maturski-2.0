require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Room = require("./models/Room");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString("hex");
const COOKIE_NAME = "kwizup_auth";
const AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const INTERMISSION_SECONDS = 5;
const connectedSockets = new Map();
const questionTimers = new Map();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.json({ limit: "20kb" }));

function signAuth(auth) {
  const payload = Buffer.from(
    JSON.stringify({ ...auth, expiresAt: Date.now() + AUTH_MAX_AGE_SECONDS * 1000 })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyAuth(token) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const auth = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof auth.roomId !== "string" ||
      typeof auth.participantId !== "string" ||
      !["professor", "student"].includes(auth.role) ||
      !Number.isFinite(auth.expiresAt) ||
      auth.expiresAt < Date.now()
    ) {
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

function getAuthFromCookie(cookieHeader = "") {
  const cookie = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return null;
  try {
    return verifyAuth(decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)));
  } catch {
    return null;
  }
}

function setAuthCookie(res, auth) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(signAuth(auth))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${AUTH_MAX_AGE_SECONDS}${secure}`
  );
}

function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

function isValidRoomId(roomId) {
  return /^[A-Z0-9]{6}$/.test(roomId);
}

function createAuth(room, participant, isCreator = false) {
  return {
    roomId: room.roomId,
    participantId: participant.participantId,
    role: participant.role,
    name: participant.name,
    isCreator,
  };
}

function roomPageAuth(req, res, next) {
  const auth = getAuthFromCookie(req.headers.cookie);
  if (!auth || auth.roomId !== req.params.roomId) {
    clearAuthCookie(res);
    return res.redirect("/home");
  }
  req.roomAuth = auth;
  next();
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getCurrentQuestion(room) {
  if (!room.quiz.started || room.quiz.finished || room.quiz.phase === "intermission") return null;
  const questionId = room.quiz.questionOrder[room.quiz.currentQuestionIndex];
  return room.questions.find((question) => question.questionId === questionId) || null;
}

function serializeRoomState(room, auth) {
  const question = getCurrentQuestion(room);
  const answersReceived = question ? question.answers.length : 0;
  const questionForClient = question
    ? {
        questionId: question.questionId,
        prompt: question.prompt,
        options: question.options,
        answered: question.answers.some((answer) => answer.participantId === auth.participantId),
        answersReceived,
      }
    : null;

  return {
    serverNow: Date.now(),
    roomId: room.roomId,
    role: auth.role,
    isCreator: auth.isCreator,
    participantId: auth.participantId,
    name: auth.name,
    quiz: {
      started: room.quiz.started,
      finished: room.quiz.finished,
      questionNumber: room.quiz.started ? room.quiz.currentQuestionIndex + 1 : 0,
      questionCount: room.quiz.questionOrder.length,
      timeLimitSeconds: room.quiz.timeLimitSeconds,
      questionDeadlineAt: room.quiz.questionDeadlineAt,
      phase: room.quiz.finished ? "finished" : room.quiz.phase || "question",
      intermissionDeadlineAt: room.quiz.intermissionDeadlineAt,
      autoSwitch: room.quiz.autoSwitch,
      randomizeQuestions: room.quiz.randomizeQuestions,
      currentQuestion: questionForClient,
    },
    questionCount: room.questions.length,
    questionAuthors: auth.role === "professor"
      ? room.questions.map((item) => ({
          prompt: item.prompt,
          author: room.participants.find((participant) => participant.participantId === item.createdBy)?.name || "Professor",
        }))
      : [],
    participants: room.participants.map((participant) => ({
      participantId: participant.participantId,
      name: participant.name,
      role: participant.role,
      score: participant.score,
      isCreator: participant.participantId === room.creatorId,
      hasAnsweredCurrentQuestion: Boolean(
        question && question.answers.some((answer) => answer.participantId === participant.participantId)
      ),
    })),
  };
}

function emitRoomState(room) {
  io.to(room.roomId).fetchSockets().then((sockets) => {
    sockets.forEach((socket) => {
      socket.emit("room:state", serializeRoomState(room, socket.data.auth));
    });
  }).catch((error) => console.error("Could not broadcast room state:", error.message));
}

function rememberSocket(roomId, participantId, socketId) {
  const key = `${roomId}:${participantId}`;
  if (!connectedSockets.has(key)) connectedSockets.set(key, new Set());
  connectedSockets.get(key).add(socketId);
}

function forgetSocket(roomId, participantId, socketId) {
  const key = `${roomId}:${participantId}`;
  const sockets = connectedSockets.get(key);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) connectedSockets.delete(key);
}

function notifySocketError(acknowledge, message) {
  if (typeof acknowledge === "function") acknowledge({ ok: false, error: message });
}

function scheduleQuestionTimeout(roomId, deadlineAt) {
  const previousTimer = questionTimers.get(roomId);
  if (previousTimer) clearTimeout(previousTimer);

  if (!deadlineAt) {
    questionTimers.delete(roomId);
    return;
  }

  const timer = setTimeout(async () => {
    questionTimers.delete(roomId);
    try {
      const room = await Room.findOne({ roomId });
      if (!room || !room.quiz.started) {
        return;
      }
      if (room.quiz.phase === "intermission") {
        if (room.quiz.intermissionDeadlineAt > Date.now()) {
          scheduleQuestionTimeout(roomId, room.quiz.intermissionDeadlineAt);
          return;
        }
        room.quiz.intermissionDeadlineAt = null;
        if (room.quiz.autoSwitch) {
          await startNextQuestion(room);
        } else {
          await room.save();
          emitRoomState(room);
        }
      } else {
        if (room.quiz.questionDeadlineAt > Date.now()) {
          scheduleQuestionTimeout(roomId, room.quiz.questionDeadlineAt);
          return;
        }
        await beginIntermission(room);
      }
    } catch (error) {
      console.error("Could not advance timed question:", error.message);
      if (error.name === "VersionError") {
        const retryTimer = setTimeout(() => {
          questionTimers.delete(roomId);
          scheduleQuestionTimeout(roomId, Date.now());
        }, 1000);
        questionTimers.set(roomId, retryTimer);
      }
    }
  }, Math.max(0, deadlineAt - Date.now()));
  questionTimers.set(roomId, timer);
}

async function beginIntermission(room) {
  if (!room.quiz.started || room.quiz.finished || room.quiz.phase === "intermission") return;
  room.quiz.phase = "intermission";
  room.quiz.questionDeadlineAt = null;
  room.quiz.intermissionDeadlineAt = Date.now() + INTERMISSION_SECONDS * 1000;
  await room.save();
  emitRoomState(room);
  scheduleQuestionTimeout(room.roomId, room.quiz.intermissionDeadlineAt);
}

async function startNextQuestion(room) {
  if (!room.quiz.started || room.quiz.finished || room.quiz.phase !== "intermission") return;
  if (room.quiz.intermissionDeadlineAt > Date.now()) {
    throw new Error("Please wait for the five-second scoreboard break to finish.");
  }
  if (room.quiz.currentQuestionIndex + 1 >= room.quiz.questionOrder.length) {
    room.quiz.finished = true;
    room.quiz.started = false;
    room.quiz.phase = "finished";
    room.quiz.questionDeadlineAt = null;
    room.quiz.intermissionDeadlineAt = null;
    await room.save();
    emitRoomState(room);
    scheduleQuestionTimeout(room.roomId, null);
    return;
  }
  room.quiz.currentQuestionIndex += 1;
  room.quiz.phase = "question";
  room.quiz.intermissionDeadlineAt = null;
  room.quiz.questionDeadlineAt = Date.now() + room.quiz.timeLimitSeconds * 1000;
  await room.save();
  emitRoomState(room);
  scheduleQuestionTimeout(room.roomId, room.quiz.questionDeadlineAt);
}

async function advanceQuiz(room) {
  if (!room.quiz.started || room.quiz.finished) return;
  if (room.quiz.phase !== "intermission") {
    await beginIntermission(room);
    return;
  }
  await startNextQuestion(room);
}

function registerSocketAction(socket, eventName, action) {
  socket.on(eventName, async (payload = {}, acknowledge) => {
    try {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const room = await Room.findOne({ roomId: socket.data.auth.roomId });
          if (!room) throw new Error("This room no longer exists.");
          const participant = room.participants.find(
            (item) => item.participantId === socket.data.auth.participantId
          );
          if (!participant) throw new Error("You are no longer a member of this room.");
          await action({ room, participant, auth: socket.data.auth, payload });
          if (typeof acknowledge === "function") acknowledge({ ok: true });
          return;
        } catch (error) {
          if (error.name !== "VersionError" || attempt === 4) throw error;
        }
      }
    } catch (error) {
      console.error(`Socket action ${eventName} failed:`, error.message);
      notifySocketError(acknowledge, error.message || "The action could not be completed.");
    }
  });
}

app.get("/", (req, res) => res.redirect("/home"));

app.get("/home", (req, res) => {
  res.render("home");
});

app.post("/create-room", async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name || name.length > 40) {
    return res.status(400).send("Enter your name (up to 40 characters).");
  }

  try {
    let roomId;
    let roomExists = true;
    while (roomExists) {
      roomId = makeid(6);
      roomExists = Boolean(await Room.exists({ roomId }));
    }
    const creator = {
      participantId: crypto.randomUUID(),
      name,
      role: "professor",
    };
    const room = await Room.create({
      roomId,
      creatorId: creator.participantId,
      participants: [creator],
    });
    setAuthCookie(res, createAuth(room, creator, true));
    return res.redirect(`/room/${roomId}`);
  } catch (error) {
    console.error("Could not create room:", error.message);
    return res.status(500).send("Could not create the room. Please try again.");
  }
});

app.post("/join/student", async (req, res) => {
  const roomId = String(req.body.roomId || "").trim().toUpperCase();
  const name = String(req.body.name || "").trim();
  if (!isValidRoomId(roomId) || !name || name.length > 40) {
    return res.status(400).send("Enter a valid room code and a name up to 40 characters.");
  }

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).render("error");
    const participant = {
      participantId: crypto.randomUUID(),
      name,
      role: "student",
    };
    room.participants.push(participant);
    await room.save();
    setAuthCookie(res, createAuth(room, participant));
    return res.redirect(`/room/${roomId}`);
  } catch (error) {
    console.error("Could not join student room:", error.message);
    return res.status(500).send("Could not join the room. Please try again.");
  }
});

app.get("/room/:roomId", roomPageAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      clearAuthCookie(res);
      return res.status(404).render("error");
    }
    const participant = room.participants.find(
      (item) => item.participantId === req.roomAuth.participantId
    );
    if (!participant) {
      clearAuthCookie(res);
      return res.redirect("/home");
    }
    return res.render("room", {
      roomId: room.roomId,
      role: participant.role,
      name: participant.name,
      isCreator: participant.participantId === room.creatorId,
    });
  } catch (error) {
    console.error("Could not load room:", error.message);
    return res.status(500).send("Could not load the room.");
  }
});

app.post("/delete-room/:roomId", async (req, res) => {
  const auth = getAuthFromCookie(req.headers.cookie);
  if (!auth || auth.roomId !== req.params.roomId) {
    clearAuthCookie(res);
    return res.redirect("/home");
  }
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      clearAuthCookie(res);
      return res.redirect("/home");
    }
    if (room.creatorId !== auth.participantId) {
      return res.status(403).send("Only the room creator can delete this room.");
    }
    await Room.deleteOne({ roomId: room.roomId });
    const timer = questionTimers.get(room.roomId);
    if (timer) clearTimeout(timer);
    questionTimers.delete(room.roomId);
    io.to(room.roomId).emit("room:deleted");
    setTimeout(() => io.in(room.roomId).disconnectSockets(true), 500);
    clearAuthCookie(res);
    return res.redirect("/home");
  } catch (error) {
    console.error("Could not delete room:", error.message);
    return res.status(500).send("Could not delete the room.");
  }
});

app.post("/leave-room", (req, res) => {
  const auth = getAuthFromCookie(req.headers.cookie);
  if (auth?.isCreator) {
    return res.status(403).send("The room creator must close the lobby to leave.");
  }
  clearAuthCookie(res);
  res.redirect("/home");
});

io.use(async (socket, next) => {
  try {
    const auth = getAuthFromCookie(socket.handshake.headers.cookie);
    if (!auth) return next(new Error("Please join this room again."));
    const room = await Room.findOne({ roomId: auth.roomId });
    const participant = room?.participants.find(
      (item) => item.participantId === auth.participantId
    );
    if (!participant || participant.role !== auth.role) {
      return next(new Error("You are not a member of this room."));
    }
    socket.data.auth = { ...auth, name: participant.name };
    return next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    return next(new Error("Could not authenticate your room connection."));
  }
});

io.on("connection", (socket) => {
  const auth = socket.data.auth;
  socket.join(auth.roomId);
  rememberSocket(auth.roomId, auth.participantId, socket.id);

  Room.findOne({ roomId: auth.roomId }).then((room) => {
    if (room) emitRoomState(room);
  }).catch((error) => console.error("Could not load room state:", error.message));

  registerSocketAction(socket, "question:add", async ({ room, participant, payload }) => {
    if (participant.role !== "professor") throw new Error("Only professors can add questions.");
    if (room.quiz.started && !room.quiz.finished) throw new Error("Questions are locked during a quiz.");

    const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
    const options = Array.isArray(payload.options)
      ? payload.options.map((option) => typeof option === "string" ? option.trim() : "")
      : [];
    const correctOption =
      typeof payload.correctOption === "number" && Number.isInteger(payload.correctOption)
        ? payload.correctOption
        : typeof payload.correctOption === "string" && /^\d+$/.test(payload.correctOption)
          ? Number(payload.correctOption)
          : Number.NaN;
    if (!prompt || prompt.length > 500) throw new Error("Question must be 1–500 characters.");
    if (options.length < 2 || options.length > 6 || options.some((option) => !option || option.length > 120)) {
      throw new Error("Provide 2–6 non-empty options, each no longer than 120 characters.");
    }
    if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption >= options.length) {
      throw new Error("Choose the correct answer.");
    }

    room.questions.push({
      questionId: crypto.randomUUID(),
      prompt,
      options,
      correctOption,
      createdBy: participant.participantId,
    });
    await room.save();
    emitRoomState(room);
  });

  registerSocketAction(socket, "quiz:start", async ({ room, participant, payload }) => {
    if (participant.participantId !== room.creatorId) {
      throw new Error("Only the room creator can start or restart the quiz.");
    }
    if (room.questions.length === 0) throw new Error("Add at least one question first.");
    const timeLimitSeconds = Number(payload.timeLimitSeconds);
    if (!Number.isInteger(timeLimitSeconds) || timeLimitSeconds < 5 || timeLimitSeconds > 300) {
      throw new Error("Choose a question timer between 5 and 300 seconds.");
    }
    if (typeof payload.autoSwitch !== "boolean") {
      throw new Error("Choose whether questions should switch automatically.");
    }
    if (typeof payload.randomizeQuestions !== "boolean") {
      throw new Error("Choose whether to randomize the question order.");
    }
    room.questions.forEach((question) => {
      question.answers = [];
    });
    room.participants.forEach((member) => {
      member.score = 0;
    });
    room.quiz.started = true;
    room.quiz.finished = false;
    room.quiz.phase = "question";
    const questionIds = room.questions.map((question) => question.questionId);
    room.quiz.questionOrder = payload.randomizeQuestions ? shuffle(questionIds) : questionIds;
    room.quiz.currentQuestionIndex = 0;
    room.quiz.timeLimitSeconds = timeLimitSeconds;
    room.quiz.autoSwitch = payload.autoSwitch;
    room.quiz.randomizeQuestions = payload.randomizeQuestions;
    room.quiz.intermissionDeadlineAt = null;
    room.quiz.questionDeadlineAt = Date.now() + timeLimitSeconds * 1000;
    await room.save();
    emitRoomState(room);
    scheduleQuestionTimeout(room.roomId, room.quiz.questionDeadlineAt);
  });

  registerSocketAction(socket, "answer:submit", async ({ room, participant, payload }) => {
    if (participant.role !== "student") throw new Error("Only students can answer questions.");
    const question = getCurrentQuestion(room);
    if (!question) throw new Error("There is no active question.");
    if (payload.questionId !== question.questionId) {
      throw new Error("That question has ended. Please answer the current question.");
    }
    if (!room.quiz.questionDeadlineAt || Date.now() >= room.quiz.questionDeadlineAt) {
      await beginIntermission(room);
      throw new Error("Time is up. The scoreboard break has started.");
    }
    const selectedOption = payload.selectedOption;
    if (!Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption >= question.options.length) {
      throw new Error("Choose one of the available answers.");
    }
    if (question.answers.some((answer) => answer.participantId === participant.participantId)) {
      throw new Error("You have already answered this question.");
    }
    const isCorrect = selectedOption === question.correctOption;
    const pointsEarned = isCorrect
      ? Math.max(
          1,
          Math.ceil(
            1000 * (room.quiz.questionDeadlineAt - Date.now()) /
              (room.quiz.timeLimitSeconds * 1000)
          )
        )
      : 0;
    question.answers.push({ participantId: participant.participantId, selectedOption, isCorrect, pointsEarned });
    participant.score += pointsEarned;
    const students = room.participants.filter((member) => member.role === "student");
    const everyoneAnswered = students.length > 0 && students.every((student) =>
      question.answers.some((answer) => answer.participantId === student.participantId)
    );
    if (everyoneAnswered) {
      await beginIntermission(room);
    } else {
      await room.save();
      emitRoomState(room);
    }

    socket.emit("answer:result", { isCorrect, pointsEarned });
  });

  registerSocketAction(socket, "quiz:next", async ({ room, participant }) => {
    if (participant.participantId !== room.creatorId) {
      throw new Error("Only the room creator can advance the quiz.");
    }
    if (!room.quiz.started || room.quiz.finished) throw new Error("There is no active quiz.");
    await advanceQuiz(room);
  });

  registerSocketAction(socket, "participant:kick", async ({ room, participant, payload }) => {
    if (participant.participantId !== room.creatorId) {
      throw new Error("Only the room creator can remove participants.");
    }
    const targetId = String(payload.participantId || "");
    if (!targetId || targetId === room.creatorId) throw new Error("That participant cannot be removed.");
    const target = room.participants.find((member) => member.participantId === targetId);
    if (!target) throw new Error("Participant not found.");

    room.participants = room.participants.filter((member) => member.participantId !== targetId);
    room.questions.forEach((question) => {
      question.answers = question.answers.filter((answer) => answer.participantId !== targetId);
    });
    await room.save();

    const key = `${room.roomId}:${targetId}`;
    for (const socketId of connectedSockets.get(key) || []) {
      const targetSocket = io.sockets.sockets.get(socketId);
      if (targetSocket) {
        targetSocket.emit("participant:kicked");
        targetSocket.disconnect(true);
      }
    }
    emitRoomState(room);
  });

  socket.on("disconnect", () => {
    forgetSocket(auth.roomId, auth.participantId, socket.id);
  });
});

app.use((req, res) => res.status(404).render("error"));

function makeid(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += characters.charAt(crypto.randomInt(characters.length));
  }
  return result;
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    Room.find({ "quiz.started": true }).then(async (activeRooms) => {
      for (const room of activeRooms) {
        if (room.quiz.phase === "intermission" && !room.quiz.intermissionDeadlineAt) {
          room.quiz.intermissionDeadlineAt = Date.now() + INTERMISSION_SECONDS * 1000;
          await room.save();
        } else if (room.quiz.phase !== "intermission" && !room.quiz.questionDeadlineAt) {
          room.quiz.questionDeadlineAt = Date.now() + room.quiz.timeLimitSeconds * 1000;
          await room.save();
        }
        const deadlineAt = room.quiz.phase === "intermission"
          ? room.quiz.intermissionDeadlineAt
          : room.quiz.questionDeadlineAt;
        scheduleQuestionTimeout(room.roomId, deadlineAt);
      }
    }).catch((error) => console.error("Could not restore question timers:", error.message));
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exitCode = 1;
  });
