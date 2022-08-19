'use strict';

// electron module
const { BrowserWindow } = require('electron');

// index id
let indexId = -1;

// set id
function setId(id) {
    indexId = id;
}

// send index
function sendIndex(channel, ...args) {
    if (indexId >= 0) {
        BrowserWindow.fromId(indexId).webContents.send(channel, ...args);
    }
}

// exports
module.exports = {
    setId,
    sendIndex,
};
