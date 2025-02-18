'use strict';

// FIND ASMSignature:
// 1. FINDOUT TARGET'S BASE ADDRESS, THEN FIND OUT WHAT ACCESS TO THIS ADDRESS
// 2. SELECT ONE OF THE INSTRUCTIONS, THEN CLICK 'SHOW DISASSEMBLER'
// 3. IF BYTE NOT LONG ENOUGH, SELECT OTHER INSTRUCTION
// 4. COPY THE BYTES, ATLEAST 3 ROWS, AND DON'T COPY CONTINUOUS 8 BYTES

// CHECK ASMSignature:
// 1. SCAN OPTION: ARRAY OF BYTE/ HEX/ CHECK 'EXECUTABLE'
// 2. PASTE THE BYTES, THEN CLICK FIRST SCAN
// 3. ONLY 1 RESULT = CORRECT BYTES

// FIND POINTER PATH
// 1. LOG IN THE GAME, AND CHANGE MAP ATLEAST ONE TIME, AND SCAN THE STRING BELOW, RIGHT CLICK THE ADDRESS, SELECT 'GENERATE POINTERMAP'
// 2. RESTART THE GAME, AND CHANGE MAP ATLEAST ONE TIME, AND SCAN THE STRING BELOW AGAIN, THEN RIGHT CLICK THE ADDRESS, SELECT 'POINTER SCAN FOR THIS ADDRESS'
// 3. TEST THE PROBABLY RESULT

// ASMSignature path[0,0]: TARGET'S BASE ADDRESS(VALUE OF ["ffxiv_dx11.exe"+XXXXXXX])
// DIALOG AND CUTSCENE HAVE SAME BASE ADDRESS

// MAX DIFFERENT OFFSETS PER NODE: 4
// MAXIUM OFFSET VALUE: 65535
// MAX LEVEL: 7

// DIALOG NAME
// PATH: 20 38A8 ...OTHER
// NOT ACTION, NOT OBJECT, NOT SKILL
// REMEMBER ADD 2 TO LAST OFFSET

// DIALOG TEXT
// PATH: 20 38A8 ...OTHER
// NOT ACTION, NOT OBJECT, NOT SKILL, NO NEW LINE
// STEP 100, FIRST ONE

// CUTSCENE
// PATH: 68 250 0

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

            // skip invalid text(EF BF BD)
            if (/\uFFFD/.test(dialogData.text)) {
              continue;
            }

            // fix dialog data text
            fixText(dialogData);

            // check repetition
            if (isNotRepeated(dialogData)) {
              serverModule.dataProcess(dialogData);
            } else {
              console.log('Repeated text');
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

// fix text
function fixText(dialogData) {
  if (dialogData.type !== 'CONSOLE') {
    dialogData.text = dialogData.text
      .replaceAll(/^#/gi, '')
      .replaceAll(')*', '')
      .replaceAll('%&', '')
      .replaceAll('「+,', '「');
  }
}

// fix text 2
function fixText2(text = '') {
  return text
    .replaceAll('\r', '')
    .replace(/（.*?）/gi, '')
    .replace(/\(.*?\)/gi, '');
}

// check repetition
function isNotRepeated(dialogData) {
  const code = dialogData.code;
  const text = fixText2(dialogData.text);

  // DIALOG 003D
  if (dialogData.type === 'DIALOG') {
    dialogHistory.push(text);
    if (dialogHistory.length > 20) dialogHistory.splice(0, 10);
  }
  // other 003D
  else if (dialogData.code === '003D') {
    for (let index = 0; index < dialogHistory.length; index++) {
      const dialogText = fixText2(dialogHistory[index]);

      if (compareString(dialogText, text)) {
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
function compareString(str1 = '', str2 = '') {
  for (let index = 0; index < str1.length; index++) {
    const str = str1[index];
    str2 = str2.replace(str, '');
  }

  return !/[0-9a-z０-９ａ-ｚＡ-Ｚぁ-ゖァ-ヺ一-龯]/gi.test(str2);
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
