/* =====================================================
   CODING BATTLE ARENA
   PYTHON ENGINE
   pythonEngine.js
   Version : 1.0
===================================================== */

const PythonEngine = (function () {

    "use strict";

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const CONFIG = {

        language: "python",

        theme: "vs-dark",

        fontSize: 16,

        tabSize: 4,

        pyodideVersion: "0.25.1"

    };


    /* =====================================================
       PRIVATE VARIABLES
    ===================================================== */

    let pyodide = null;

    let editor = null;

    let currentQuestion = null;

    let initialized = false;

    let consoleOutput = "";



    /* =====================================================
       INITIALIZE ENGINE
    ===================================================== */

    async function initialize() {

        if (initialized) {

            return;

        }

        await loadPyodideEngine();

        initializeEditor();

        initialized = true;

    }



    /* =====================================================
       LOAD PYODIDE
    ===================================================== */

    async function loadPyodideEngine() {

        updateStatus("Loading Python Engine...");

        try {

            pyodide = await loadPyodide();

            updateStatus("Python Engine Ready");

            console.log("Pyodide Loaded");

        }

        catch (error) {

            console.error(error);

            updateStatus("Python Engine Failed");

            throw error;

        }

    }



    /* =====================================================
       INITIALIZE MONACO
    ===================================================== */

    function initializeEditor() {

        if (editor) {

            editor.dispose();

        }

        editor = monaco.editor.create(

            document.getElementById("codingArea"),

            {

                value: "",

                language: CONFIG.language,

                theme: CONFIG.theme,

                automaticLayout: true,

                fontSize: CONFIG.fontSize,

                tabSize: CONFIG.tabSize,

                insertSpaces: true,

                minimap: {

                    enabled: false

                },

                scrollBeyondLastLine: false,

                lineNumbers: "on",

                folding: true,

                autoIndent: "full",

                wordWrap: "on"

            }

        );

    }



    /* =====================================================
       LOAD QUESTION
    ===================================================== */

    function setQuestion(question) {

        currentQuestion = question;

        if (!editor) return;

        editor.setValue(

            question.starterCode || ""

        );

    }



    /* =====================================================
       GET CODE
    ===================================================== */

    function getCode() {

        if (!editor) {

            return "";

        }

        return editor.getValue();

    }



    /* =====================================================
       SET CODE
    ===================================================== */

    function setCode(code) {

        if (!editor) return;

        editor.setValue(code);

    }



    /* =====================================================
       RESET EDITOR
    ===================================================== */

    function reset() {

        if (!currentQuestion) return;

        setCode(

            currentQuestion.starterCode

        );

    }



    /* =====================================================
       STATUS
    ===================================================== */

    function updateStatus(message) {

        let status =

            document.getElementById(

                "statusBar"

            );

        if (status) {

            status.innerText = message;

        }

    }



    /* =====================================================
       OUTPUT
    ===================================================== */

    function clearOutput() {

        consoleOutput = "";

        let output =

            document.getElementById(

                "programOutput"

            );

        if (output) {

            output.textContent = "";

        }

    }



    function print(text) {

        consoleOutput += text + "\n";

        let output =

            document.getElementById(

                "programOutput"

            );

        if (output) {

            output.textContent = consoleOutput;

        }

    }



    /* =====================================================
       RUN (PLACEHOLDER)
    ===================================================== */

    async function run() {

        throw new Error(

            "Execution Engine not implemented."

        );

    }



    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        setQuestion,

        getCode,

        setCode,

        reset,

        run

    };

})();

/* =====================================================
   MODULE 2
   EXECUTION ENVIRONMENT
===================================================== */


/* =====================================================
   EXECUTION RESULT TEMPLATE
===================================================== */

function createExecutionResult(){

    return{

        success:false,

        output:"",

        error:"",

        runtime:0,

        exceptionType:""

    };

}


/* =====================================================
   PREPARE OUTPUT WINDOW
===================================================== */

function prepareConsole(){

    clearOutput();

}


/* =====================================================
   PYTHON STDOUT REDIRECTION
===================================================== */

async function preparePythonConsole(){

    await pyodide.runPythonAsync(`

import sys
import io

__python_output__ = io.StringIO()

sys.stdout = __python_output__
sys.stderr = __python_output__

`);

}


/* =====================================================
   READ PYTHON OUTPUT
===================================================== */

function getPythonOutput(){

    try{

        return pyodide.runPython(

            "__python_output__.getvalue()"

        );

    }

    catch(error){

        return "";

    }

}


/* =====================================================
   CLEAR PYTHON OUTPUT
===================================================== */

async function clearPythonOutput(){

    await pyodide.runPythonAsync(`

__python_output__.seek(0)
__python_output__.truncate(0)

`);

}


/* =====================================================
   EXECUTE PYTHON CODE
===================================================== */

async function executePython(code){

    let result = createExecutionResult();

    prepareConsole();

    try{

        await preparePythonConsole();

        let start = performance.now();

        await pyodide.runPythonAsync(code);

        let end = performance.now();

        result.success = true;

        result.runtime =

            Math.round(end-start);

        result.output =

            getPythonOutput();

        print(result.output);

    }

    catch(error){

        result.success = false;

        result.error =

            String(error);

        result.exceptionType =

            error.name || "RuntimeError";

        print(result.error);

    }

    await clearPythonOutput();

    return result;

}


/* =====================================================
   RUN CODE
===================================================== */

async function run(){

    if(!initialized){

        throw new Error(

            "Python Engine not initialized."

        );

    }

    let code = getCode();

    if(code.trim()===""){

        return{

            success:false,

            output:"",

            error:"Editor is empty."

        };

    }

    return await executePython(code);

}

/* =====================================================
   MODULE 3
   TEST CASE FILE MANAGER
===================================================== */


/* =====================================================
   CREATE FILE
===================================================== */

async function createFile(fileName, content){

    try{

        pyodide.FS.writeFile(

            fileName,

            content

        );

    }

    catch(error){

        console.error(error);

    }

}


/* =====================================================
   READ FILE
===================================================== */

function readFile(fileName){

    try{

        return pyodide.FS.readFile(

            fileName,

            {

                encoding:"utf8"

            }

        );

    }

    catch(error){

        return "";

    }

}


/* =====================================================
   DELETE FILE
===================================================== */

function deleteFile(fileName){

    try{

        pyodide.FS.unlink(fileName);

    }

    catch(error){

    }

}


/* =====================================================
   CREATE INPUT FILES
===================================================== */

async function prepareInputFiles(testCase){

    if(

        !testCase.inputFiles

    ){

        return;

    }

    for(

        const file of

        testCase.inputFiles

    ){

        await createFile(

            file.name,

            file.content

        );

    }

}


/* =====================================================
   REMOVE INPUT FILES
===================================================== */

function removeInputFiles(testCase){

    if(

        !testCase.inputFiles

    ){

        return;

    }

    for(

        const file of

        testCase.inputFiles

    ){

        deleteFile(

            file.name

        );

    }

}


/* =====================================================
   READ OUTPUT FILES
===================================================== */

function collectOutputFiles(testCase){

    let outputs={};

    if(

        !testCase.outputFiles

    ){

        return outputs;

    }

    for(

        const file of

        testCase.outputFiles

    ){

        outputs[file]=

        readFile(file);

    }

    return outputs;

}


/* =====================================================
   COMPARE TEXT
===================================================== */

function compareText(

    expected,

    actual

){

    expected=

    String(expected)

    .trim()

    .replace(/\r\n/g,"\n");

    actual=

    String(actual)

    .trim()

    .replace(/\r\n/g,"\n");

    return expected===actual;

}


/* =====================================================
   COMPARE OUTPUT FILES
===================================================== */

function compareOutputFiles(

    expectedFiles,

    actualFiles

){

    let failed=[];

    for(

        const file in

        expectedFiles

    ){

        let expected=

        expectedFiles[file];

        let actual=

        actualFiles[file]||"";

        if(

            !compareText(

                expected,

                actual

            )

        ){

            failed.push({

                file:file,

                expected:expected,

                actual:actual

            });

        }

    }

    return{

        success:

        failed.length===0,

        failed:failed

    };

}


/* =====================================================
   CLEANUP
===================================================== */

function cleanup(testCase){

    removeInputFiles(testCase);

}


/* =====================================================
   EXECUTE SINGLE TEST CASE
===================================================== */

async function executeTestCase(

    code,

    testCase

){

    await prepareInputFiles(

        testCase

    );

    let execution=

    await executePython(

        code

    );

    let files=

    collectOutputFiles(

        testCase

    );

    cleanup(testCase);

    return{

        execution:execution,

        files:files

    };

}
/* =====================================================
   MODULE 4
   TEST CASE ENGINE
===================================================== */


/* =====================================================
   RESULT TEMPLATE
===================================================== */

function createTestResult(){

    return{

        success:false,

        passed:false,

        totalCases:0,

        passedCases:0,

        failedCases:0,

        visiblePassed:0,

        hiddenPassed:0,

        score:0,

        runtime:0,

        output:"",

        failedList:[]

    };

}


/* =====================================================
   EXECUTE TEST CASE LIST
===================================================== */

async function executeTestGroup(

    code,

    testCases,

    isHidden=false

){

    let result={

        passed:0,

        runtime:0,

        failed:[]

    };

    if(!testCases){

        return result;

    }

    for(

        let i=0;

        i<testCases.length;

        i++

    ){

        let test=testCases[i];

        let execution=

        await executeTestCase(

            code,

            test

        );

        let passed=true;

        /* Compare Console Output */

        if(

            test.expectedOutput!==undefined

        ){

            if(

                !compareText(

                    test.expectedOutput,

                    execution.execution.output

                )

            ){

                passed=false;

            }

        }

        /* Compare Generated Files */

        if(

            passed &&

            test.expectedFiles

        ){

            let fileResult=

            compareOutputFiles(

                test.expectedFiles,

                execution.files

            );

            if(

                !fileResult.success

            ){

                passed=false;

            }

        }

        if(passed){

            result.passed++;

        }

        else{

            result.failed.push({

                index:i+1,

                hidden:isHidden,

                expectedOutput:

                    test.expectedOutput || "",

                actualOutput:

                    execution.execution.output,

                runtime:

                    execution.execution.runtime

            });

        }

        result.runtime+=

        execution.execution.runtime;

    }

    return result;

}


/* =====================================================
   RUN COMPLETE QUESTION
===================================================== */

async function evaluateQuestion(){

    let finalResult=

    createTestResult();

    let code=

    getCode();

    if(code.trim()===""){

        finalResult.output=

        "No code submitted.";

        return finalResult;

    }

    let visible=

    currentQuestion.visibleTestCases || [];

    let hidden=

    currentQuestion.hiddenTestCases || [];

    let visibleResult=

    await executeTestGroup(

        code,

        visible,

        false

    );

    let hiddenResult=

    await executeTestGroup(

        code,

        hidden,

        true

    );

    finalResult.totalCases=

        visible.length+

        hidden.length;

    finalResult.visiblePassed=

        visibleResult.passed;

    finalResult.hiddenPassed=

        hiddenResult.passed;

    finalResult.passedCases=

        visibleResult.passed+

        hiddenResult.passed;

    finalResult.failedCases=

        finalResult.totalCases-

        finalResult.passedCases;

    finalResult.runtime=

        visibleResult.runtime+

        hiddenResult.runtime;

    finalResult.failedList=[

        ...visibleResult.failed,

        ...hiddenResult.failed

    ];

    finalResult.score=

    Math.round(

        (

            finalResult.passedCases/

            Math.max(

                1,

                finalResult.totalCases

            )

        )*100

    );

    finalResult.passed=

    finalResult.failedCases===0;

    finalResult.success=true;

    return finalResult;

}


/* =====================================================
   RUN ENGINE
===================================================== */

async function run(){

    let execution=

    await evaluateQuestion();

    return execution;

}
