'use strict';

// ASMSignature [0,0] = Target Base Address(Value in ["ffxiv_dx11.exe"+XXXXXXXX])

// CUTSCENE
// MAX DIFFERENT OFFSETS PER NODE: 4
// MAXIUM OFFSET VALUE: 65535
// MAX LEVEL: 5
// PATH: 68 250 0

// DIALOG NAME
// MAX DIFFERENT OFFSETS PER NODE: 4
// MAXIUM OFFSET VALUE: 65535
// MAX LEVEL: 5
// NOT ACTION, NOT OBJECT, NOT SKILL

// DIALOG TEXT
// MAX DIFFERENT OFFSETS PER NODE: 4
// MAXIUM OFFSET VALUE: 65535
// MAX LEVEL: 5
// PATH: 68 250 200 (BROKEN)
// NOT ACTION, NOT OBJECT, NOT SKILL, WITH NEW LINE
// STEP 100, FIRST ONE, SAME BASE WITH NAME, END WITH 200

// child process
const childProcess = require('child_process');

// file module
const fileModule = require('./file-module');

// server module
const serverModule = require('./server-module');

// sharlayan path
const sharlayanPath = fileModule.getRootPath('src', 'data', 'SharlayanReader', 'SharlayanReader.exe');

// version path
const versionPath = fileModule.getRootPath('src', 'data', 'text', 'version.json');

// child
let child = null;

// do restart
let restartReader = true;

// start
function start() {
    try {
        if (fileModule.exists(versionPath)) {
            try {
                const signatures = JSON.parse(fileModule.read(versionPath)).signatures;
                if (signatures) {
                    let indexPanelName = findIndex(signatures, 'Key', 'PANEL_NAME');
                    let indexPanelName10 = findIndex(signatures, 'Key', 'PANEL_NAME_10');
                    let indexPanelName11 = findIndex(signatures, 'Key', 'PANEL_NAME_11');

                    //let indexPanelText = findIndex(signatures, 'Key', 'PANEL_TEXT');
                    //let indexPanelText10 = findIndex(signatures, 'Key', 'PANEL_TEXT_10');
                    //let indexPanelText11 = findIndex(signatures, 'Key', 'PANEL_TEXT_11');

                    if (childProcess.execSync('ver').toString().includes('10.0.22')) {
                        signatures[indexPanelName].PointerPath = signatures[indexPanelName11].PointerPath;
                        //signatures[indexPanelText].PointerPath = signatures[indexPanelText11].PointerPath;
                    } else {
                        signatures[indexPanelName].PointerPath = signatures[indexPanelName10].PointerPath;
                        //signatures[indexPanelText].PointerPath = signatures[indexPanelText10].PointerPath;
                    }

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
            try {
                let dataArray = data.toString().split('\r\n');
                for (let index = 0; index < dataArray.length; index++) {
                    let element = dataArray[index];
                    if (element.length > 0) serverModule.dataProcess(element);
                }
            } catch (error) {
                console.log(error);
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

// find index
function findIndex(array = [], key = '', value = '') {
    let target = -1;
    for (let index = 0; index < array.length; index++) {
        if (array[index][key] === value) {
            target = index;
            break;
        }
    }
    return target;
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
