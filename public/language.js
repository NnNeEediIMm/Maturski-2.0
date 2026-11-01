(() => {
    const translations = {
        en: {
            homeTitle: "Kwizup - Home",
            roomPageTitle: "Kwizup - Room {roomId}",
            createRoom: "Create a room",
            yourName: "Your name:",
            enterName: "Enter your name",
            createRoomButton: "Create room",
            forStudents: "For students",
            roomCode: "Room code:",
            roomCodePlaceholder: "Room code",
            joinRoom: "Join room",
            chooseLanguage: "Choose language",
            homeLink: "Kwizup home",
            room: "Room",
            signedInAs: "Signed in as",
            professorRole: "professor",
            studentRole: "student",
            leaveLobby: "Leave to lobby",
            closeLobby: "Close lobby & delete data",
            confirmDelete: "Close this lobby and permanently delete the room, questions, and scores?",
            quizRoom: "Quiz room",
            connecting: "Connecting to room…",
            timePerQuestion: "Time per question",
            seconds: "{count} seconds",
            autoSwitch: "Automatically switch questions",
            randomize: "Randomize question order",
            startQuiz: "Start quiz",
            endRound: "End round & show scoreboard",
            addQuestion: "Add a question",
            question: "Question",
            answerOptionsLegend: "Answer options (choose the correct one)",
            addAnswerOption: "Add answer option",
            chooseTwoToSix: "Choose 2–6 options and select the correct answer.",
            addQuestionButton: "Add question",
            questionsInRoom: "Questions in this room",
            scoreboard: "Scoreboard",
            peopleInRoom: "People in the room",
            roundComplete: "Round complete — scoreboard",
            quizComplete: "Quiz complete!",
            finalScoresSaved: "Final scores are saved.",
            returnToLobby: "Return to lobby",
            waitingForCreator: "Waiting for the room creator to start the quiz.",
            connected: "Connected",
            couldNotComplete: "Could not complete that action.",
            addedBy: "{prompt} — added by {author}",
            answered: " — answered",
            waiting: " — waiting",
            creatorSuffix: " (creator)",
            remove: "Remove",
            removeOption: "Remove option {number}",
            correctOption: "Option {number} is correct",
            answerOption: "Answer option {number}",
            optionPlaceholder: "Option {number}",
            first: "{number}st",
            second: "{number}nd",
            third: "{number}rd",
            ordinal: "{number}th",
            point: "point",
            points: "points",
            pointsBosnianOne: "bod",
            pointsBosnianFew: "boda",
            pointsBosnianMany: "bodova",
            emptyScores: "Student scores will appear here.",
            timeRemaining: "Time remaining",
            scoreboardBreak: "Scoreboard break",
            quizCompleteStatus: "Quiz complete",
            questionsReady: "{count} question{suffix} ready",
            nextRoundIn: " — next round in {seconds}s",
            lastQuestion: "This was the last question. The final standings are shown below.",
            automaticNext: "Next question starts automatically after the five-second break.",
            creatorNext: "The break is over. Start the next question when everyone is ready.",
            professorNext: "The professor will start the next question after the break.",
            finishQuiz: "Finish quiz",
            startNextQuestion: "Start next question",
            questionProgress: "Question {number} of {count}",
            studentsAnswered: "{answered} of {total} students have answered",
            correctAnswer: "Correct! +{score}.",
            incorrectAnswer: "Not quite. The answer has been recorded.",
            finalScoreStudent: "Your final score is saved. Returning to the lobby shortly…",
            finalScoreProfessor: "Final student scores are saved. You can close the lobby when you are ready.",
            winner: "{name} wins with {score}!",
            tie: "It's a tie! {names} share the win with {score}.",
            noStudents: "No students joined this quiz.",
            questionAdded: "Question added.",
            importQuestions: "Import questions",
            importQuestionsTitle: "Import questions",
            importQuestionsInstructions: "Paste one question per line, using | between the question and its answers.",
            firstAnswerCorrect: "Each line needs 2–6 answers. The first answer will be marked as correct.",
            pasteQuestions: "Questions",
            cancel: "Cancel",
            importEmpty: "Paste at least one question.",
            importLineFormat: "Line {line}: use a question followed by 2–6 answers, separated by |.",
            importLineQuestion: "Line {line}: the question must contain 1–500 characters.",
            importLineAnswers: "Line {line}: each answer must contain 1–120 characters.",
            importProgress: "Adding questions: {added} of {total}…",
            importCompleteOne: "Added 1 question.",
            importComplete: "Added {count} questions.",
            importPartial: "Added {added} of {total}. Stopped at line {line}: {error}",
            importTimedOut: "The server did not respond in time. Check the question list before retrying.",
            serverErrors: {
                "Could not complete that action.": "Could not complete that action.",
                "Please wait for the five-second scoreboard break to finish.": "Please wait for the five-second scoreboard break to finish.",
                "This room no longer exists.": "This room no longer exists.",
                "You are no longer a member of this room.": "You are no longer a member of this room.",
                "Only professors can add questions.": "Only professors can add questions.",
                "Questions are locked during a quiz.": "Questions are locked during a quiz.",
                "Question must be 1–500 characters.": "Question must be 1–500 characters.",
                "Provide 2–6 non-empty options, each no longer than 120 characters.": "Provide 2–6 non-empty options, each no longer than 120 characters.",
                "Choose the correct answer.": "Choose the correct answer.",
                "Only the room creator can start or restart the quiz.": "Only the room creator can start or restart the quiz.",
                "Add at least one question first.": "Add at least one question first.",
                "Choose a question timer between 5 and 300 seconds.": "Choose a question timer between 5 and 300 seconds.",
                "Choose whether questions should switch automatically.": "Choose whether questions should switch automatically.",
                "Choose whether to randomize the question order.": "Choose whether to randomize the question order.",
                "Only students can answer questions.": "Only students can answer questions.",
                "There is no active question.": "There is no active question.",
                "That question has ended. Please answer the current question.": "That question has ended. Please answer the current question.",
                "Time is up. The scoreboard break has started.": "Time is up. The scoreboard break has started.",
                "Choose one of the available answers.": "Choose one of the available answers.",
                "You have already answered this question.": "You have already answered this question.",
                "Only the room creator can advance the quiz.": "Only the room creator can advance the quiz.",
                "Only the room creator can remove participants.": "Only the room creator can remove participants.",
                "That participant cannot be removed.": "That participant cannot be removed.",
                "Participant not found.": "Participant not found."
            }
        },
        bs: {
            homeTitle: "Kwizup - Početna",
            roomPageTitle: "Kwizup - Soba {roomId}",
            createRoom: "Kreiraj sobu",
            yourName: "Vaše ime:",
            enterName: "Unesite svoje ime",
            createRoomButton: "Kreiraj sobu",
            forStudents: "Za učenike",
            roomCode: "Kod sobe:",
            roomCodePlaceholder: "Kod sobe",
            joinRoom: "Pridruži se sobi",
            chooseLanguage: "Odaberite jezik",
            homeLink: "Kwizup početna",
            room: "Soba",
            signedInAs: "Prijavljeni ste kao",
            professorRole: "profesor",
            studentRole: "učenik",
            leaveLobby: "Napusti sobu",
            closeLobby: "Zatvori sobu i izbriši podatke",
            confirmDelete: "Želite li zatvoriti sobu i trajno izbrisati sobu, pitanja i rezultate?",
            quizRoom: "Kviz soba",
            connecting: "Povezivanje sa sobom…",
            timePerQuestion: "Vrijeme po pitanju",
            seconds: "{count} sekundi",
            autoSwitch: "Automatski prelazak na sljedeće pitanje",
            randomize: "Nasumičan redoslijed pitanja",
            startQuiz: "Započni kviz",
            endRound: "Završi krug i prikaži rezultate",
            addQuestion: "Dodaj pitanje",
            question: "Pitanje",
            answerOptionsLegend: "Odgovori (izaberite tačan odgovor)",
            addAnswerOption: "Dodaj odgovor",
            chooseTwoToSix: "Izaberite 2–6 odgovora i označite tačan odgovor.",
            addQuestionButton: "Dodaj pitanje",
            questionsInRoom: "Pitanja u ovoj sobi",
            scoreboard: "Tabela rezultata",
            peopleInRoom: "Učesnici u sobi",
            roundComplete: "Krug je završen — rezultati",
            quizComplete: "Kviz je završen!",
            finalScoresSaved: "Konačni rezultati su sačuvani.",
            returnToLobby: "Povratak na početnu",
            waitingForCreator: "Čeka se da kreator sobe započne kviz.",
            connected: "Povezano",
            couldNotComplete: "Nije moguće izvršiti ovu radnju.",
            addedBy: "{prompt} — dodao/la {author}",
            answered: " — odgovorio/la",
            waiting: " — čeka",
            creatorSuffix: " (kreator)",
            remove: "Ukloni",
            removeOption: "Ukloni odgovor {number}",
            correctOption: "Odgovor {number} je tačan",
            answerOption: "Odgovor {number}",
            optionPlaceholder: "Odgovor {number}",
            first: "{number}.",
            second: "{number}.",
            third: "{number}.",
            ordinal: "{number}.",
            point: "bod",
            points: "bodova",
            pointsBosnianOne: "bod",
            pointsBosnianFew: "boda",
            pointsBosnianMany: "bodova",
            emptyScores: "Rezultati učenika će se prikazati ovdje.",
            timeRemaining: "Preostalo vrijeme",
            scoreboardBreak: "Pauza za prikaz rezultata",
            quizCompleteStatus: "Kviz je završen",
            questionsReady: "Spremno pitanja: {count}",
            nextRoundIn: " — sljedeći krug za {seconds} s",
            lastQuestion: "Ovo je bilo posljednje pitanje. Konačni rezultati su prikazani ispod.",
            automaticNext: "Sljedeće pitanje počinje automatski nakon pauze od pet sekundi.",
            creatorNext: "Pauza je završena. Započnite sljedeće pitanje kada svi budu spremni.",
            professorNext: "Profesor će započeti sljedeće pitanje nakon pauze.",
            finishQuiz: "Završi kviz",
            startNextQuestion: "Započni sljedeće pitanje",
            questionProgress: "Pitanje {number} od {count}",
            studentsAnswered: "Odgovorilo je {answered} od {total} učenika",
            correctAnswer: "Tačno! +{score}.",
            incorrectAnswer: "Nije tačno. Odgovor je zabilježen.",
            finalScoreStudent: "Vaš konačni rezultat je sačuvan. Uskoro se vraćate u sobu…",
            finalScoreProfessor: "Konačni rezultati učenika su sačuvani. Možete zatvoriti sobu kada budete spremni.",
            winner: "{name} je pobjednik sa {score}!",
            tie: "Neriješeno! {names} dijele prvo mjesto sa {score}.",
            noStudents: "Nijedan učenik se nije pridružio kvizu.",
            questionAdded: "Pitanje je dodano.",
            importQuestions: "Uvezi pitanja",
            importQuestionsTitle: "Uvoz pitanja",
            importQuestionsInstructions: "Zalijepite jedno pitanje u svaki red. Koristite | između pitanja i odgovora.",
            firstAnswerCorrect: "Svaki red treba sadržavati 2–6 odgovora. Prvi odgovor će biti označen kao tačan.",
            pasteQuestions: "Pitanja",
            cancel: "Odustani",
            importEmpty: "Zalijepite barem jedno pitanje.",
            importLineFormat: "Red {line}: unesite pitanje i 2–6 odgovora, razdvojene znakom |.",
            importLineQuestion: "Red {line}: pitanje mora sadržavati od 1 do 500 znakova.",
            importLineAnswers: "Red {line}: svaki odgovor mora sadržavati od 1 do 120 znakova.",
            importProgress: "Dodavanje pitanja: {added} od {total}…",
            importCompleteOne: "Dodano je jedno pitanje.",
            importComplete: "Dodano pitanja: {count}.",
            importPartial: "Dodano {added} od {total}. Uvoz je zaustavljen na redu {line}: {error}",
            importTimedOut: "Server nije odgovorio na vrijeme. Provjerite listu pitanja prije ponovnog pokušaja.",
            serverErrors: {
                "Could not complete that action.": "Nije moguće izvršiti ovu radnju.",
                "Please wait for the five-second scoreboard break to finish.": "Sačekajte da se završi pauza od pet sekundi.",
                "This room no longer exists.": "Ova soba više ne postoji.",
                "You are no longer a member of this room.": "Više niste član ove sobe.",
                "Only professors can add questions.": "Samo profesori mogu dodavati pitanja.",
                "Questions are locked during a quiz.": "Pitanja su zaključana tokom kviza.",
                "Question must be 1–500 characters.": "Pitanje mora sadržavati od 1 do 500 znakova.",
                "Provide 2–6 non-empty options, each no longer than 120 characters.": "Unesite 2–6 odgovora; svaki mora sadržavati najviše 120 znakova.",
                "Choose the correct answer.": "Izaberite tačan odgovor.",
                "Only the room creator can start or restart the quiz.": "Samo kreator sobe može započeti ili ponovo pokrenuti kviz.",
                "Add at least one question first.": "Prvo dodajte barem jedno pitanje.",
                "Choose a question timer between 5 and 300 seconds.": "Izaberite trajanje pitanja između 5 i 300 sekundi.",
                "Choose whether questions should switch automatically.": "Odaberite da li se pitanja automatski mijenjaju.",
                "Choose whether to randomize the question order.": "Odaberite da li se redoslijed pitanja nasumično mijenja.",
                "Only students can answer questions.": "Samo učenici mogu odgovarati na pitanja.",
                "There is no active question.": "Trenutno nema aktivnog pitanja.",
                "That question has ended. Please answer the current question.": "To pitanje je završeno. Odgovorite na trenutno pitanje.",
                "Time is up. The scoreboard break has started.": "Vrijeme je isteklo. Počela je pauza za prikaz rezultata.",
                "Choose one of the available answers.": "Izaberite jedan od ponuđenih odgovora.",
                "You have already answered this question.": "Već ste odgovorili na ovo pitanje.",
                "Only the room creator can advance the quiz.": "Samo kreator sobe može nastaviti kviz.",
                "Only the room creator can remove participants.": "Samo kreator sobe može uklanjati učesnike.",
                "That participant cannot be removed.": "Nije moguće ukloniti tog učesnika.",
                "Participant not found.": "Učesnik nije pronađen."
            }
        }
    };

    const languageButtons = document.querySelectorAll("[data-language]");
    let savedLanguage = "en";
    try {
        savedLanguage = localStorage.getItem("kwizup-language") || "en";
    } catch (error) {
        console.error("Could not read the saved language preference:", error);
    }
    let currentLanguage = savedLanguage === "bs" ? "bs" : "en";

    function translate(key, values = {}) {
        const template = translations[currentLanguage][key] || translations.en[key] || key;
        return template.replace(/\{(\w+)\}/g, (match, name) =>
            Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match
        );
    }

    function applyLanguage() {
        document.documentElement.lang = currentLanguage;
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const values = {};
            if (element.dataset.i18nCount !== undefined) values.count = element.dataset.i18nCount;
            if (element.dataset.i18nRoomId !== undefined) values.roomId = element.dataset.i18nRoomId;
            element.textContent = translate(element.dataset.i18n, values);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
            element.placeholder = translate(element.dataset.i18nPlaceholder);
        });
        document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
            element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel));
        });
        languageButtons.forEach((button) => {
            const selected = button.dataset.language === currentLanguage;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
        window.dispatchEvent(new CustomEvent("languagechange", { detail: { language: currentLanguage } }));
    }

    languageButtons.forEach((button) => {
        button.addEventListener("click", () => {
            currentLanguage = button.dataset.language;
            try {
                localStorage.setItem("kwizup-language", currentLanguage);
            } catch (error) {
                console.error("Could not save the language preference:", error);
            }
            applyLanguage();
        });
    });

    window.translate = translate;
    window.translateServerError = (message) =>
        translations[currentLanguage].serverErrors[message] || message;
    window.getCurrentLanguage = () => currentLanguage;
    applyLanguage();
})();
