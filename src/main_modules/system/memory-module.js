// testing
'use strict';

const memoryjs = require('memoryjs');
const pointerPath = [0x020d0cc0, 0x68, 0x250, 0x0];
let lastLog = '';
let processObject = null;

start();

function start() {
    setInterval(() => {
        if (!processObject) {
            try {
                processObject = getProcess();
                if (processObject) {
                    scanMemory();
                }
            } catch (error) {
                writeLog('Waiting process...(' + error + ')');
            }
        }
    }, 1000);
}

function getProcess(processName = 'ffxiv_dx11.exe') {
    return memoryjs.openProcess(processName);
}

function scanMemory() {
    const interval = setInterval(() => {
        try {
            writeLog(getValue(processObject, pointerPath));
        } catch (error) {
            writeLog(error);
            clearInterval(interval);
            processObject = null;
        }
    }, 100);
}

function getValue(processObject, pointerPath = []) {
    return memoryjs.readMemory(processObject.handle, getPointedAddress(processObject, pointerPath), memoryjs.STRING);
}

function getPointedAddress(processObject, pointerPath = []) {
    let address = null;

    for (let index = 0; index < pointerPath.length - 1; index++) {
        const pointer = pointerPath[index];

        address = memoryjs.readMemory(
            processObject.handle,
            (index === 0 ? processObject.modBaseAddr : address) + pointer,
            memoryjs.INT32
        );
    }

    return address + pointerPath.pop();
}

function writeLog(message) {
    if (message != lastLog) {
        lastLog = message;
        console.log(lastLog);
    }
}
