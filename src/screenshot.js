'use strict';

// electron
const { ipcRenderer } = require('electron');

// image processing module
const { takeScreenshot } = require('./renderer_modules/image-module');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // start screen translation
    ipcRenderer.on('get-image-text', (event, ...args) => {
        takeScreenshot(...args);
    });

    // send ready
    ipcRenderer.send('screenshot-ready');
});
