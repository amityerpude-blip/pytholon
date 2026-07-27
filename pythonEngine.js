/* =====================================================
   CODING BATTLE ARENA
   MASTER CHALLENGE
   PYTHON ENGINE
   Version 1.0
===================================================== */



/* =====================================================
   PYTHON ENGINE OBJECT
===================================================== */

const PythonEngine = {

    pyodide: null,

    currentQuestion: null,

    initialized: false,

    output: ""

};



/* =====================================================
   INITIALIZE PYODIDE
===================================================== */

PythonEngine.initialize = async function(){

    if(this.initialized){

        return;

    }

    try{

        updateElement(

            "loadingStatus",

            "Loading Python Engine..."

        );

        this.pyodide = await loadPyodide({

    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",

    stdout: (text) => PythonEngine.captureOutput(text),

    stderr: (text) => PythonEngine.captureOutput(text)

});

        this.initialized = true;

        updateElement(

            "loadingStatus",

            "Python Ready"

        );

    }

    catch(error){

    console.error("Pyodide Error:", error);

    updateElement(
        "loadingStatus",
        "Pyodide Failed"
    );

    alert(error.message);

}
};



/* =====================================================
   OUTPUT HANDLER
===================================================== */

PythonEngine.captureOutput = function(text){

    PythonEngine.output += text + "\n";

};



/* =====================================================
   CLEAR OUTPUT
===================================================== */

PythonEngine.clearOutput = function(){

    this.output = "";

};



/* =====================================================
   DISPLAY OUTPUT
===================================================== */

PythonEngine.showOutput = function(){

    const consoleBox =

    document.getElementById(

        "programOutput"

    );

    if(consoleBox){

        consoleBox.textContent =

        this.output;

    }

};



/* =====================================================
   CURRENT QUESTION
===================================================== */

PythonEngine.setQuestion = function(question){

    this.currentQuestion = question;

    if(

        question.starterCode

    ){

        this.setCode(

            question.starterCode

        );

    }

};



PythonEngine.getQuestion = function(){

    return this.currentQuestion;

};



/* =====================================================
   TEXTAREA EDITOR
===================================================== */

PythonEngine.getEditor = function(){

    return document.getElementById(

        "codingArea"

    );

};



PythonEngine.getCode = function(){

    const editor =

    this.getEditor();

    if(!editor){

        return "";

    }

    return editor.value;

};



PythonEngine.setCode = function(code){

    const editor =

    this.getEditor();

    if(!editor){

        return;

    }

    editor.value = code;

};



PythonEngine.appendCode = function(code){

    const editor =

    this.getEditor();

    if(!editor){

        return;

    }

    editor.value += code;

};



/* =====================================================
   RESET EDITOR
===================================================== */

PythonEngine.resetQuestion = function(){

    if(

        !this.currentQuestion

    ){

        return;

    }

    this.setCode(

        this.currentQuestion

        .starterCode || ""

    );

};



/* =====================================================
   PREPARE EXECUTION
===================================================== */

PythonEngine.prepareExecution = function(){

    this.clearOutput();

};



/* =====================================================
   END OF PART 1
===================================================== */

/* =====================================================
   PART 2
   PYTHON EXECUTION ENGINE
===================================================== */


/* =====================================================
   EXECUTE PYTHON CODE
===================================================== */

PythonEngine.execute = async function(){

    if(!this.initialized){

        throw new Error(

            "Python Engine Not Initialized."

        );

    }

    this.prepareExecution();

    const sourceCode =

    this.getCode();

    const startTime =

    performance.now();

    try{

        await this.pyodide.runPythonAsync(

            sourceCode

        );

        const endTime =

        performance.now();

        return{

            success:true,

            runtime:Math.round(

                endTime-startTime

            ),

            output:this.output,

            error:null

        };

    }

    catch(error){

        const endTime =

        performance.now();

        return{

            success:false,

            runtime:Math.round(

                endTime-startTime

            ),

            output:this.output,

            error:error.toString()

        };

    }

};



/* =====================================================
   DISPLAY EXECUTION ERROR
===================================================== */

PythonEngine.displayError=function(error){

    const consoleBox=

    document.getElementById(

        "programOutput"

    );

    if(consoleBox){

        consoleBox.textContent=

        error;

    }

};



/* =====================================================
   EXECUTE PROGRAM
===================================================== */

PythonEngine.runProgram=

async function(){

    const result=

    await this.execute();

    if(result.success){

        this.showOutput();

    }

    else{

        this.displayError(

            result.error

        );

    }

    return result;

};



/* =====================================================
   CREATE RESULT OBJECT
===================================================== */

PythonEngine.createResult=

function(execution){

    return{

        passed:false,

        score:0,

        runtime:

            execution.runtime,

        output:

            execution.output,

        visiblePassed:0,

        hiddenPassed:0,

        failedCases:0,

        executionSuccess:

            execution.success,

        error:

            execution.error

    };

};



/* =====================================================
   MAIN RUN FUNCTION
===================================================== */

PythonEngine.run=

async function(){

    const execution=

    await this.runProgram();

    const result=

    this.createResult(

        execution

    );

    if(

        !execution.success

    ){

        return result;

    }

    return await

    this.evaluateTests(

        result

    );

};



/* =====================================================
   GET OUTPUT
===================================================== */

PythonEngine.getOutput=

function(){

    return this.output;

};



/* =====================================================
   CLEAR CONSOLE
===================================================== */

PythonEngine.clearConsole=

function(){

    const consoleBox=

    document.getElementById(

        "programOutput"

    );

    if(consoleBox){

        consoleBox.textContent="";

    }

};



/* =====================================================
   END OF PART 2
===================================================== */

/* =====================================================
   PART 3
   TEST ENGINE & RESULT EVALUATION
===================================================== */


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
   RUN VISIBLE TESTS
===================================================== */

PythonEngine.runVisibleTests = function(result){

    let question = this.currentQuestion;

    if(!question){

        return result;

    }

    if(!question.visibleTests){

        return result;

    }

    let output = this.normalizeOutput(

        result.output

    );

    question.visibleTests.forEach(function(test){

        let expected =

        PythonEngine.normalizeOutput(

            test.expectedOutput

        );

        if(output===expected){

            result.visiblePassed++;

        }

    });

    return result;

};



/* =====================================================
   RUN HIDDEN TESTS
===================================================== */

PythonEngine.runHiddenTests = function(result){

    let question = this.currentQuestion;

    if(!question){

        return result;

    }

    if(!question.hiddenTests){

        return result;

    }

    let output = this.normalizeOutput(

        result.output

    );

    question.hiddenTests.forEach(function(test){

        let expected =

        PythonEngine.normalizeOutput(

            test.expectedOutput

        );

        if(output===expected){

            result.hiddenPassed++;

        }

    });

    return result;

};



/* =====================================================
   CALCULATE SCORE
===================================================== */

PythonEngine.calculateScore = function(result){

    let question = this.currentQuestion;

    let total = 0;

    if(question.visibleTests){

        total += question.visibleTests.length;

    }

    if(question.hiddenTests){

        total += question.hiddenTests.length;

    }

    if(total===0){

        result.score = 100;

        result.passed = true;

        return result;

    }

    let passed =

        result.visiblePassed +

        result.hiddenPassed;

    result.failedCases =

        total-passed;

    result.score =

        Math.round(

            (passed*100)/total

        );

    result.passed =

        passed===total;

    return result;

};



/* =====================================================
   FINAL EVALUATION
===================================================== */

PythonEngine.evaluateTests =

async function(result){

    result =

    this.runVisibleTests(result);

    result =

    this.runHiddenTests(result);

    result =

    this.calculateScore(result);

    return result;

};



/* =====================================================
   READY CHECK
===================================================== */

PythonEngine.isReady = function(){

    return this.initialized;

};



/* =====================================================
   ENGINE VERSION
===================================================== */

PythonEngine.version = function(){

    return "1.0";

};



/* =====================================================
   END OF PYTHON ENGINE
===================================================== */
