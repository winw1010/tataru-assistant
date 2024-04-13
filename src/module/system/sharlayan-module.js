'use strict';

// ASMSignature: CODE BYTES BEFORE TARGET'S BASE ADDRESS(CHECK "Executable" WHEN SEARCHING ASMSignature)
// ASMSignature path[0,0]: TARGET'S BASE ADDRESS(VALUE OF ["ffxiv_dx11.exe"+XXXXXXX])
// FINDING ASMSignature: FINDOUT TARGET'S BASE ADDRESS, THEN FIND OUT WHAT WRITES TO THIS ADDRESS

// MAX DIFFERENT OFFSETS PER NODE: 4
// MAXIUM OFFSET VALUE: 65535
// MAX LEVEL: 5

// DIALOG NAME
// NOT ACTION, NOT OBJECT, NOT SKILL

// DIALOG TEXT
// NOT ACTION, NOT OBJECT, NOT SKILL, WITH NEW LINE
// STEP 100 OR 200, FIRST ONE

// CUTSCENE
// PATH: 68 250 0

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

// sharlayan reader
const sharlayanReader = 'sharlayan-reader'; // SharlayanReader

// sharlayan history path
const sharlayanHistoryPath = fileModule.getRootPath('src', 'data', sharlayanReader, 'history.json');

// sharlayan.exe path
const sharlayanExePath = fileModule.getRootPath('src', 'data', sharlayanReader, sharlayanReader + '.exe');

// data signatures path
const dataSignaturesPath = fileModule.getRootPath('src', 'data', 'text', 'signatures.json');

// root signatures path
const rootSignaturesPath = fileModule.getRootPath('signatures.json');

// reader process
let readerProcess = null;

// do restart
let restartReader = true;

// dialog history
let dialogHistory = [];

// text history
let textHistory = {};

// start
function start() {
  try {
    // read history
    if (fileModule.exists(sharlayanHistoryPath)) {
      const history = fileModule.read(sharlayanHistoryPath, 'json');
      dialogHistory = history.dialogHistory || [];
      textHistory = history.textHistory || {};
    }

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
      console.log(`${sharlayanReader}.exe closed (code: ${code})`);

      // write history
      fileModule.write(sharlayanHistoryPath, { dialogHistory, textHistory }, 'json');

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
      let dataArray = data.toString().split('\r\n');

      // read data
      for (let index = 0; index < dataArray.length; index++) {
        try {
          let jsonString = dataArray[index];
          if (jsonString.length > 0) {
            // get dialog data
            let dialogData = JSON.parse(jsonString.toString());

            // fix  dialog data text
            dialogData = fixText(dialogData);

            // check repetition
            if (checkRepetition(dialogData)) serverModule.dataProcess(dialogData);
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
    //console.log(error);
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
  return dialogData;
}

// check repetition
function checkRepetition(dialogData) {
  const code = dialogData.code;
  const text = dialogData.text
    .replaceAll('\r', '')
    .replaceAll(/（.*?）/gi, '')
    .replaceAll(/\(.*?\)/gi, '');

  // check dialog history (DIALOG and CHAT_LOG)
  if (dialogData.type === 'DIALOG') {
    dialogHistory.push(text);
    if (dialogHistory.length > 20) dialogHistory.splice(0, 10);
  } else if (dialogData.type === 'CHAT_LOG' && dialogData.code === '003D') {
    const targetIndex = dialogHistory.lastIndexOf(text);
    if (targetIndex >= 0 && dialogHistory.length - targetIndex <= 3) {
      return false;
    }
  }

  // check text history
  if (text === textHistory[code]) {
    return false;
  }

  textHistory[code] = text;
  return true;
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
