/* =====================================================
   CODING BATTLE ARENA
   MASTER CHALLENGE
   PYTHON ENGINE
   Version : 2.0
===================================================== */



/* =====================================================
   PYTHON ENGINE OBJECT
===================================================== */

const PythonEngine = {

    pyodide: null,

    initialized: false,

    currentQuestion: null,

    output: "",

    runtime: 0,

    inputQueue: [],

    currentInputIndex: 0

};




/* =====================================================
   INITIALIZE PYODIDE
===================================================== */

PythonEngine.initialize = async function(){

    if(this.initialized){

        return;

    }

    try{

        this.pyodide = await loadPyodide({

            indexURL:
            "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"

        });

        this.initialized = true;

        console.log(
            "✅ Python Engine Ready"
        );

    }

    catch(error){

        console.error(error);

        alert(
            "Unable to load Python Engine."
        );

    }

};




/* =====================================================
   QUESTION
===================================================== */

PythonEngine.setQuestion = function(question){

    this.currentQuestion = question;

};




/* =====================================================
   EDITOR
===================================================== */

PythonEngine.getEditor = function(){

    return document.getElementById(

        "codingArea"

    );

};



PythonEngine.getCode = function(){

    const editor = this.getEditor();

    if(!editor){

        return "";

    }

    return editor.value;

};



PythonEngine.setCode = function(code){

    const editor = this.getEditor();

    if(!editor){

        return;

    }

    editor.value = code;

};




/* =====================================================
   OUTPUT
===================================================== */

PythonEngine.clearOutput = function(){

    this.output = "";

};



PythonEngine.captureOutput = function(text){

    this.output += text + "\n";

};



PythonEngine.showOutput = function(){

    const box = document.getElementById(

        "programOutput"

    );

    if(box){

        box.textContent = this.output;

    }

};



PythonEngine.showError = function(error){

    const box = document.getElementById(

        "programOutput"

    );

    if(box){

        box.textContent = error;

    }

};

/* =====================================================
   INPUT MANAGER
===================================================== */

PythonEngine.prepareInput = function(inputText){

    this.inputQueue = String(inputText)
        .replace(/\r/g,"")
        .split("\n");

    this.currentInputIndex = 0;

};



PythonEngine.readInput = function(){

    if(

        this.currentInputIndex >=

        this.inputQueue.length

    ){

        return "";

    }

    return this.inputQueue[

        this.currentInputIndex++

    ];

};




/* =====================================================
   EXECUTE PYTHON CODE
===================================================== */

PythonEngine.execute = async function(

    sourceCode,

    inputText=""

){

    this.clearOutput();

    this.prepareInput(inputText);



    /*------------------------------------------
        Redirect print()
    ------------------------------------------*/

    this.pyodide.setStdout({

        batched: (text)=>{

            this.captureOutput(

                text

            );

        }

    });



    /*------------------------------------------
        Redirect input()
    ------------------------------------------*/

    this.pyodide.globals.set(

        "input",

        ()=>{

            return this.readInput();

        }

    );



    const startTime = performance.now();



    try{

        await this.pyodide.runPythonAsync(

            sourceCode

        );



        this.runtime = Math.round(

            performance.now() -

            startTime

        );



        return{

            success:true,

            output:this.output.trim(),

            runtime:this.runtime

        };

    }

    catch(error){

        this.runtime = Math.round(

            performance.now() -

            startTime

        );



        return{

            success:false,

            output:this.output.trim(),

            runtime:this.runtime,

            error:error.toString()

        };

    }

};




/* =====================================================
   RUN CURRENT EDITOR CODE
===================================================== */

PythonEngine.runProgram = async function(){

    const code =

        this.getCode();



    const result =

        await this.execute(

            code,

            ""

        );



    if(

        result.success

    ){

        this.showOutput();

    }

    else{

        this.showError(

            result.error

        );

    }



    return result;

};

/* =====================================================
   NORMALIZE OUTPUT
===================================================== */

PythonEngine.normalizeOutput = function(text){

    if(text===undefined || text===null){

        return "";

    }

    return String(text)
            .replace(/\r/g,"")
            .trim();

};




/* =====================================================
   RUN A SINGLE TEST
===================================================== */

PythonEngine.runSingleTest = async function(

    test,

    sourceCode

){

    const execution =

        await this.execute(

            sourceCode,

            test.input

        );



    if(!execution.success){

        return{

            passed:false,

            runtime:execution.runtime,

            output:execution.output,

            expected:test.output,

            error:execution.error

        };

    }



    const actual =

        this.normalizeOutput(test.output);



    const expected =

        this.normalizeOutput(

            test.expectedOutput

        );



    return{

        passed:

            actual===expected,

        runtime:

            execution.runtime,

        output:

            actual,

        expected:

            expected,

        error:null

    };

};




/* =====================================================
   RUN TEST SET
===================================================== */

PythonEngine.runTestSet = async function(

    testArray

){

    const code =

        this.getCode();



    let passed = 0;

    let runtime = 0;

    let details = [];



    for(

        const test of testArray

    ){

        const result =

            await this.runSingleTest(

                test,

                code

            );



        runtime =

            Math.max(

                runtime,

                result.runtime

            );



        if(

            result.passed

        ){

            passed++;

        }



        details.push(

            result

        );

    }



    return{

        passed,

        total:testArray.length,

        runtime,

        details

    };

};




/* =====================================================
   RUN VISIBLE TESTS
===================================================== */

PythonEngine.runVisibleTests =

async function(){

    if(

        !this.currentQuestion ||

        !this.currentQuestion.visibleTestCases

    ){

        return{

            passed:0,

            total:0,

            runtime:0,

            details:[]

        };

    }



    return await

    this.runTestSet(

        this.currentQuestion.visibleTestCases

    );

};




/* =====================================================
   RUN HIDDEN TESTS
===================================================== */

PythonEngine.runHiddenTests =

async function(){

    if(

        !this.currentQuestion ||

        !this.currentQuestion.hiddenTestCases

    ){

        return{

            passed:0,

            total:0,

            runtime:0,

            details:[]

        };

    }



    return await

    this.runTestSet(

        this.currentQuestion.hiddenTestCases

    );

};

/* =====================================================
   CREATE RESULT OBJECT
===================================================== */

PythonEngine.createResult = function(

    visible,

    hidden

){

    const totalPassed =

        visible.passed +

        hidden.passed;



    const totalTests =

        visible.total +

        hidden.total;



    const failedCases =

        totalTests -

        totalPassed;



    const score =

        totalTests===0

        ?100

        :Math.round(

            (totalPassed*100)/

            totalTests

        );



    return{

        passed:

            failedCases===0,



        score:

            score,



        runtime:

            Math.max(

                visible.runtime,

                hidden.runtime

            ),



        visiblePassed:

            visible.passed,



        hiddenPassed:

            hidden.passed,



        failedCases:

            failedCases,



        totalVisible:

            visible.total,



        totalHidden:

            hidden.total,



        visibleResults:

            visible.details,



        hiddenResults:

            hidden.details

    };

};





/* =====================================================
   FINAL EVALUATION
===================================================== */

PythonEngine.evaluateTests =

async function(){



    const visible =

        await this.runVisibleTests();



    const hidden =

        await this.runHiddenTests();



    const result =

        this.createResult(

            visible,

            hidden

        );



    return result;

};





/* =====================================================
   COMPLETE RUN
===================================================== */

PythonEngine.run =

async function(){



    if(

        !this.currentQuestion

    ){

        throw new Error(

            "No Question Loaded."

        );

    }



    const result =

        await this.evaluateTests();



    return result;

};

/* =====================================================
   UPDATE RESULT BAR
===================================================== */

PythonEngine.updateResultBar = function(result){

    updateElement(

        "runtime",

        result.runtime

    );



    updateElement(

        "score",

        result.score + "%"

    );



    updateElement(

        "visiblePassed",

        result.visiblePassed +

        "/" +

        result.totalVisible

    );



    updateElement(

        "hiddenPassed",

        result.hiddenPassed +

        "/" +

        result.totalHidden

    );



    updateElement(

        "failedCases",

        result.failedCases

    );



    if(result.passed){

        updateElement(

            "resultStatus",

            "✅ PASS"

        );

    }

    else{

        updateElement(

            "resultStatus",

            "❌ FAIL"

        );

    }

};





/* =====================================================
   DISPLAY OUTPUT
===================================================== */

PythonEngine.displayProgramOutput =

function(result){

    const outputBox =

        document.getElementById(

            "programOutput"

        );



    if(!outputBox){

        return;

    }



    if(result.error){

        outputBox.textContent =

            result.error;

        return;

    }



    if(result.visibleResults.length>0){

        outputBox.textContent =

            result.visibleResults[0]

            .output;

    }

};





/* =====================================================
   RUN & DISPLAY
===================================================== */

PythonEngine.runAndDisplay =

async function(){



    const result =

        await this.run();



    this.updateResultBar(

        result

    );



    this.displayProgramOutput(

        result

    );



    return result;

};





/* =====================================================
   RESET STATUS BAR
===================================================== */

PythonEngine.resetStatusBar =

function(){



    updateElement(

        "resultStatus",

        "Ready"

    );



    updateElement(

        "runtime",

        "0"

    );



    updateElement(

        "score",

        "0%"

    );



    updateElement(

        "visiblePassed",

        "0"

    );



    updateElement(

        "hiddenPassed",

        "0"

    );



    updateElement(

        "failedCases",

        "0"

    );

};

/* =====================================================
   RESET QUESTION
===================================================== */

PythonEngine.resetQuestion = function(){

    if(

        !this.currentQuestion

    ){

        return;

    }



    this.setCode(

        this.currentQuestion

            .starterCode ||

        ""

    );



    this.clearOutput();



    const outputBox =

        document.getElementById(

            "programOutput"

        );



    if(outputBox){

        outputBox.textContent = "";

    }



    this.resetStatusBar();

};





/* =====================================================
   CLEAR CONSOLE
===================================================== */

PythonEngine.clearConsole = function(){

    this.clearOutput();



    const outputBox =

        document.getElementById(

            "programOutput"

        );



    if(outputBox){

        outputBox.textContent = "";

    }

};





/* =====================================================
   READY CHECK
===================================================== */

PythonEngine.isReady = function(){

    return this.initialized;

};





/* =====================================================
   GET CURRENT QUESTION
===================================================== */

PythonEngine.getQuestion = function(){

    return this.currentQuestion;

};





/* =====================================================
   GET LAST OUTPUT
===================================================== */

PythonEngine.getOutput = function(){

    return this.output;

};





/* =====================================================
   VERSION
===================================================== */

PythonEngine.version = function(){

    return "2.0";

};





/* =====================================================
   COMPATIBILITY FUNCTIONS
===================================================== */

/* Existing app.js can continue using these */

PythonEngine.showOutput = function(){

    const outputBox =

        document.getElementById(

            "programOutput"

        );



    if(outputBox){

        outputBox.textContent =

            this.output;

    }

};



PythonEngine.displayError = function(error){

    const outputBox =

        document.getElementById(

            "programOutput"

        );



    if(outputBox){

        outputBox.textContent =

            error;

    }

};





/* =====================================================
   END OF PYTHON ENGINE
===================================================== */
