'use strict';

// electron modules
const { BrowserWindow, screen } = require('electron');

// file module
const fileModule = require('./file-module');

// config module
const configModule = require('./config-module');

// chat code module
const chatCodeModule = require('./chat-code-module');

// window list
let windowList = {};

// create window
function createWindow(windowName, data = null) {
    try {
        // get config
        const config = configModule.getConfig();

        // get size
        const windowSize = getWindowSize(windowName, config);

        // create new window
        const window = new BrowserWindow({
            x: windowSize.x,
            y: windowSize.y,
            width: windowSize.width,
            height: windowSize.height,
            show: false,
            frame: false,
            transparent: true,
            fullscreenable: false,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
                preload: fileModule.getPath(__dirname, '..', '..', `${windowName}.js`),
            },
        });

        // set always on top
        const alwaysOnTop = windowName !== 'edit';
        window.setAlwaysOnTop(alwaysOnTop, 'screen-saver');

        // set minimizable
        window.setMinimizable(false);

        // show window
        window.once('ready-to-show', () => {
            window.show();
        });

        // send data
        if (data) {
            window.webContents.once('did-finish-load', () => {
                window.webContents.send('send-data', data);
            });
        }

        switch (windowName) {
            case 'index':
                // set foucusable
                window.setFocusable(config.indexWindow.focusable);
                window.on('restore', () => {
                    const config = configModule.getConfig();
                    window.setFocusable(config.indexWindow.focusable);
                });
                window.on('minimize', () => {
                    window.setFocusable(true);
                });

                window.once('close', () => {
                    // get config
                    const config = configModule.getConfig();

                    // set bounds
                    config.indexWindow.x = window.getPosition()[0];
                    config.indexWindow.y = window.getPosition()[1];
                    config.indexWindow.width = window.getSize()[0];
                    config.indexWindow.height = window.getSize()[1];
                    configModule.setConfig(config);

                    // save config
                    configModule.saveConfig();

                    // save chat code
                    chatCodeModule.saveChatCode();
                });
                break;

            case 'capture':
                window.once('close', () => {
                    // get config
                    const config = configModule.getConfig();

                    // set bounds
                    config.captureWindow.x = window.getPosition()[0];
                    config.captureWindow.y = window.getPosition()[1];
                    config.captureWindow.width = window.getSize()[0];
                    config.captureWindow.height = window.getSize()[1];
                    configModule.setConfig(config);
                });
                break;

            default:
                break;
        }

        // load html
        window.loadFile(fileModule.getPath(__dirname, '..', '..', `${windowName}.html`));

        // save window
        setWindow(windowName, window);
    } catch (error) {
        console.log(error);
    }
}

// get window size
function getWindowSize(windowName, config) {
    // set default value
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    // get current display bounds
    const displayBounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;

    switch (windowName) {
        case 'index': {
            // first time
            if (
                config.indexWindow.x === null ||
                config.indexWindow.y === null ||
                config.indexWindow.width === null ||
                config.indexWindow.height === null
            ) {
                x = displayBounds.x + parseInt(displayBounds.width * 0.7);
                y = displayBounds.y + parseInt(displayBounds.height * 0.2);
                width = parseInt(displayBounds.width * 0.2);
                height = parseInt(displayBounds.height * 0.6);
                break;
            } else {
                x = config.indexWindow.x;
                y = config.indexWindow.y;
                width = config.indexWindow.width;
                height = config.indexWindow.height;
                break;
            }
        }

        case 'capture': {
            // first time
            if (
                config.captureWindow.x === null ||
                config.captureWindow.y === null ||
                config.captureWindow.width === null ||
                config.captureWindow.height === null
            ) {
                x = displayBounds.x + parseInt(displayBounds.width * 0.33);
                y = displayBounds.y + parseInt(displayBounds.height * 0.63);
                width = parseInt(displayBounds.width * 0.33);
                height = parseInt(displayBounds.height * 0.36);
                break;
            } else {
                x = config.captureWindow.x;
                y = config.captureWindow.y;
                width = config.captureWindow.width;
                height = config.captureWindow.height;
                break;
            }
        }

        case 'capture-edit': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(displayBounds.width * 0.27);
            height = parseInt(displayBounds.height * 0.42);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        case 'config': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(displayBounds.width * 0.22);
            height = parseInt(displayBounds.height * 0.65);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        case 'dictionary': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(displayBounds.width * 0.3);
            height = parseInt(displayBounds.height * 0.6);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        case 'edit': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(displayBounds.width * 0.5);
            height = parseInt(displayBounds.height * 0.65);
            x = getNearX(indexBounds, width);
            y = getNearY(indexBounds, height);
            break;
        }

        case 'read-log': {
            const indexBounds = windowList['index'].getBounds();
            width = parseInt(displayBounds.width * 0.2);
            height = parseInt(displayBounds.height * 0.22);
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

// restart window
function restartWindow(windowName, data) {
    try {
        closeWindow(windowName);
        throw null;
    } catch (error) {
        createWindow(windowName, data);
    }
}

// get window
function getWindow(windowName) {
    return windowList[windowName];
}

// set window
function setWindow(windowName, myWindow) {
    windowList[windowName] = myWindow;
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

// console log
function consoleLog(text) {
    sendIndex('console-log', text);
}

// module exports
module.exports = {
    createWindow,
    getWindowSize,
    restartWindow,
    setWindow,
    getWindow,
    closeWindow,
    sendWindow,
    sendIndex,
    forEachWindow,
    openDevTools,
    consoleLog,
};
