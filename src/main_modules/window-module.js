'use strict';

// electron modules
const { screen } = require('electron');

// window list
let windowList = {
    index: null,
    edit: null,
    config: null,
    capture: null,
    'capture-edit': null,
    'read-log': null,
    dictionary: null,
};

// get window size
function getWindowSize(windowName, config) {
    // set default value
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    // get current display bounds
    const displayBounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;

    // get current screen size
    const screenWidth = displayBounds.width;
    const screenHeight = displayBounds.height;

    switch (windowName) {
        case 'index': {
            // first time
            if (
                config.indexWindow.x == null ||
                config.indexWindow.y == null ||
                config.indexWindow.width == null ||
                config.indexWindow.height == null
            ) {
                config.indexWindow.x = displayBounds.x + parseInt(screenWidth * 0.7);
                config.indexWindow.y = parseInt(screenHeight * 0.2);
                config.indexWindow.width = parseInt(screenWidth * 0.2);
                config.indexWindow.height = parseInt(screenHeight * 0.6);
            }

            x = config.indexWindow.x;
            y = config.indexWindow.y;
            width = config.indexWindow.width;
            height = config.indexWindow.height;
            break;
        }

        case 'capture': {
            // first time
            if (
                config.captureWindow.x == null ||
                config.captureWindow.y == null ||
                config.captureWindow.width == null ||
                config.captureWindow.height == null
            ) {
                config.captureWindow.x = displayBounds.x + parseInt(screenWidth * 0.33);
                config.captureWindow.y = parseInt(screenHeight * 0.63);
                config.captureWindow.width = parseInt(screenWidth * 0.33);
                config.captureWindow.height = parseInt(screenHeight * 0.36);
            }

            x = config.captureWindow.x;
            y = config.captureWindow.y;
            width = config.captureWindow.width;
            height = config.captureWindow.height;
            break;
        }

        case 'capture-edit': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(screenWidth * 0.27);
            height = parseInt(screenHeight * 0.42);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        case 'config': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(screenWidth * 0.22);
            height = parseInt(screenHeight * 0.65);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        case 'edit': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(screenWidth * 0.5);
            height = parseInt(screenHeight * 0.65);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        case 'read-log': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(screenWidth * 0.2);
            height = parseInt(screenHeight * 0.22);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        case 'dictionary': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(screenWidth * 0.3);
            height = parseInt(screenHeight * 0.6);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        default:
            break;
    }

    return {
        x: x >= displayBounds.x && x < displayBounds.x + displayBounds.width ? x : displayBounds.x,
        y: y >= displayBounds.y && y < displayBounds.y + displayBounds.height ? y : displayBounds.y,
        width: width,
        height: height,
    };

    function getNearX(indexBounds, width) {
        return indexBounds.x - width > displayBounds.x ? indexBounds.x - width : indexBounds.x + indexBounds.width;
    }

    function getNearY(indexBounds, height) {
        return indexBounds.y + height > displayBounds.y + displayBounds.height
            ? displayBounds.y + displayBounds.height - height
            : indexBounds.y;
    }
}

// set window
function setWindow(windowName, myWindow) {
    windowList[windowName] = myWindow;
}

// get window
function getWindow(windowName) {
    return windowList[windowName];
}

// close window
function closeWindow(windowName) {
    windowList[windowName].close();
    windowList[windowName] = null;
}

// send window
function sendWindow(windowName, channel, ...args) {
    windowList[windowName]?.webContents?.send(channel, ...args);
}

// send index
function sendIndex(channel, ...args) {
    windowList['index']?.webContents?.send(channel, ...args);
}

// for each window
function forEachWindow(callback = () => {}) {
    const windowNames = Object.getOwnPropertyNames(windowList);
    windowNames.forEach((windowName) => {
        try {
            callback(windowList[windowName]);
        } catch (error) {
            //console.log(windowName, error);
        }
    });
}

// open DevTools
function openDevTools() {
    if (windowList['index']?.webContents?.isDevToolsOpened()) {
        windowList['index']?.webContents?.closeDevTools();
    } else {
        windowList['index']?.webContents?.openDevTools({ mode: 'detach' });
    }
}

// module exports
module.exports = {
    getWindowSize,
    setWindow,
    getWindow,
    closeWindow,
    sendWindow,
    sendIndex,
    forEachWindow,
    openDevTools,
};
