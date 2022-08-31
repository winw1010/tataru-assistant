'use strict';

// electron module
//const { BrowserWindow } = require('electron');

// index id
let indexWindow = null;

// set index window
function setIndex(window) {
    indexWindow = window;
}

// send index
function sendIndex(channel, ...args) {
    if (indexWindow) {
        try {
            indexWindow.webContents.send(channel, ...args);
        } catch (error) {
            console.log(error);
        }
    }
}

// exports
module.exports = {
    setIndex,
    sendIndex,
};
