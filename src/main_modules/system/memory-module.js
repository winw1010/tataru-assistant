'use strict';

// child process
const { exec } = require('child_process');

// file module
const fileModule = require('./file-module');

// bat path
const batPath = fileModule.getRootPath('src', 'data', 'sharlayan-test', 'start-sharlayan-test.bat');

// sharlayan path
const sharlayanPath = fileModule.getRootPath('src', 'data', 'sharlayan-test', 'sharlayan-test.exe');

// bat string
const batString = `@echo off
%1 %2
ver|find "5.">nul&&goto :Admin
mshta vbscript:createobject("shell.application").shellexecute("%~s0","goto :Admin","","runas",1)(window.close)&goto :eof
:Admin
${sharlayanPath}
`;

function start() {
    fileModule.fileWriter(batPath, batString);
    exec(batPath);
}

module.exports = {
    start,
};
