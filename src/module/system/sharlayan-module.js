'use strict';

// Old base: "ffxiv_dx11.exe"+02999D88
// 4D 89 63 D8 4D 89 73 D0 33 DB 4C 8B 35
// NAME 20 38A8 238 F2
// TEXT 20 38A8 3B8 0
// CUTSCENE 20 6958 240 138 0

// Recent base: "ffxiv_dx11.exe"+027F1CF8
// 488941104488492C4C8949244C89491C4584C07412488B4218488905********48890D
// NAME F8 F8 20 38A8 238 F2
// TEXT F8 F8 20 38A8 350 0
// CUTSCENE F8 F8 68 270 0

// FIND ASMSignature:
// 1. FINDOUT TARGET'S BASE ADDRESS, THEN FIND OUT WHAT ACCESS TO THIS ADDRESS
// 2. SELECT ONE OF THE INSTRUCTIONS, THEN CLICK 'SHOW DISASSEMBLER'
// 3. IF BYTE NOT LONG ENOUGH, SELECT OTHER INSTRUCTION
// 4. COPY THE BYTES, ATLEAST 3 ROWS, AND DON'T COPY CONTINUOUS 8 BYTES

// CHECK ASMSignature:
// 1. SCAN OPTION: VALUE TYPE: ARRAY OF BYTE, CHECK HEX, CHECK 'WRITABLE' AND 'EXECUTABLE' TO SQUARE
// 2. PASTE THE BYTES, THEN CLICK FIRST SCAN
// 3. ONLY 1 RESULT = CORRECT BYTES
// 4. RIGHT CLICK AND SELECT 'DISASSEMBLE THIS MEMORY REGION' TO VIEW THE BASE ADDRESS ("ffxiv_dx11.exe"+XXXXXXX)

// FIND POINTER PATH
// 1. LOG IN THE GAME, AND CHANGE MAP ATLEAST ONE TIME, AND SCAN THE STRING BELOW, RIGHT CLICK THE ADDRESS, SELECT 'GENERATE POINTERMAP'
// 2. RESTART THE GAME, AND CHANGE MAP ATLEAST ONE TIME, AND SCAN THE STRING BELOW AGAIN, THEN RIGHT CLICK THE ADDRESS, SELECT 'POINTER SCAN FOR THIS ADDRESS'
// 3. TEST THE PROBABLY RESULT

// ASMSignature path[0,0]: TARGET'S BASE ADDRESS (VALUE OF ["ffxiv_dx11.exe"+XXXXXXX])
// DIALOG AND CUTSCENE HAVE SAME BASE ADDRESS

// MAX DIFFERENT OFFSETS PER NODE: 4
// MAXIUM OFFSET VALUE: 65535
// MAX LEVEL: 7

// DIALOG NAME
// PATH: F8 F8 20 38A8 ...OTHER
// NOT ACTION, NOT OBJECT, NOT SKILL
// REMEMBER ADD 2 TO LAST OFFSET

// DIALOG TEXT
// PATH: F8 F8 20 38A8 ...OTHER
// NOT ACTION, NOT OBJECT, NOT SKILL, NO NEW LINE
// ヴォイドの旁観者 カットシーン3：ついたあだ名は、野蛮な女（バルバリシア）

// CUTSCENE
// PATH: F8 F8 68 ...OTHER

// CUTSCENE 2
// TRIAL: 99, 100
// NO CUTSCENE FLAG

// CUTSCENE DETECTOR
// IN CUTSCENE: 0
// NOT IN CUTSCENE: 1
// GREEN ADDRESS

// HEX TO DECIMAL: console.log(0x38A8)
// DECIMAL TO HEX: console.log((14504).toString(16))

// child process
const childProcess = require('child_process');

// file module
const fileModule = require('./file-module');

// server module
const serverModule = require('./server-module');

// sharlayan history path
// const sharlayanHistoryPath = fileModule.getRootPath('src', 'data', readerName, 'history.json');

// reader name
const readerName = 'tataru-assistant-reader';

// sharlayan.exe path
const sharlayanExePath = fileModule.getRootPath('src', 'data', readerName, readerName + '.exe');

// data signatures path
const dataSignaturesPath = fileModule.getRootPath('src', 'data', 'text', 'signatures.json');

// root signatures path
const rootSignaturesPath = fileModule.getRootPath('signatures.json');

// reader process
let readerProcess = null;

// do restart
let restartReader = true;

// dialog history
const dialogHistory = [];

// text history
const textHistory = {};

// pure text
const regexPureText = /[^0-9a-z０-９ａ-ｚＡ-Ｚぁ-ゖァ-ヺ一-龯]/gi;

// start
function start() {
  try {
    /*
    // read history
    if (fileModule.exists(sharlayanHistoryPath)) {
      const history = fileModule.read(sharlayanHistoryPath, 'json');
      dialogHistory = history.dialogHistory || [];
      textHistory = history.textHistory || {};
      textHistory['FFFF'] = '';
    }
    */

    // update signatures.json
    if (fileModule.exists(dataSignaturesPath)) {
      const signatures = fileModule.read(dataSignaturesPath, 'json');
      if (signatures) {
        fileModule.write(rootSignaturesPath, signatures, 'json');
      }
    }

    // spawn reader process
    readerProcess = childProcess.spawn(sharlayanExePath);

    // on reader close
    readerProcess.on('close', (code) => {
      console.log(`${readerName}.exe closed (code: ${code})`);

      // write history
      // fileModule.write(sharlayanHistoryPath, { dialogHistory, textHistory }, 'json');

      // restart if app is not closed
      if (restartReader) {
        start();
      }
    });

    // on reader error
    readerProcess.on('error', (err) => {
      console.log(err.message);
    });

    // on reader stdout error
    readerProcess.stdout.on('error', (err) => {
      console.log(err.message);
    });

    // on reader stdout data
    readerProcess.stdout.on('data', (data) => {
      // split data string by \r\n
      const dataArray = data.toString().split('\r\n');

      // read data
      for (let index = 0; index < dataArray.length; index++) {
        try {
          const jsonString = dataArray[index];

          if (jsonString.length > 0) {
            // get dialog data
            const dialogData = JSON.parse(jsonString.toString());

            // skip invalid characters(EF BF BD, DEL)
            if (/[\uFFFD\u007F]/.test(dialogData.name) || /[\uFFFD\u007F]/.test(dialogData.text)) {
              console.log('\r\nInvalid Dialog Data:', dialogData);
              continue;
            } else {
              console.log('\r\nDialog Data:', dialogData);
            }

            // check repetition
            if (isNotRepeated(dialogData)) {
              serverModule.dataProcess(dialogData);
            } else {
              console.log('Skip Repeated Dialog.');
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

// stop
function stop(restart = true) {
  restartReader = restart;
  try {
    readerProcess.kill('SIGINT');
  } catch (error) {
    console.log(error);
  }
}

// clear text
function clearText(text = '') {
  return text.replace(/（.*?）/gi, '').replace(/\(.*?\)/gi, '');
  //.replace(/FE/g, ''); // Temporary fix
}

// check repetition
function isNotRepeated(dialogData) {
  const code = dialogData.code;
  const text = clearText(dialogData.text);

  // DIALOG 003D
  if (dialogData.type === 'DIALOG') {
    if (text !== dialogHistory.slice(-1)[0]) {
      dialogHistory.push(text);
      if (dialogHistory.length > 20) dialogHistory.splice(0, 10);
    } else {
      return false;
    }
  }
  // other 003D
  else if (dialogData.code === '003D') {
    for (let index = 0; index < dialogHistory.length; index++) {
      const dialogText = dialogHistory[index];

      if (isSameText(dialogText, text)) {
        return false;
      }
    }
  }
  // other code
  else {
    if (textHistory[code] === text) {
      return false;
    } else {
      textHistory[code] = text;
    }
  }

  return true;
}

// compare string
function isSameText(str1 = '', str2 = '') {
  str1 = str1.replace(regexPureText, '');
  str2 = str2.replace(regexPureText, '');

  return str1 === str2;
}

// module exports
module.exports = {
  start,
  stop,
};

/*
const exec = require('child_process').exec;

const isRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32':
            cmd = `tasklist`;
            break;
        case 'darwin':
            cmd = `ps -ax | grep ${query}`;
            break;
        case 'linux':
            cmd = `ps -A`;
            break;
        default:
            break;
    }
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
};

isRunning('chrome.exe', (status) => {
    console.log(status); // true|false
});
*/
