'use strict';

// child process
const childProcess = require('child_process');

// file module
const fileModule = require('./file-module');

// server module
const serverModule = require('./server-module');

// sharlayan path
const sharlayanPath = fileModule.getRootPath('src', 'data', 'sharlayan-test', 'sharlayan-test.exe');

// child
let child = null;

// bat path
//const batPath = fileModule.getRootPath('src', 'data', 'sharlayan-test', 'start-sharlayan-test.bat');

// start
async function start() {
    //fileModule.write(batPath, createBatString());
    //childProcess.execFile(batPath);

    try {
        child.kill('SIGINT');
    } catch (error) {
        //console.log(error);
    }

    child = childProcess.spawn(sharlayanPath);
    child.stdout.on('data', (data) => {
        if (Buffer.isBuffer(data)) {
            let dataArray = data.toString('utf8').split('\r\n');
            for (let index = 0; index < dataArray.length; index++) {
                let element = dataArray[index];
                if (element.length > 0) serverModule.dataProcess(element);
            }
        }
    });
}

/*
// create bat string
function createBatString() {
    return `@echo off

    :: BatchGotAdmin
    :-------------------------------------
    REM  --> Check for permissions
        IF "%PROCESSOR_ARCHITECTURE%" EQU "amd64" (
    >nul 2>&1 "%SYSTEMROOT%\\SysWOW64\\cacls.exe" "%SYSTEMROOT%\\SysWOW64\\config\\system"
    ) ELSE (
    >nul 2>&1 "%SYSTEMROOT%\\system32\\cacls.exe" "%SYSTEMROOT%\\system32\\config\\system"
    )
    
    REM --> If error flag set, we do not have admin.
    if '%errorlevel%' NEQ '0' (
        echo Requesting administrative privileges...
        goto UACPrompt
    ) else ( goto gotAdmin )
    
    :UACPrompt
        echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"
        set params= %*
        echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params:"=""%", "", "runas", 1 >> "%temp%\\getadmin.vbs"
    
        "%temp%\\getadmin.vbs"
        del "%temp%\\getadmin.vbs"
        exit /B
    
    :gotAdmin
        pushd "%CD%"
        CD /D "%~dp0"
    :--------------------------------------    
    "${sharlayanPath}"
    exit`;
}
*/

// module exports
module.exports = {
    start,
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
