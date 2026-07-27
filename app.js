/* =====================================================
   CODING BATTLE ARENA
   MASTER CHALLENGE
   app.js
===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const CONFIG = {

    STORAGE_KEY: "masterChallenge",

    QUESTION_FOLDER: "data/",

    QUESTIONS_PER_SESSION: 10,

    DEFAULT_LEVEL: "hard"

};


/* =====================================================
   APPLICATION STATE
===================================================== */

const App = {

    player: null,

    session: null,

    questionBank: [],

    currentQuestionIndex: 0,

    timer: null

};


/* =====================================================
   CREATE SESSION
===================================================== */

function createSession(){

    return{

        playerName: "",

        level: CONFIG.DEFAULT_LEVEL,

        questions: [],

        currentQuestionIndex: 0,

        startTime: Date.now(),

        endTime: null,

        completed: false,

        answers: {},

        statistics:{

            total: CONFIG.QUESTIONS_PER_SESSION,

            passed:0,

            failed:0,

            accuracy:0,

            xp:0,

            coins:0

        }

    };

}


/* =====================================================
   SAVE SESSION
===================================================== */

function saveSession(){

    localStorage.setItem(

        CONFIG.STORAGE_KEY,

        JSON.stringify(App.session)

    );

}


/* =====================================================
   LOAD SESSION
===================================================== */

function loadSession(){

    let data =

    localStorage.getItem(

        CONFIG.STORAGE_KEY

    );

    if(data){

        App.session =

        JSON.parse(data);

    }

}


/* =====================================================
   DELETE SESSION
===================================================== */

function clearSession(){

    localStorage.removeItem(

        CONFIG.STORAGE_KEY

    );

}

/* =====================================================
   MODULE 2
   PLAYER MANAGER
===================================================== */


/* =====================================================
   LOAD PLAYER
===================================================== */

function loadPlayer(){

    if(typeof getPlayer==="function"){

        App.player=getPlayer();

    }

    else{

        App.player={

            id:"guest",

            name:"Guest",

            xp:0,

            coins:0,

            level:1

        };

    }

}


/* =====================================================
   UPDATE PLAYER PANEL
===================================================== */

function updatePlayerPanel(){

    updateElement(

        "playerName",

        App.player.name

    );

    updateElement(

        "playerXP",

        App.player.xp

    );

    updateElement(

        "playerCoins",

        App.player.coins

    );

    updateElement(

        "playerLevel",

        App.player.level

    );

}


/* =====================================================
   UPDATE SESSION STATS
===================================================== */

function updateStatistics(result){

    if(!result)return;

    App.session.statistics.passed+=

        result.passed?1:0;

    App.session.statistics.failed+=

        result.passed?0:1;

}


/* =====================================================
   ADD XP
===================================================== */

function addXP(xp){

    App.player.xp+=xp;

    App.session.statistics.xp+=xp;

}


/* =====================================================
   ADD COINS
===================================================== */

function addCoins(coins){

    App.player.coins+=coins;

    App.session.statistics.coins+=coins;

}


/* =====================================================
   SAVE PLAYER
===================================================== */

function savePlayer(){

    if(

        typeof savePlayerProfile===

        "function"

    ){

        savePlayerProfile(

            App.player

        );

    }

}


/* =====================================================
   COMPLETE QUESTION
===================================================== */

function completeQuestion(

    question,

    result

){

    if(!question)return;

    if(!result)return;

    App.session.answers[

        question.id

    ]={

        code:

        PythonEngine.getCode(),

        passed:

        result.passed,

        score:

        result.score,

        runtime:

        result.runtime,

        visiblePassed:

        result.visiblePassed,

        hiddenPassed:

        result.hiddenPassed,

        failedList:

        result.failedList,

        submitted:true

    };

    if(result.passed){

        addXP(

            question.xp||0

        );

        addCoins(

            question.coins||0

        );

    }

    updateStatistics(

        result

    );

    savePlayer();

    saveSession();

}


/* =====================================================
   PLAYER SUMMARY
===================================================== */

function getPlayerSummary(){

    return{

        player:App.player,

        statistics:

        App.session.statistics

    };

}
/* =====================================================
   MODULE 3
   QUESTION MANAGER
===================================================== */


/* =====================================================
   LOAD QUESTION BANK
===================================================== */

async function loadQuestionBank(

    level = CONFIG.DEFAULT_LEVEL

){

    try{

        const response = await fetch(

            CONFIG.QUESTION_FOLDER +

            level +

            ".json"

        );

        if(!response.ok){

            throw new Error(

                "Question bank not found."

            );

        }

        App.questionBank =

            await response.json();

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to load question bank."

        );

    }

}


/* =====================================================
   SHUFFLE ARRAY
===================================================== */

function shuffle(array){

    for(

        let i=array.length-1;

        i>0;

        i--

    ){

        let j=Math.floor(

            Math.random()*(i+1)

        );

        [

            array[i],

            array[j]

        ]=[

            array[j],

            array[i]

        ];

    }

}


/* =====================================================
   CREATE RANDOM SESSION
===================================================== */

function generateSessionQuestions(){

    let questions=[

        ...App.questionBank

    ];

    shuffle(questions);

    App.session.questions=

        questions.slice(

            0,

            CONFIG.QUESTIONS_PER_SESSION

        );

}


/* =====================================================
   GET CURRENT QUESTION
===================================================== */

function getCurrentQuestion(){

    return App.session.questions[

        App.currentQuestionIndex

    ];

}


/* =====================================================
   DISPLAY QUESTION
===================================================== */

function displayQuestion(){

    let question=

        getCurrentQuestion();

    if(!question){

        return;

    }

    updateElement(

        "questionNumber",

        App.currentQuestionIndex+1

    );

    updateElement(

        "totalQuestions",

        App.session.questions.length

    );

    updateElement(

        "questionTitle",

        question.title

    );

    updateElement(

        "questionTopic",

        question.topic

    );

    let description=

        document.getElementById(

            "questionDescription"

        );

    if(description){

        description.innerHTML=

            "<h3>Case Study</h3>"

            +

            "<p>"

            +

            question.caseStudy

            +

            "</p>"

            +

            "<h3>Problem Statement</h3>"

            +

            "<p>"

            +

            question.statement

            +

            "</p>";

    }

    PythonEngine.setQuestion(

        question

    );

    restoreSavedCode(

        question.id

    );

    updateNavigationButtons();

    updatePalette();

    updateProgress();

}


/* =====================================================
   RESTORE SAVED CODE
===================================================== */

function restoreSavedCode(

    questionId

){

    let answer=

        App.session.answers[

            questionId

        ];

    if(

        answer &&

        answer.code

    ){

        PythonEngine.setCode(

            answer.code

        );

    }

}


/* =====================================================
   NEXT QUESTION
===================================================== */

function nextQuestion(){

    if(

        App.currentQuestionIndex

        >=

        App.session.questions.length-1

    ){

        return;

    }

    App.currentQuestionIndex++;

    App.session.currentQuestionIndex=

        App.currentQuestionIndex;

    saveSession();

    displayQuestion();

}


/* =====================================================
   PREVIOUS QUESTION
===================================================== */

function previousQuestion(){

    if(

        App.currentQuestionIndex===0

    ){

        return;

    }

    App.currentQuestionIndex--;

    App.session.currentQuestionIndex=

        App.currentQuestionIndex;

    saveSession();

    displayQuestion();

}


/* =====================================================
   JUMP TO QUESTION
===================================================== */

function jumpToQuestion(index){

    if(

        index<0 ||

        index>=App.session.questions.length

    ){

        return;

    }

    App.currentQuestionIndex=index;

    App.session.currentQuestionIndex=index;

    saveSession();

    displayQuestion();

}

/* =====================================================
   MODULE 4
   PYTHON ENGINE INTEGRATION
===================================================== */


/* =====================================================
   SAVE CURRENT ANSWER
===================================================== */

function saveCurrentAnswer(){

    let question = getCurrentQuestion();

    if(!question){

        return;

    }

    if(!App.session.answers[question.id]){

        App.session.answers[question.id]={};

    }

    App.session.answers[question.id].code =

        PythonEngine.getCode();

    saveSession();

}


/* =====================================================
   LOAD CURRENT ANSWER
===================================================== */

function loadCurrentAnswer(){

    let question = getCurrentQuestion();

    if(!question){

        return;

    }

    let answer =

        App.session.answers[question.id];

    if(

        answer &&

        answer.code

    ){

        PythonEngine.setCode(

            answer.code

        );

    }

}


/* =====================================================
   RUN CURRENT QUESTION
===================================================== */

async function runCurrentQuestion(){

    let question =

        getCurrentQuestion();

    if(!question){

        return;

    }

    saveCurrentAnswer();

    disableRunButton();

    try{

        let result =

        await PythonEngine.run();

        completeQuestion(

            question,

            result

        );

        displayExecutionResult(

            result

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Execution Failed."

        );

    }

    enableRunButton();

}


/* =====================================================
   DISPLAY RESULT
===================================================== */

function displayExecutionResult(

    result

){

    updateElement(

        "score",

        result.score+"%"

    );

    updateElement(

        "runtime",

        result.runtime+" ms"

    );

    updateElement(

        "visiblePassed",

        result.visiblePassed

    );

    updateElement(

        "hiddenPassed",

        result.hiddenPassed

    );

    updateElement(

        "failedCases",

        result.failedCases

    );

    let status =

    document.getElementById(

        "resultStatus"

    );

    if(status){

        status.innerText=

        result.passed ?

        "PASS" :

        "FAIL";

        status.className=

        result.passed ?

        "pass" :

        "fail";

    }

}


/* =====================================================
   RUN BUTTON
===================================================== */

function disableRunButton(){

    let button=

    document.getElementById(

        "runButton"

    );

    if(button){

        button.disabled=true;

    }

}


function enableRunButton(){

    let button=

    document.getElementById(

        "runButton"

    );

    if(button){

        button.disabled=false;

    }

}


/* =====================================================
   RESET CURRENT QUESTION
===================================================== */

function resetCurrentQuestion(){

    if(

        confirm(

            "Reset your code?"

        )

    ){

        PythonEngine.resetQuestion();

        saveCurrentAnswer();

    }

}


/* =====================================================
   AUTO SAVE
===================================================== */

setInterval(

function(){

    saveCurrentAnswer();

},

10000);


/* =====================================================
   BUTTON EVENTS
===================================================== */

document.addEventListener(

"DOMContentLoaded",

function(){

    let run=

    document.getElementById(

        "runButton"

    );

    if(run){

        run.onclick=

        runCurrentQuestion;

    }

    let reset=

    document.getElementById(

        "resetButton"

    );

    if(reset){

        reset.onclick=

        resetCurrentQuestion;

    }

});


/* =====================================================
   MODULE 5
   CHALLENGE MANAGER
===================================================== */


/* =====================================================
   TIMER
===================================================== */

let challengeTime = 60 * 60;      // 60 Minutes
let timerId = null;


/* =====================================================
   START TIMER
===================================================== */

function startChallengeTimer(){

    if(timerId){

        clearInterval(timerId);

    }

    timerId = setInterval(function(){

        challengeTime--;

        updateTimer();

        if(challengeTime<=0){

            finishChallenge();

        }

    },1000);

}


/* =====================================================
   STOP TIMER
===================================================== */

function stopChallengeTimer(){

    if(timerId){

        clearInterval(timerId);

        timerId = null;

    }

}


/* =====================================================
   UPDATE TIMER
===================================================== */

function updateTimer(){

    let minutes =

    Math.floor(challengeTime/60);

    let seconds =

    challengeTime%60;

    updateElement(

        "timer",

        String(minutes).padStart(2,"0")

        +":"

        +

        String(seconds).padStart(2,"0")

    );

}


/* =====================================================
   CALCULATE FINAL RESULT
===================================================== */

function calculateFinalResult(){

    let stats =

    App.session.statistics;

    let total =

    stats.passed +

    stats.failed;

    stats.accuracy =

    total===0

    ?0

    :Math.round(

        stats.passed*100/total

    );

}


/* =====================================================
   FINISH CHALLENGE
===================================================== */

function finishChallenge(){

    stopChallengeTimer();

    saveCurrentAnswer();

    calculateFinalResult();

    App.session.completed = true;

    App.session.endTime =

    Date.now();

    saveSession();

    showFinalResult();

}


/* =====================================================
   FINAL RESULT
===================================================== */

function showFinalResult(){

    updateElement(

        "finalPassed",

        App.session.statistics.passed

    );

    updateElement(

        "finalFailed",

        App.session.statistics.failed

    );

    updateElement(

        "finalXP",

        App.session.statistics.xp

    );

    updateElement(

        "finalCoins",

        App.session.statistics.coins

    );

    updateElement(

        "finalAccuracy",

        App.session.statistics.accuracy+"%"

    );

    let panel =

    document.getElementById(

        "resultPanel"

    );

    if(panel){

        panel.style.display="block";

    }

}


/* =====================================================
   SUBMIT CHALLENGE
===================================================== */

function submitChallenge(){

    if(

        confirm(

            "Submit Challenge?"

        )

    ){

        finishChallenge();

    }

}


/* =====================================================
   RESTART
===================================================== */

function restartChallenge(){

    if(

        confirm(

            "Start New Challenge?"

        )

    ){

        clearSession();

        location.reload();

    }

}


/* =====================================================
   BUTTON EVENTS
===================================================== */

document.addEventListener(

"DOMContentLoaded",

function(){

    let submit =

    document.getElementById(

        "submitButton"

    );

    if(submit){

        submit.onclick=

        submitChallenge;

    }

});

/* =====================================================
   MODULE 6
   APPLICATION INITIALIZATION
===================================================== */


/* =====================================================
   START NEW CHALLENGE
===================================================== */

async function startChallenge(){

    updateElement(

        "loadingStatus",

        "Loading Python Engine..."

    );

    await PythonEngine.initialize();

    updateElement(

        "loadingStatus",

        "Loading Questions..."

    );

    await loadQuestionBank(

        CONFIG.DEFAULT_LEVEL

    );

    App.session =

    createSession();

    generateSessionQuestions();

    saveSession();

    createPalette();

    displayQuestion();

    updatePlayerPanel();

    startChallengeTimer();

    updateElement(

        "loadingStatus",

        "Ready"

    );

}


/* =====================================================
   RESUME CHALLENGE
===================================================== */

async function resumeChallenge(){

    updateElement(

        "loadingStatus",

        "Restoring Session..."

    );

    await PythonEngine.initialize();

    createPalette();

    displayQuestion();

    updatePlayerPanel();

    startChallengeTimer();

    updateElement(

        "loadingStatus",

        "Ready"

    );

}


/* =====================================================
   APPLICATION START
===================================================== */

async function initializeApplication(){

    try{

        loadPlayer();

        loadSession();

        if(

            App.session &&

            !App.session.completed

        ){

            App.currentQuestionIndex =

            App.session.currentQuestionIndex || 0;

            await resumeChallenge();

        }

        else{

            await startChallenge();

        }

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to start Master Challenge."

        );

    }

}


/* =====================================================
   WINDOW EVENTS
===================================================== */

window.addEventListener(

"beforeunload",

function(){

    saveCurrentAnswer();

    saveSession();

});


/* =====================================================
   KEYBOARD SHORTCUTS
===================================================== */

document.addEventListener(

"keydown",

function(event){

    if(

        event.ctrlKey &&

        event.key==="s"

    ){

        event.preventDefault();

        saveCurrentAnswer();

    }

    if(

        event.key==="F9"

    ){

        event.preventDefault();

        runCurrentQuestion();

    }

});


/* =====================================================
   APPLICATION ENTRY
===================================================== */

document.addEventListener(

"DOMContentLoaded",

initializeApplication

);
