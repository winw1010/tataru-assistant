'use strict';

// CUTSCENE
// MAX LEVEL: 9
// PATH: 68 250 0

// DIALOG NAME
// MAX LEVEL: 8
// PATH: 28 28 D88 68 78 40 E0
// NOT ACTION, IS OBJECT

// DIALOG TEXT
// MAX LEVEL: 7
// PATH: 68 250 200
// NOT ACTION

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
                    fileModule.write(fileModule.getRootPath('signatures.json'), signatures, 'json');
                }
            } catch (error) {
                console.log(error);
            }
        }

        //child = childProcess.spawn(sharlayanPath);
        child = childProcess.execFile(sharlayanPath);

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
            if (typeof data === 'string') {
                let dataArray = data.split('\r\n');
                for (let index = 0; index < dataArray.length; index++) {
                    let element = dataArray[index];
                    if (element.length > 0) serverModule.dataProcess(element);
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
