# ==========================================================
# CODING BATTLE ARENA
# MASTER CHALLENGE
# PROJECT ARCHITECTURE
# Version : 1.0
# ==========================================================

Last Updated :
Status : FROZEN


==========================================================
1. PROJECT STRUCTURE
==========================================================

Root/

│
├── index.html
│
├── pythonEngine.js
│
├── js/
│     ├── app.js
│     └── config.js
│
├── css/
│     ├── style.css
│     └── responsive.css
│
├── data/
│     ├── easy_part1.json
│     ├── easy_part2.json
│     ├── medium_part1.json
│     ├── ...
│
└── config/



==========================================================
2. FROZEN FILES
==========================================================

These files must NEVER be rewritten completely.

✔ index.html

✔ style.css

✔ responsive.css

✔ app.js

✔ config.js

Only modify functions when absolutely required.


Editable Files

✔ pythonEngine.js

✔ data/*.json



==========================================================
3. HTML IDs (FROZEN)
==========================================================

questionTitle

questionScenario

questionTask

questionInput

questionOutput

questionConstraints

sampleInput

sampleOutput

codingArea

programOutput

runtime

score

visiblePassed

hiddenPassed

failedCases

resultStatus

questionPalette

playerName

playerXP

playerCoins

playerLevel

timer

progressValue



DO NOT RENAME ANY ID.



==========================================================
4. JSON SCHEMA (FROZEN)
==========================================================

Every question must follow EXACTLY this structure.


{

"id":1,

"title":"",

"topic":"",

"difficulty":"",

"caseStudy":"",

"task":"",

"inputFormat":"",

"outputFormat":"",

"constraints":"",

"sampleInput":"",

"sampleOutput":"",

"starterCode":"",

"visibleTests":[

{

"input":"",

"expectedOutput":""

}

],

"hiddenTests":[

{

"input":"",

"expectedOutput":""

}

]

}



NO NEW FIELD

NO FIELD RENAME



==========================================================
5. CONFIG (FROZEN)
==========================================================

QUESTION_FOLDER

DEFAULT_LEVEL

QUESTIONS_PER_SESSION

CHALLENGE_TIME

AUTO_SAVE_INTERVAL

DEFAULT_XP

DEFAULT_COINS



==========================================================
6. PYTHON ENGINE PUBLIC API
==========================================================

The following functions MUST ALWAYS EXIST.


initialize()

isReady()

setQuestion()

setCode()

getCode()

run()

clearConsole()



Their names SHALL NEVER CHANGE.



==========================================================
7. APP.JS RULES
==========================================================

app.js NEVER directly talks to Pyodide.

It communicates ONLY through PythonEngine.



==========================================================
8. PYTHON ENGINE RULES
==========================================================

PythonEngine is responsible for

✔ initialize Pyodide

✔ input()

✔ print()

✔ runtime

✔ visible tests

✔ hidden tests

✔ score

✔ pass/fail

✔ output



==========================================================
9. NAMING RULES
==========================================================

Never rename

Functions

Variables used by app.js

HTML IDs

JSON fields



==========================================================
10. DEVELOPMENT RULES
==========================================================

Rule 1

Never replace a working file.


Rule 2

Modify one function at a time.


Rule 3

Test after every modification.


Rule 4

Never redesign architecture after freeze.


Rule 5

Any architecture change MUST first be added to this document.


Rule 6

Public APIs are permanent.


Rule 7

Never break backward compatibility.



==========================================================
11. PROJECT STATUS
==========================================================

Architecture

✅ Frozen

UI

✅ Frozen

CSS

✅ Frozen

Navigation

✅ Frozen

Question Loader

✅ Frozen

JSON Structure

✅ Frozen

Remaining Work

☐ pythonEngine.js

☐ Question Bank

☐ Final Testing

==========================================================
END OF DOCUMENT
==========================================================
