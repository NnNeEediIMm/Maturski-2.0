const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    participantId: { type: String, required: true },
    selectedOption: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    prompt: { type: String, required: true, trim: true, maxlength: 500 },
    options: { type: [String], required: true },
    correctOption: { type: Number, required: true },
    createdBy: { type: String, required: true },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

const participantSchema = new mongoose.Schema(
  {
    participantId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    role: { type: String, enum: ["professor", "student"], required: true },
    score: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true, trim: true },
    creatorId: { type: String, required: true },
    participants: { type: [participantSchema], default: [] },
    questions: { type: [questionSchema], default: [] },
    quiz: {
      started: { type: Boolean, default: false },
      finished: { type: Boolean, default: false },
      phase: { type: String, enum: ["question", "intermission", "finished"], default: "question" },
      questionOrder: { type: [String], default: [] },
      currentQuestionIndex: { type: Number, default: 0 },
      timeLimitSeconds: { type: Number, default: 30 },
      questionDeadlineAt: { type: Number, default: null },
      intermissionDeadlineAt: { type: Number, default: null },
      autoSwitch: { type: Boolean, default: true },
      randomizeQuestions: { type: Boolean, default: true },
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

module.exports = mongoose.model("Room", roomSchema);
