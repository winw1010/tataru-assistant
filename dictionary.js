'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setIPC();
    setButton();
});

// set view
function setView() {}

// set IPC
function setIPC() {}

// set button
function setButton() {}
