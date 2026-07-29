/* =====================================================
   CODING BATTLE ARENA
   MASTER CHALLENGE
   app.js
   Version : 2.0
===================================================== */



/* =====================================================
   APPLICATION STATE
===================================================== */

const App = {

    player : null,

    session : null,

    questionBank : [],

    currentQuestionIndex : 0,

    timerId : null

};



/* =====================================================
   COMMON UTILITIES
===================================================== */

function $(id){

    return document.getElementById(id);

}



function updateElement(id,value){

    const element = $(id);

    if(element){

        element.textContent = value;

    }

}



function updateHTML(id,value){

    const element = $(id);

    if(element){

        element.innerHTML = value;

    }

}



function showElement(id){

    const element = $(id);

    if(element){

        element.style.display = "block";

    }

}



function hideElement(id){

    const element = $(id);

    if(element){

        element.style.display = "none";

    }

}



function enableElement(id){

    const element = $(id);

    if(element){

        element.disabled = false;

    }

}



function disableElement(id){

    const element = $(id);

    if(element){

        element.disabled = true;

    }

}



/* =====================================================
   ARRAY UTILITIES
===================================================== */

function shuffle(array){

    for(

        let i=array.length-1;

        i>0;

        i--

    ){

        const j = Math.floor(

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
   QUESTION HELPERS
===================================================== */

function getCurrentQuestion(){

    return App.session.questions[

        App.currentQuestionIndex

    ];

}



function getCurrentAnswer(){

    const question =

    getCurrentQuestion();

    if(!question){

        return null;

    }

    return App.session.answers[

        question.id

    ];

}



/* =====================================================
   READY CHECK
===================================================== */

function applicationReady(){

    return(

        App.player!==null &&

        App.session!==null &&

        PythonEngine.isReady()

    );

}



/* =====================================================
   END OF PART 1
===================================================== */
/* =====================================================
   PLAYER MANAGER
===================================================== */



/* =====================================================
   LOAD PLAYER
===================================================== */

function loadPlayer(){

    App.player = {

        name :

            localStorage.getItem("playerName")

            || "Guest",

        xp :

            Number(

                localStorage.getItem("playerXP")

                || 0

            ),

        coins :

            Number(

                localStorage.getItem("playerCoins")

                || 0

            ),

        level :

            Number(

                localStorage.getItem("playerLevel")

                || 1

            )

    };

}



/* =====================================================
   SAVE PLAYER
===================================================== */

function savePlayer(){

    localStorage.setItem(

        "playerName",

        App.player.name

    );



    localStorage.setItem(

        "playerXP",

        App.player.xp

    );



    localStorage.setItem(

        "playerCoins",

        App.player.coins

    );



    localStorage.setItem(

        "playerLevel",

        App.player.level

    );

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
   ADD XP
===================================================== */

function addXP(value){

    value = Number(value) || 0;

    App.player.xp += value;

    savePlayer();

    updatePlayerPanel();

}



/* =====================================================
   ADD COINS
===================================================== */

function addCoins(value){

    value = Number(value) || 0;

    App.player.coins += value;

    savePlayer();

    updatePlayerPanel();

}



/* =====================================================
   RESET PLAYER
===================================================== */

function resetPlayer(){

    App.player = {

        name : "Guest",

        xp : 0,

        coins : 0,

        level : 1

    };



    savePlayer();

    updatePlayerPanel();

}



/* =====================================================
   LEVEL CALCULATION
===================================================== */

function updatePlayerLevel(){

    const newLevel =

        Math.max(

            1,

            Math.floor(

                App.player.xp / 1000

            ) + 1

        );



    if(

        newLevel >

        App.player.level

    ){

        App.player.level = newLevel;

        savePlayer();

        updatePlayerPanel();

    }

}



/* =====================================================
   GIVE REWARD
===================================================== */

function giveReward(

    xp,

    coins

){

    addXP(

        xp || CONFIG.DEFAULT_XP

    );



    addCoins(

        coins || CONFIG.DEFAULT_COINS

    );



    updatePlayerLevel();

}



/* =====================================================
   END OF PLAYER MANAGER
===================================================== */
/* =====================================================
   SESSION MANAGER
===================================================== */



/* =====================================================
   CREATE SESSION
===================================================== */

function createSession(){

    return{

        level : CONFIG.DEFAULT_LEVEL,

        questions : [],

        answers : {},

        currentQuestionIndex : 0,

        completed : false,

        startTime : Date.now(),

        endTime : null,

        statistics : {

            passed : 0,

            failed : 0,

            xp : 0,

            coins : 0,

            accuracy : 0

        }

    };

}



/* =====================================================
   SAVE SESSION
===================================================== */

function saveSession(){

    if(!App.session){

        return;

    }

    localStorage.setItem(

        CONFIG.STORAGE_KEY,

        JSON.stringify(

            App.session

        )

    );

}



/* =====================================================
   LOAD SESSION
===================================================== */

function loadSession(){

    const data =

        localStorage.getItem(

            CONFIG.STORAGE_KEY

        );

    if(!data){

        return;

    }

    try{

        App.session =

        JSON.parse(data);

    }

    catch(error){

        console.error(

            "Session Load Error",

            error

        );

        clearSession();

    }

}



/* =====================================================
   CLEAR SESSION
===================================================== */

function clearSession(){

    localStorage.removeItem(

        CONFIG.STORAGE_KEY

    );

    App.session = null;

}



/* =====================================================
   SESSION EXISTS
===================================================== */

function sessionExists(){

    return App.session!==null;

}



/* =====================================================
   START NEW SESSION
===================================================== */

function startNewSession(){

    App.session =

    createSession();

    App.currentQuestionIndex = 0;

    saveSession();

}



/* =====================================================
   RESUME SESSION
===================================================== */

function resumeSession(){

    if(

        !App.session

    ){

        return;

    }

    App.currentQuestionIndex =

    App.session.currentQuestionIndex || 0;

}



/* =====================================================
   UPDATE SESSION INDEX
===================================================== */

function updateSessionIndex(){

    if(!App.session){

        return;

    }

    App.session.currentQuestionIndex =

    App.currentQuestionIndex;

}



/* =====================================================
   SESSION COMPLETE
===================================================== */

function completeSession(){

    App.session.completed = true;

    App.session.endTime = Date.now();

    saveSession();

}



/* =====================================================
   SESSION STATISTICS
===================================================== */

function updateStatistics(result){

    if(!result){

        return;

    }

    if(result.passed){

        App.session.statistics.passed++;

    }

    else{

        App.session.statistics.failed++;

    }

}



/* =====================================================
   CALCULATE ACCURACY
===================================================== */

function calculateAccuracy(){

    const total =

        App.session.statistics.passed +

        App.session.statistics.failed;

    if(total===0){

        App.session.statistics.accuracy = 0;

        return;

    }

    App.session.statistics.accuracy =

    Math.round(

        (

            App.session.statistics.passed

            *100

        )/total

    );

}



/* =====================================================
   UPDATE SESSION REWARDS
===================================================== */

function updateSessionRewards(

    xp,

    coins

){

    App.session.statistics.xp +=

        Number(xp)||0;

    App.session.statistics.coins +=

        Number(coins)||0;

}



/* =====================================================
   SAVE CURRENT STATE
===================================================== */

function saveCurrentState(){

    updateSessionIndex();

    saveSession();

}



/* =====================================================
   END OF SESSION MANAGER
===================================================== */
/* =====================================================
   QUESTION MANAGER
===================================================== */



/* =====================================================
   LOAD QUESTION BANK
===================================================== */
async function loadQuestionBank(){

    try{

        const response = await fetch(

            CONFIG.QUESTION_FOLDER +

            CONFIG.QUESTION_SET +

            ".json"

        );

        if(!response.ok){

            throw new Error(

                "Unable to load question bank."

            );

        }

        App.questionBank = await response.json();

        console.log(
            "Question Bank Loaded:",
            App.questionBank.length,
            "Questions"
        );

    }

    catch(error){

        console.error(error);

        alert(
            "Question Bank Not Found."
        );

    }

}


/* =====================================================
   GENERATE SESSION QUESTIONS
===================================================== */

function generateSessionQuestions(){

    let questions =

    [...App.questionBank];

    shuffle(questions);

    App.session.questions =

    questions.slice(

        0,

        CONFIG.QUESTIONS_PER_SESSION

    );

}



/* =====================================================
   DISPLAY QUESTION
===================================================== */

function displayQuestion(){

    const question =

    getCurrentQuestion();

    if(!question){

        return;

    }



    /*------------------------------------------
        BASIC INFORMATION
    ------------------------------------------*/

    updateElement(

        "questionTitle",

        question.title

    );



    updateElement(

        "questionTopic",

        question.topic

    );



    updateElement(

        "questionDifficulty",

        question.difficulty

    );



    /*------------------------------------------
        QUESTION DESCRIPTION
    ------------------------------------------*/

    updateHTML(
    "questionScenario",
    question.scenario
);

updateHTML(
    "questionStatement",
    question.task
);


    updateHTML(

        "questionInput",

        question.inputFormat

    );



    updateHTML(

        "questionOutput",

        question.outputFormat

    );



    updateHTML(

        "questionConstraints",

        question.constraints

    );



    /*------------------------------------------
        SAMPLE INPUT / OUTPUT
    ------------------------------------------*/

    updateElement(

        "sampleInput",

        question.sampleInput

    );



    updateElement(

        "sampleOutput",

        question.sampleOutput

    );



    /*------------------------------------------
        TEST CASES
    ------------------------------------------*/

    displayTestCases(question);



    /*------------------------------------------
        LOAD INTO PYTHON ENGINE
    ------------------------------------------*/

    PythonEngine.setQuestion(

        question

    );



    restoreSavedCode(

        question.id

    );



    updateNavigation();

    updatePalette();

    updateProgress();

}



/* =====================================================
   DISPLAY TEST CASES
===================================================== */

function displayTestCases(question){

    const container =

    $("visibleTestCases");



    if(!container){

        return;

    }



    container.innerHTML = "";



    question.visibleTestCases.forEach(

    function(test,index){

        container.innerHTML += `

<div class="questionCard">

<h3>Example ${index+1}</h3>

<b>Input</b>

<pre>${test.input}</pre>

<b>Output</b>

<pre>${test.output}</pre>

</div>

`;

    });

}



/* =====================================================
   RESTORE SAVED CODE
===================================================== */

function restoreSavedCode(questionId){

    const answer =

    App.session.answers[questionId];



    if(

        answer &&

        answer.code

    ){

        PythonEngine.setCode(

            answer.code

        );

    }

    else{

        PythonEngine.setCode(

            getCurrentQuestion()

            .starterCode

        );

    }

}



/* =====================================================
   SAVE CURRENT CODE
===================================================== */

function saveCurrentCode(){

    const question =

    getCurrentQuestion();



    if(!question){

        return;

    }



    if(

        !App.session.answers[

            question.id

        ]

    ){

        App.session.answers[

            question.id

        ]={};

    }



    App.session.answers[

        question.id

    ].code =

    PythonEngine.getCode();



    saveSession();

}



/* =====================================================
   QUESTION COMPLETED
===================================================== */

function markQuestionCompleted(){

    const question =

    getCurrentQuestion();



    if(!question){

        return;

    }



    if(

        App.session.answers[

            question.id

        ]

    ){

        App.session.answers[

            question.id

        ].completed = true;

    }



    updatePalette();

    updateProgress();

}



/* =====================================================
   END OF QUESTION MANAGER
===================================================== */
/* =====================================================
   NAVIGATION MANAGER
===================================================== */



/* =====================================================
   NEXT QUESTION
===================================================== */

function nextQuestion(){

    saveCurrentCode();

    if(

        App.currentQuestionIndex >=

        App.session.questions.length-1

    ){

        return;

    }

    App.currentQuestionIndex++;

    updateSessionIndex();

    displayQuestion();

    saveSession();

}



/* =====================================================
   PREVIOUS QUESTION
===================================================== */

function previousQuestion(){

    saveCurrentCode();

    if(

        App.currentQuestionIndex<=0

    ){

        return;

    }

    App.currentQuestionIndex--;

    updateSessionIndex();

    displayQuestion();

    saveSession();

}



/* =====================================================
   JUMP QUESTION
===================================================== */

function jumpQuestion(index){

    if(

        index<0 ||

        index>=App.session.questions.length

    ){

        return;

    }

    saveCurrentCode();

    App.currentQuestionIndex=index;

    updateSessionIndex();

    displayQuestion();

    saveSession();

}



/* =====================================================
   CREATE QUESTION PALETTE
===================================================== */

function createPalette(){

    const palette =

    $("questionPalette");



    if(!palette){

        return;

    }



    palette.innerHTML="";



    App.session.questions.forEach(

    function(question,index){

        const button=

        document.createElement(

            "button"

        );



        button.className=

        "paletteButton";



        button.textContent=

        index+1;



        button.onclick=function(){

            jumpQuestion(index);

        };



        palette.appendChild(

            button

        );

    });



    updatePalette();

}



/* =====================================================
   UPDATE QUESTION PALETTE
===================================================== */

function updatePalette(){

    const buttons=

    document.querySelectorAll(

        ".paletteButton"

    );



    buttons.forEach(

    function(button,index){

        button.classList.remove(

            "current",

            "completed"

        );



        if(

            index===

            App.currentQuestionIndex

        ){

            button.classList.add(

                "current"

            );

        }



        const question=

        App.session.questions[index];



        const answer=

        App.session.answers[

            question.id

        ];



        if(

            answer &&

            answer.completed

        ){

            button.classList.add(

                "completed"

            );

        }

    });

}



/* =====================================================
   UPDATE NAVIGATION
===================================================== */

function updateNavigation(){

    const total=

    App.session.questions.length;



    disableElement(

        "previousButton"

    );



    disableElement(

        "nextButton"

    );



    if(

        App.currentQuestionIndex>0

    ){

        enableElement(

            "previousButton"

        );

    }



    if(

        App.currentQuestionIndex<

        total-1

    ){

        enableElement(

            "nextButton"

        );

    }

}



/* =====================================================
   UPDATE PROGRESS
===================================================== */

function updateProgress(){

    const total=

    App.session.questions.length;



    let completed=0;



    App.session.questions.forEach(

    function(question){

        const answer=

        App.session.answers[

            question.id

        ];



        if(

            answer &&

            answer.completed

        ){

            completed++;

        }

    });



    updateElement(

        "progressText",

        completed+" / "+total

    );

}



/* =====================================================
   GET QUESTION NUMBER
===================================================== */

function getQuestionNumber(){

    return(

        App.currentQuestionIndex+1

    );

}



/* =====================================================
   IS LAST QUESTION
===================================================== */

function isLastQuestion(){

    return(

        App.currentQuestionIndex===

        App.session.questions.length-1

    );

}



/* =====================================================
   IS FIRST QUESTION
===================================================== */

function isFirstQuestion(){

    return(

        App.currentQuestionIndex===0

    );

}



/* =====================================================
   END OF NAVIGATION MANAGER
===================================================== */
/* =====================================================
   PYTHON ENGINE INTEGRATION
===================================================== */



/* =====================================================
   RUN CURRENT QUESTION
===================================================== */

async function runCurrentQuestion(){

    saveCurrentCode();

    PythonEngine.clearConsole();

    const result =

    await PythonEngine.run();

    displayResult(result);

    return result;

}



/* =====================================================
   RESET CODE
===================================================== */

function resetCode(){

    const question =

    getCurrentQuestion();

    if(!question){

        return;

    }

    PythonEngine.setCode(

        question.starterCode

    );

    saveCurrentCode();

}



/* =====================================================
   SUBMIT CHALLENGE
===================================================== */

async function submitChallenge(){

    saveCurrentCode();

    const result =

    await runCurrentQuestion();

    if(

        !result.executionSuccess

    ){

        return;

    }

    if(

        result.passed

    ){

        markQuestionCompleted();

        giveReward(

            getCurrentQuestion().xp,

            getCurrentQuestion().coins

        );

        updateSessionRewards(

            getCurrentQuestion().xp,

            getCurrentQuestion().coins

        );

    }

    updateStatistics(result);

    calculateAccuracy();

    saveSession();

}



/* =====================================================
   DISPLAY RESULT
===================================================== */

function displayResult(result){

    if(!result){

        return;

    }



    /*------------------------------------------
        PASS / FAIL
    ------------------------------------------*/

    const status = $("resultStatus");



    if(result.passed){

        status.textContent = "✅ PASS";

        status.className = "pass";

    }

    else{

        status.textContent = "❌ FAIL";

        status.className = "fail";

    }



    /*------------------------------------------
        RUNTIME
    ------------------------------------------*/

    updateElement(

        "runtimeStatus",

        "⚡ " +

        result.runtime +

        " ms"

    );



    /*------------------------------------------
        SCORE
    ------------------------------------------*/

    updateElement(

        "scoreStatus",

        "🎯 " +

        result.score +

        "%"

    );



    /*------------------------------------------
        VISIBLE
    ------------------------------------------*/

    updateElement(

        "visibleStatus",

        "👁 " +

        result.visiblePassed +

        "/" +

        getCurrentQuestion()

        .visibleTestCases.length

    );



    /*------------------------------------------
        HIDDEN
    ------------------------------------------*/

    updateElement(

        "hiddenStatus",

        "🔒 " +

        result.hiddenPassed +

        "/" +

        getCurrentQuestion()

        .hiddenTestCases.length

    );



    /*------------------------------------------
        FAILED
    ------------------------------------------*/

    updateElement(

        "failedStatus",

        "❌ " +

        result.failedCases

    );

}



/* =====================================================
   CLEAR RESULT
===================================================== */

function clearResult(){

    updateElement(

        "resultStatus",

        CONFIG.STATUS_READY

    );



    $("resultStatus").className="ready";



    updateElement(

        "runtimeStatus",

        "⚡ --"

    );



    updateElement(

        "scoreStatus",

        "🎯 --"

    );



    updateElement(

        "visibleStatus",

        "👁 --"

    );



    updateElement(

        "hiddenStatus",

        "🔒 --"

    );



    updateElement(

        "failedStatus",

        "❌ --"

    );

}



/* =====================================================
   END OF PYTHON ENGINE INTEGRATION
===================================================== */
/* =====================================================
   TIMER MANAGER
===================================================== */



/* =====================================================
   START TIMER
===================================================== */

function startTimer(){

    stopTimer();

    App.timerId = setInterval(

        updateTimer,

        1000

    );

}



/* =====================================================
   STOP TIMER
===================================================== */

function stopTimer(){

    if(App.timerId){

        clearInterval(

            App.timerId

        );

        App.timerId = null;

    }

}



/* =====================================================
   UPDATE TIMER
===================================================== */

function updateTimer(){

    if(!App.session){

        return;

    }

    const elapsed = Math.floor(

        (Date.now() -

        App.session.startTime) / 1000

    );

    const remaining = Math.max(

        0,

        CONFIG.CHALLENGE_TIME -

        elapsed

    );

    const hours = Math.floor(

        remaining / 3600

    );

    const minutes = Math.floor(

        (remaining % 3600) / 60

    );

    const seconds =

        remaining % 60;

    updateElement(

        "timer",

        formatTime(

            hours,

            minutes,

            seconds

        )

    );

    if(remaining<=0){

        stopTimer();

        finishChallenge();

    }

}



/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(

    hours,

    minutes,

    seconds

){

    return (

        String(hours)

        .padStart(2,"0")

        + ":" +

        String(minutes)

        .padStart(2,"0")

        + ":" +

        String(seconds)

        .padStart(2,"0")

    );

}



/* =====================================================
   GET REMAINING TIME
===================================================== */

function getRemainingTime(){

    if(!App.session){

        return 0;

    }

    const elapsed = Math.floor(

        (Date.now() -

        App.session.startTime) / 1000

    );

    return Math.max(

        0,

        CONFIG.CHALLENGE_TIME -

        elapsed

    );

}



/* =====================================================
   PAUSE TIMER
===================================================== */

function pauseTimer(){

    stopTimer();

}



/* =====================================================
   RESUME TIMER
===================================================== */

function resumeTimer(){

    startTimer();

}



/* =====================================================
   RESET TIMER
===================================================== */

function resetTimer(){

    if(App.session){

        App.session.startTime =

        Date.now();

    }

    updateTimer();

}



/* =====================================================
   END OF TIMER MANAGER
===================================================== */
/* =====================================================
   AUTO SAVE MANAGER
===================================================== */



/* =====================================================
   START AUTO SAVE
===================================================== */

function startAutoSave(){

    setInterval(

        function(){

            if(

                App.session

            ){

                saveCurrentCode();

                saveSession();

            }

        },

        CONFIG.AUTO_SAVE_INTERVAL

    );

}



/* =====================================================
   FINISH CHALLENGE
===================================================== */

function finishChallenge(){

    stopTimer();

    completeSession();

    calculateAccuracy();

    showResultPanel();

}



/* =====================================================
   SHOW RESULT PANEL
===================================================== */

function showResultPanel(){

    showElement(

        "resultPanel"

    );



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

        App.session.statistics.accuracy +

        "%"

    );

}



/* =====================================================
   HIDE RESULT PANEL
===================================================== */

function hideResultPanel(){

    hideElement(

        "resultPanel"

    );

}



/* =====================================================
   CHECK CHALLENGE COMPLETION
===================================================== */

function isChallengeCompleted(){

    let completed = 0;



    App.session.questions.forEach(

        function(question){

            const answer =

            App.session.answers[

                question.id

            ];



            if(

                answer &&

                answer.completed

            ){

                completed++;

            }

        }

    );



    return(

        completed===

        App.session.questions.length

    );

}



/* =====================================================
   CHECK AFTER EVERY SUBMISSION
===================================================== */

function checkChallengeCompletion(){

    if(

        isChallengeCompleted()

    ){

        finishChallenge();

    }

}



/* =====================================================
   RESTART CHALLENGE
===================================================== */

function restartChallenge(){

    clearSession();

    startNewSession();

    generateSessionQuestions();

    createPalette();

    displayQuestion();

    clearResult();

    hideResultPanel();

    startTimer();

}



/* =====================================================
   EXIT CHALLENGE
===================================================== */

function exitChallenge(){

    saveCurrentCode();

    saveSession();

    window.location.href="index.html";

}



/* =====================================================
   END OF AUTO SAVE MANAGER
===================================================== */
/* =====================================================
   APPLICATION INITIALIZATION
===================================================== */



/* =====================================================
   INITIALIZE APPLICATION
===================================================== */

async function initializeApplication(){

    try{

        /*------------------------------------------
            STATUS
        ------------------------------------------*/

        updateElement(

            "loadingStatus",

            "Loading..."

        );



        /*------------------------------------------
            PLAYER
        ------------------------------------------*/

        loadPlayer();



        /*------------------------------------------
            SESSION
        ------------------------------------------*/

        loadSession();



        /*------------------------------------------
            PYTHON ENGINE
        ------------------------------------------*/

        await PythonEngine.initialize();



        /*------------------------------------------
            QUESTION BANK
        ------------------------------------------*/

        await loadQuestionBank();



        /*------------------------------------------
            SESSION
        ------------------------------------------*/

        if(

            sessionExists() &&

            !App.session.completed

        ){

            resumeSession();

        }

        else{

            startNewSession();

            generateSessionQuestions();

        }



        /*------------------------------------------
            QUESTION PALETTE
        ------------------------------------------*/

        createPalette();



        /*------------------------------------------
            DISPLAY FIRST QUESTION
        ------------------------------------------*/

        displayQuestion();



        /*------------------------------------------
            PLAYER
        ------------------------------------------*/

        updatePlayerPanel();



        /*------------------------------------------
            RESULT BAR
        ------------------------------------------*/

        clearResult();



        /*------------------------------------------
            TIMER
        ------------------------------------------*/

        startTimer();



        /*------------------------------------------
            AUTO SAVE
        ------------------------------------------*/

        startAutoSave();



        /*------------------------------------------
            SAVE
        ------------------------------------------*/

        saveSession();



        /*------------------------------------------
            READY
        ------------------------------------------*/

        updateElement(

            "loadingStatus",

            CONFIG.STATUS_READY

        );

    }

    catch(error){

        console.error(error);



        updateElement(

            "loadingStatus",

            "Failed"

        );



        alert(

            "Unable to initialize application."

        );

    }

}



/* =====================================================
   BEFORE CLOSE
===================================================== */

window.addEventListener(

    "beforeunload",

    function(){

        saveCurrentCode();

        saveSession();

    }

);



/* =====================================================
   PAGE VISIBILITY
===================================================== */

document.addEventListener(

    "visibilitychange",

    function(){

        if(document.hidden){

            saveCurrentCode();

            saveSession();

        }

    }

);



/* =====================================================
   APPLICATION READY
===================================================== */

function applicationStarted(){

    return(

        App.player &&

        App.session &&

        PythonEngine.isReady()

    );

}



/* =====================================================
   END OF INITIALIZATION
===================================================== */
/* =====================================================
   EVENT BINDING
===================================================== */



/* =====================================================
   BIND APPLICATION BUTTONS
===================================================== */

function bindApplicationButtons(){

    /*------------------------------------------
        PREVIOUS
    ------------------------------------------*/

    $("previousButton")?.addEventListener(

        "click",

        previousQuestion

    );



    /*------------------------------------------
        NEXT
    ------------------------------------------*/

    $("nextButton")?.addEventListener(

        "click",

        nextQuestion

    );



    /*------------------------------------------
        RUN CODE
    ------------------------------------------*/

    $("runButton")?.addEventListener(

        "click",

        runCurrentQuestion

    );



    /*------------------------------------------
        SUBMIT
    ------------------------------------------*/

    $("submitButton")?.addEventListener(

        "click",

        async function(){

            await submitChallenge();

            checkChallengeCompletion();

        }

    );



    /*------------------------------------------
        RESET CODE
    ------------------------------------------*/

    $("resetButton")?.addEventListener(

        "click",

        resetCode

    );



    /*------------------------------------------
        RESTART
    ------------------------------------------*/

    $("restartButton")?.addEventListener(

        "click",

        restartChallenge

    );



    /*------------------------------------------
        CLOSE RESULT
    ------------------------------------------*/

    $("closeResultButton")?.addEventListener(

        "click",

        hideResultPanel

    );



}



/* =====================================================
   KEYBOARD SHORTCUTS
===================================================== */

function bindKeyboardShortcuts(){

    document.addEventListener(

        "keydown",

        async function(event){

            /*----------------------------------
                CTRL + ENTER
            ----------------------------------*/

            if(

                event.ctrlKey &&

                event.key==="Enter"

            ){

                event.preventDefault();

                await runCurrentQuestion();

            }



            /*----------------------------------
                CTRL + S
            ----------------------------------*/

            if(

                event.ctrlKey &&

                event.key.toLowerCase()==="s"

            ){

                event.preventDefault();

                saveCurrentCode();

                saveSession();

            }



            /*----------------------------------
                CTRL + →
            ----------------------------------*/

            if(

                event.ctrlKey &&

                event.key==="ArrowRight"

            ){

                event.preventDefault();

                nextQuestion();

            }



            /*----------------------------------
                CTRL + ←
            ----------------------------------*/

            if(

                event.ctrlKey &&

                event.key==="ArrowLeft"

            ){

                event.preventDefault();

                previousQuestion();

            }



        }

    );

}



/* =====================================================
   BOOT APPLICATION
===================================================== */

async function bootApplication(){

    bindApplicationButtons();

    bindKeyboardShortcuts();

    await initializeApplication();

}



/* =====================================================
   APPLICATION START
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    bootApplication

);



/* =====================================================
   END OF APP.JS
===================================================== */
