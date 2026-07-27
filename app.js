/* =====================================================
   CODING BATTLE ARENA
   MASTER CHALLENGE
   app.js (Part 1)
   Version : 1.0
===================================================== */



/* =====================================================
   CONFIGURATION
===================================================== */

const CONFIG = {

    STORAGE_KEY: "masterChallengeV1",

    QUESTION_FOLDER: "data/",

    DEFAULT_LEVEL: "hard",

    QUESTIONS_PER_SESSION: 10,

    CHALLENGE_TIME: 60 * 60

};



/* =====================================================
   APPLICATION STATE
===================================================== */

const App = {

    player: null,

    session: null,

    questionBank: [],

    currentQuestionIndex: 0,

    timerId: null

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



function shuffle(array){

    for(let i=array.length-1;i>0;i--){

        let j=Math.floor(Math.random()*(i+1));

        [array[i],array[j]]=[array[j],array[i]];

    }

}



/* =====================================================
   PLAYER MANAGER
===================================================== */

function loadPlayer(){

    App.player={

        name:localStorage.getItem("playerName") || "Guest",

        xp:Number(localStorage.getItem("playerXP") || 0),

        coins:Number(localStorage.getItem("playerCoins") || 0),

        level:Number(localStorage.getItem("playerLevel") || 1)

    };

}



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



function addXP(value){

    App.player.xp += value;

    savePlayer();

    updatePlayerPanel();

}



function addCoins(value){

    App.player.coins += value;

    savePlayer();

    updatePlayerPanel();

}



/* =====================================================
   SESSION MANAGER
===================================================== */

function createSession(){

    return{

        level:CONFIG.DEFAULT_LEVEL,

        questions:[],

        answers:{},

        currentQuestionIndex:0,

        completed:false,

        startTime:Date.now(),

        endTime:null,

        statistics:{

            passed:0,

            failed:0,

            xp:0,

            coins:0,

            accuracy:0

        }

    };

}



function saveSession(){

    localStorage.setItem(

        CONFIG.STORAGE_KEY,

        JSON.stringify(

            App.session

        )

    );

}



function loadSession(){

    let data = localStorage.getItem(

        CONFIG.STORAGE_KEY

    );

    if(data){

        App.session = JSON.parse(data);

    }

}



function clearSession(){

    localStorage.removeItem(

        CONFIG.STORAGE_KEY

    );

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



function calculateAccuracy(){

    let total =

        App.session.statistics.passed +

        App.session.statistics.failed;

    if(total===0){

        App.session.statistics.accuracy=0;

        return;

    }

    App.session.statistics.accuracy=

    Math.round(

        (App.session.statistics.passed*100)/total

    );

}



/* =====================================================
   END OF PART 1
===================================================== */

/* =====================================================
   PART 2
   QUESTION MANAGER
===================================================== */


/* =====================================================
   LOAD QUESTION BANK
===================================================== */

async function loadQuestionBank(){

    try{

        const response = await fetch(

            CONFIG.QUESTION_FOLDER +

            CONFIG.DEFAULT_LEVEL +

            ".json"

        );

        if(!response.ok){

            throw new Error(

                "Unable to load question bank."

            );

        }

        App.questionBank =

        await response.json();

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
   CURRENT QUESTION
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

    let question =

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

    $("questionDescription").innerHTML=

        "<h3>Case Study</h3>"

        +

        "<p>"+

        question.caseStudy+

        "</p>"

        +

        "<h3>Problem Statement</h3>"

        +

        "<p>"+

        question.statement+

        "</p>";

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
   RESTORE SAVED CODE
===================================================== */

function restoreSavedCode(

    questionId

){

    let answer =

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
   SAVE CURRENT CODE
===================================================== */

function saveCurrentCode(){

    let question =

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

    ].code=

    PythonEngine.getCode();

    saveSession();

}



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

    App.session.currentQuestionIndex=

    App.currentQuestionIndex;

    saveSession();

    displayQuestion();

}



/* =====================================================
   PREVIOUS QUESTION
===================================================== */

function previousQuestion(){

    saveCurrentCode();

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
   JUMP QUESTION
===================================================== */

function jumpQuestion(index){

    saveCurrentCode();

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
   CREATE QUESTION PALETTE
===================================================== */

function createPalette(){

    let palette =

    $("questionPalette");

    palette.innerHTML="";

    App.session.questions.forEach(

    function(question,index){

        let button=

        document.createElement(

            "button"

        );

        button.className=

        "paletteButton";

        button.innerText=

        index+1;

        button.onclick=

        function(){

            jumpQuestion(index);

        };

        palette.appendChild(

            button

        );

    });

}



/* =====================================================
   UPDATE PALETTE
===================================================== */

function updatePalette(){

    let buttons=

    document.querySelectorAll(

        ".paletteButton"

    );

    buttons.forEach(

    function(button,index){

        button.className=

        "paletteButton";

        if(

            index===

            App.currentQuestionIndex

        ){

            button.classList.add(

                "current"

            );

        }

        let question=

        App.session.questions[index];

        if(

            App.session.answers[

                question.id

            ]

        ){

            button.classList.add(

                "completed"

            );

        }

    });

}



/* =====================================================
   UPDATE PROGRESS
===================================================== */

function updateProgress(){

    let solved=

    Object.keys(

        App.session.answers

    ).length;

    let total=

    App.session.questions.length;

    let percentage=

    Math.round(

        solved*100/

        Math.max(total,1)

    );

    updateElement(

        "progressValue",

        percentage+"%"

    );

}



/* =====================================================
   UPDATE NAVIGATION
===================================================== */

function updateNavigation(){

    $("previousButton").disabled=

    App.currentQuestionIndex===0;

    $("nextButton").disabled=

    App.currentQuestionIndex===

    App.session.questions.length-1;

}



/* =====================================================
   END OF PART 2
===================================================== */

/* =====================================================
   PART 3
   PYTHON ENGINE INTEGRATION
===================================================== */


/* =====================================================
   LOAD QUESTION INTO ENGINE
===================================================== */

function loadQuestionToEngine(){

    let question = getCurrentQuestion();

    if(!question){

        return;

    }

    PythonEngine.setQuestion(question);

}



/* =====================================================
   SAVE ANSWER
===================================================== */

function saveAnswer(result){

    let question = getCurrentQuestion();

    if(!question){

        return;

    }

    App.session.answers[question.id]={

        code:PythonEngine.getCode(),

        passed:result.passed,

        score:result.score,

        runtime:result.runtime,

        visiblePassed:result.visiblePassed,

        hiddenPassed:result.hiddenPassed,

        failedCases:result.failedCases,

        submitted:true,

        time:new Date().toLocaleString()

    };

    saveSession();

}



/* =====================================================
   DISPLAY OUTPUT
===================================================== */

function displayOutput(result){

    let output = $("programOutput");

    if(!output){

        return;

    }

    output.textContent =

        result.output || "";

}



/* =====================================================
   DISPLAY RESULT
===================================================== */

function displayResult(result){

    updateElement(

        "runtime",

        result.runtime+" ms"

    );

    updateElement(

        "score",

        result.score+"%"

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

    let status = $("resultStatus");

    if(status){

        status.innerHTML =

        result.passed ?

        "✅ PASS"

        :

        "❌ FAIL";

        status.className =

        result.passed ?

        "pass"

        :

        "fail";

    }

}



/* =====================================================
   UPDATE PLAYER REWARD
===================================================== */

function updateRewards(question,result){

    if(!result.passed){

        return;

    }

    let xp = question.xp || 0;

    let coins = question.coins || 0;

    addXP(xp);

    addCoins(coins);

    App.session.statistics.xp += xp;

    App.session.statistics.coins += coins;

}



/* =====================================================
   RUN CURRENT QUESTION
===================================================== */

async function runCurrentQuestion(){

    let question = getCurrentQuestion();

    if(!question){

        return;

    }

    saveCurrentCode();

    $("runButton").disabled = true;

    $("runButton").innerHTML =

    "Running...";

    try{

        let result =

        await PythonEngine.run();

        displayOutput(result);

        displayResult(result);

        saveAnswer(result);

        updateStatistics(result);

        updateRewards(

            question,

            result

        );

        calculateAccuracy();

        saveSession();

        updateProgress();

        updatePlayerPanel();

    }

    catch(error){

        console.error(error);

        alert(

            "Python Execution Error"

        );

    }

    $("runButton").disabled = false;

    $("runButton").innerHTML =

    "▶ Run Code";

}



/* =====================================================
   RESET CODE
===================================================== */

function resetCode(){

    if(

        !confirm(

            "Reset starter code?"

        )

    ){

        return;

    }

    let question = getCurrentQuestion();

    PythonEngine.setCode(

        question.starterCode || ""

    );

    saveCurrentCode();

}



/* =====================================================
   AUTO SAVE
===================================================== */

function startAutoSave(){

    setInterval(

    function(){

        saveCurrentCode();

    },

    10000);

}



/* =====================================================
   BUTTON EVENTS
===================================================== */

function bindCodingButtons(){

    $("runButton").onclick =

    runCurrentQuestion;

    $("resetButton").onclick =

    resetCode;

    $("previousButton").onclick =

    previousQuestion;

    $("nextButton").onclick =

    nextQuestion;

}



/* =====================================================
   END OF PART 3
===================================================== */

/* =====================================================
   PART 4
   CHALLENGE MANAGER
   Version 1.0
===================================================== */


/* =====================================================
   TIMER
===================================================== */

let remainingTime = CONFIG.CHALLENGE_TIME;



function startTimer(){

    stopTimer();

    updateTimer();

    App.timerId = setInterval(function(){

        remainingTime--;

        updateTimer();

        if(remainingTime <= 0){

            finishChallenge();

        }

    },1000);

}



function stopTimer(){

    if(App.timerId){

        clearInterval(App.timerId);

        App.timerId = null;

    }

}



function updateTimer(){

    let minutes = Math.floor(remainingTime/60);

    let seconds = remainingTime%60;

    updateElement(

        "timer",

        String(minutes).padStart(2,"0")

        +":"

        +

        String(seconds).padStart(2,"0")

    );

}



/* =====================================================
   FINISH CHALLENGE
===================================================== */

function finishChallenge(){

    stopTimer();

    saveCurrentCode();

    calculateAccuracy();

    App.session.completed = true;

    App.session.endTime = Date.now();

    saveSession();

    showFinalResult();

}



/* =====================================================
   FINAL RESULT PANEL
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

    showElement(

        "resultPanel"

    );

}



/* =====================================================
   SUBMIT CHALLENGE
===================================================== */

function submitChallenge(){

    if(

        !confirm(

            "Submit Challenge?"

        )

    ){

        return;

    }

    finishChallenge();

}



/* =====================================================
   RESTART CHALLENGE
===================================================== */

function restartChallenge(){

    if(

        !confirm(

            "Start New Challenge?"

        )

    ){

        return;

    }

    clearSession();

    location.reload();

}



/* =====================================================
   INITIALIZE APPLICATION
===================================================== */

async function initializeApplication(){

    try{

        loadPlayer();

        loadSession();

        await PythonEngine.initialize();

        await loadQuestionBank();

        if(

            App.session &&

            !App.session.completed

        ){

            App.currentQuestionIndex =

            App.session.currentQuestionIndex || 0;

        }

        else{

            App.session =

            createSession();

            generateSessionQuestions();

        }

        createPalette();

        displayQuestion();

        updatePlayerPanel();

        bindCodingButtons();

        startAutoSave();

        startTimer();

        saveSession();

        updateElement(

            "loadingStatus",

            "Ready"

        );

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

        saveCurrentCode();

        saveSession();

    }

);



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

            saveCurrentCode();

        }

        if(

            event.key==="F9"

        ){

            event.preventDefault();

            runCurrentQuestion();

        }

    }

);



/* =====================================================
   BUTTON EVENTS
===================================================== */

function bindApplicationButtons(){

    if($("submitButton")){

        $("submitButton").onclick =

        submitChallenge;

    }

}



/* =====================================================
   APPLICATION ENTRY
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async function(){

        bindApplicationButtons();

        await initializeApplication();

    }

);



/* =====================================================
   END OF APP.JS
===================================================== */
