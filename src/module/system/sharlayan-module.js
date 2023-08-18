'use strict';

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

// start
function start() {
    try {
        stop();

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

        child = childProcess.spawn(sharlayanPath);
        //child = childProcess.execFile(sharlayanPath);

        child.on('close', (code) => {
            console.log(`SharlayanReader.exe closed (code: ${code})`);
        });

        child.on('error', (err) => {
            console.log(err.message);
        });

        child.stdout.on('error', (err) => {
            console.log(err.message);
        });

        child.stdout.on('data', (data) => {
            if (Buffer.isBuffer(data)) {
                let dataArray = data.toString('utf8').split('\r\n');
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
function stop() {
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
