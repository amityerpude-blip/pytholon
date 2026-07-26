/* =====================================================
   CODING BATTLE ARENA
   PYTHON MASTER CHALLENGE
   app.js
   Version : 3.0
===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const CONFIG = {

    STORAGE_KEY: "masterChallengeSession",

    QUESTION_FOLDER: "data/",

    DEFAULT_LEVEL: "hard",

    QUESTIONS_PER_SESSION: 10,

    PYODIDE_VERSION: "0.25.1",

    PASS_PERCENTAGE: 100,

    EDITOR_THEME: "vs-dark",

    EDITOR_LANGUAGE: "python"

};


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let pyodide = null;

let editor = null;

let player = null;

let session = null;

let questionBank = [];

let currentQuestion = null;

let currentQuestionIndex = 0;

let timerInterval = null;

let challengeStarted = false;

let pythonEngineReady = false;


/* =====================================================
   SESSION TEMPLATE
===================================================== */

function createSessionObject() {

    return {

        playerName: "",

        level: CONFIG.DEFAULT_LEVEL,

        questions: [],

        currentQuestionIndex: 0,

        startTime: null,

        endTime: null,

        completed: false,

        xp: 0,

        coins: 0,

        answers: {},

        statistics: {

            total: 0,

            passed: 0,

            failed: 0,

            accuracy: 0,

            timeTaken: 0

        }

    };

}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveSession() {

    localStorage.setItem(

        CONFIG.STORAGE_KEY,

        JSON.stringify(session)

    );

}


function loadSession() {

    let data = localStorage.getItem(

        CONFIG.STORAGE_KEY

    );

    if (data) {

        return JSON.parse(data);

    }

    return null;

}


function deleteSession() {

    localStorage.removeItem(

        CONFIG.STORAGE_KEY

    );

}


/* =====================================================
   PLAYER
===================================================== */

function loadPlayerProfile() {

    if (typeof getPlayer === "function") {

        player = getPlayer();

    }

    else {

        player = {

            name: "Guest"

        };

    }

}


/* =====================================================
   UPDATE PLAYER PANEL
===================================================== */

function updatePlayerPanel() {

    let label =

        document.getElementById(

            "playerName"

        );

    if (label) {

        label.innerText = player.name;

    }

}


/* =====================================================
   QUESTION BANK
===================================================== */

async function loadQuestionBank(

    level = CONFIG.DEFAULT_LEVEL

) {

    try {

        const response =

            await fetch(

                CONFIG.QUESTION_FOLDER +

                level +

                ".json"

            );

        questionBank =

            await response.json();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load question bank.");

    }

}


/* =====================================================
   SHUFFLE
===================================================== */

function shuffle(array) {

    for (

        let i = array.length - 1;

        i > 0;

        i--

    ) {

        let j = Math.floor(

            Math.random() *

            (i + 1)

        );

        [array[i], array[j]] =

        [array[j], array[i]];

    }

}


/* =====================================================
   CREATE RANDOM SESSION
===================================================== */

function createRandomSession() {

    let questions =

        [...questionBank];

    shuffle(questions);

    session.questions =

        questions.slice(

            0,

            CONFIG.QUESTIONS_PER_SESSION

        );

}


/* =====================================================
   CREATE NEW SESSION
===================================================== */

function createNewSession() {

    session =

        createSessionObject();

    session.playerName =

        player.name;

    session.startTime =

        Date.now();

    createRandomSession();

    saveSession();

}


/* =====================================================
   RESUME SESSION
===================================================== */

function resumeSession(savedSession) {

    session = savedSession;

    currentQuestionIndex =

        session.currentQuestionIndex;

}


/* =====================================================
   INITIALIZATION
===================================================== */

async function initializeMasterChallenge() {

    loadPlayerProfile();

    updatePlayerPanel();

    await loadQuestionBank();

    let saved =

        loadSession();

    if (

        saved &&

        !saved.completed

    ) {

        resumeSession(saved);

    }

    else {

        createNewSession();

    }

    /*
        Part 2 will continue
        from here.
    */

}


/* =====================================================
   START APPLICATION
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeMasterChallenge

);

/* =====================================================
   MONACO EDITOR MODULE
   Version : 3.0
===================================================== */


/* =====================================================
   LOAD MONACO
===================================================== */

function initializeEditor(initialCode = "") {

    if (typeof monaco === "undefined") {

        console.error("Monaco Editor not loaded.");

        return;

    }

    if (editor) {

        editor.dispose();

    }

    editor = monaco.editor.create(

        document.getElementById("codingArea"),

        {

            value: initialCode,

            language: CONFIG.EDITOR_LANGUAGE,

            theme: CONFIG.EDITOR_THEME,

            automaticLayout: true,

            fontSize: 16,

            tabSize: 4,

            insertSpaces: true,

            wordWrap: "on",

            minimap: {

                enabled: false

            },

            scrollBeyondLastLine: false,

            lineNumbers: "on",

            folding: true,

            autoIndent: "full",

            formatOnPaste: true,

            formatOnType: true,

            renderWhitespace: "selection",

            renderLineHighlight: "all"

        }

    );

    registerEditorEvents();

}


/* =====================================================
   REGISTER EVENTS
===================================================== */

function registerEditorEvents() {

    if (!editor) return;

    editor.onDidChangeModelContent(function () {

        saveCurrentCode();

    });

}


/* =====================================================
   SAVE CURRENT CODE
===================================================== */

function saveCurrentCode() {

    if (!editor) return;

    if (!currentQuestion) return;

    if (!session.answers[currentQuestion.id]) {

        session.answers[currentQuestion.id] = {

            code: "",

            passed: false,

            submitted: false,

            score: 0,

            executionTime: 0,

            visiblePassed: 0,

            hiddenPassed: 0

        };

    }

    session.answers[currentQuestion.id].code =

        editor.getValue();

    saveSession();

}


/* =====================================================
   RESTORE SAVED CODE
===================================================== */

function restoreCurrentCode() {

    if (!editor) return;

    if (!currentQuestion) return;

    let answer =

        session.answers[currentQuestion.id];

    if (answer) {

        editor.setValue(answer.code);

    }

    else {

        editor.setValue(

            currentQuestion.starterCode

        );

    }

}


/* =====================================================
   GET CODE
===================================================== */

function getEditorCode() {

    if (!editor) {

        return "";

    }

    return editor.getValue();

}


/* =====================================================
   SET CODE
===================================================== */

function setEditorCode(code) {

    if (!editor) return;

    editor.setValue(code);

}


/* =====================================================
   RESET EDITOR
===================================================== */

function resetEditor() {

    if (!currentQuestion) return;

    setEditorCode(

        currentQuestion.starterCode

    );

    saveCurrentCode();

}


/* =====================================================
   READ ONLY MODE
===================================================== */

function lockEditor() {

    if (!editor) return;

    editor.updateOptions({

        readOnly: true

    });

}


function unlockEditor() {

    if (!editor) return;

    editor.updateOptions({

        readOnly: false

    });

}


/* =====================================================
   CHANGE THEME
===================================================== */

function changeEditorTheme(theme) {

    monaco.editor.setTheme(theme);

}


/* =====================================================
   CURSOR POSITION
===================================================== */

function getCursorPosition() {

    if (!editor) return null;

    return editor.getPosition();

}


function setCursorPosition(position) {

    if (!editor) return;

    editor.setPosition(position);

}


/* =====================================================
   CLEAR OUTPUT WINDOW
===================================================== */

function clearConsole() {

    let output =

        document.getElementById(

            "programOutput"

        );

    if (!output) return;

    output.textContent = "";

}


/* =====================================================
   PRINT OUTPUT
===================================================== */

function printConsole(text) {

    let output =

        document.getElementById(

            "programOutput"

        );

    if (!output) return;

    output.textContent += text + "\n";

}


/* =====================================================
   SHOW ERROR
===================================================== */

function printError(error) {

    let output =

        document.getElementById(

            "programOutput"

        );

    if (!output) return;

    output.textContent =

        "Runtime Error\n\n" +

        error;

}


/* =====================================================
   STATUS BAR
===================================================== */

function updateStatus(message) {

    let status =

        document.getElementById(

            "statusBar"

        );

    if (!status) return;

    status.innerText = message;

}


/* =====================================================
   EDITOR READY
===================================================== */

function prepareEditor(question) {

    currentQuestion = question;

    initializeEditor(

        question.starterCode

    );

    restoreCurrentCode();

}

