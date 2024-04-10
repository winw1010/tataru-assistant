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

// sharlayan path
const sharlayanPath = fileModule.getRootPath('src', 'data', 'SharlayanReader', 'SharlayanReader.exe');

// version path
const versionPath = fileModule.getRootPath('src', 'data', 'text', 'signatures.json');

// child
let child = null;

// do restart
let restartReader = true;

// dialog history
const dialogHistory = [];

// chat history
const chatHistory = {};

// start
function start() {
  try {
    if (fileModule.exists(versionPath)) {
      try {
        const signatures = fileModule.read(versionPath, 'json');
        if (signatures) {
          fileModule.write(fileModule.getRootPath('signatures.json'), signatures, 'json');
        }
      } catch (error) {
        console.log(error);
      }
    }

    child = childProcess.spawn(sharlayanPath);

    child.on('close', (code) => {
      console.log(`SharlayanReader.exe closed (code: ${code})`);
      if (restartReader) {
        start();
      }
    });

    child.on('error', (err) => {
      console.log(err.message);
    });

    child.stdout.on('error', (err) => {
      console.log(err.message);
    });

    child.stdout.on('data', (data) => {
      let dataArray = data.toString().split('\r\n');
      for (let index = 0; index < dataArray.length; index++) {
        try {
          let jsonString = dataArray[index];
          if (jsonString.length > 0) {
            let dialogData = JSON.parse(jsonString.toString());
            dialogData = fixText(dialogData);
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
    child.kill('SIGINT');
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

  if (dialogData.type === 'DIALOG') {
    dialogHistory.push(text);
    if (dialogHistory.length > 20) dialogHistory.splice(0, 10);
  } else if (dialogData.type === 'CHAT_LOG' && dialogData.code === '003D') {
    if (dialogHistory.length - dialogHistory.indexOf(text) <= 3) return false;
  }

  if (text !== chatHistory[code]) {
    chatHistory[code] = text;
    return true;
  }

  return false;
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
