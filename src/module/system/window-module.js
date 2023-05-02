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
            ...windowSize,
            show: false,
            frame: false,
            transparent: true,
            fullscreenable: false,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
                preload: fileModule.getPath(__dirname, '..', '..', 'html', 'preload', `${windowName}.js`),
            },
        });

        // load html
        window.loadFile(fileModule.getPath(__dirname, '..', '..', 'html', `${windowName}.html`));

        // set always on top
        window.setAlwaysOnTop(windowName !== 'edit', 'screen-saver');

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

        // set event
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

                // set close event
                window.once('close', () => {
                    // save position
                    const config = configModule.getConfig();
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
                // set close event
                window.once('close', () => {
                    // save position
                    const config = configModule.getConfig();
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

        // devtools
        //window.webContents.openDevTools({ mode: 'detach' });

        // save window
        setWindow(windowName, window);
    } catch (error) {
        console.log(error);
    }
}

// get window size
function getWindowSize(windowName, config) {
    // default value
    let bounds = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        minWidth: 1,
        minHeight: 1,
    };

    // get display bounds nearest cursor
    const displayBounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;

    switch (windowName) {
        case 'index':
            {
                const indexBounds = config.indexWindow;

                // first time
                if (boundsValidCheck(indexBounds)) {
                    bounds.x = displayBounds.x + parseInt(displayBounds.width * 0.7);
                    bounds.y = displayBounds.y + parseInt(displayBounds.height * 0.2);
                    bounds.width = parseInt(displayBounds.width * 0.16);
                    bounds.height = parseInt(displayBounds.width * 0.16);
                } else {
                    bounds.x = indexBounds.x;
                    bounds.y = indexBounds.y;
                    bounds.width = indexBounds.width;
                    bounds.height = indexBounds.height;
                }

                if (configModule.getConfig().indexWindow.minSize) {
                    bounds.minWidth = 300;
                    bounds.minHeight = 300;
                }

                bounds = boundsSizeCheck(bounds);
            }
            break;

        case 'capture':
            {
                const captureBounds = config.captureWindow;

                // first time
                if (boundsValidCheck(captureBounds)) {
                    bounds.x = displayBounds.x + parseInt(displayBounds.width * 0.33);
                    bounds.y = displayBounds.y + parseInt(displayBounds.height * 0.63);
                    bounds.width = parseInt(displayBounds.width * 0.32);
                    bounds.height = parseInt(displayBounds.width * 0.19);
                } else {
                    bounds.x = captureBounds.x;
                    bounds.y = captureBounds.y;
                    bounds.width = captureBounds.width;
                    bounds.height = captureBounds.height;
                }

                bounds.minWidth = 600;
                bounds.minHeight = 350;
                bounds = boundsSizeCheck(bounds);
            }
            break;

        case 'capture-edit':
            {
                const indexBounds = windowList['index'].getBounds();
                bounds.width = parseInt(displayBounds.width * 0.21);
                bounds.height = parseInt(displayBounds.width * 0.21);
                bounds.minWidth = 400;
                bounds.minHeight = 400;
                bounds = getNearPosition(displayBounds, indexBounds, bounds);
            }
            break;

        case 'config':
            {
                const indexBounds = windowList['index'].getBounds();
                bounds.width = parseInt(displayBounds.width * 0.21);
                bounds.height = parseInt(displayBounds.width * 0.32);
                bounds.minWidth = 400;
                bounds.minHeight = 600;
                bounds = getNearPosition(displayBounds, indexBounds, bounds);
            }
            break;

        case 'dictionary':
            {
                const indexBounds = windowList['index'].getBounds();
                bounds.width = parseInt(displayBounds.width * 0.27);
                bounds.height = parseInt(displayBounds.width * 0.32);
                bounds.minWidth = 500;
                bounds.minHeight = 600;
                bounds = getNearPosition(displayBounds, indexBounds, bounds);
            }
            break;

        case 'edit':
            {
                const indexBounds = windowList['index'].getBounds();
                bounds.width = parseInt(displayBounds.width * 0.42);
                bounds.height = parseInt(displayBounds.width * 0.32);
                bounds.minWidth = 800;
                bounds.minHeight = 600;
                bounds = getNearPosition(displayBounds, indexBounds, bounds);
            }
            break;

        case 'read-log':
            {
                const indexBounds = windowList['index'].getBounds();
                bounds.width = parseInt(displayBounds.width * 0.16);
                bounds.height = parseInt(displayBounds.width * 0.11);
                bounds.minWidth = 300;
                bounds.minHeight = 200;
                bounds = getNearPosition(displayBounds, indexBounds, bounds);
            }
            break;

        default:
            break;
    }

    return boundsPositionCheck(bounds);
}

// get near position
function getNearPosition(displayBounds, indexBounds, bounds) {
    bounds = boundsSizeCheck(bounds);
    bounds.x = indexBounds.x - bounds.width > displayBounds.x ? indexBounds.x - bounds.width : indexBounds.x + indexBounds.width;
    bounds.y = indexBounds.y + bounds.height > displayBounds.y + displayBounds.height ? displayBounds.y + displayBounds.height - bounds.height : indexBounds.y;
    return bounds;
}

// bounds size check
function boundsSizeCheck(bounds) {
    if (bounds.width < bounds.minWidth) bounds.width = bounds.minWidth;
    if (bounds.height < bounds.minHeight) bounds.height = bounds.minHeight;
    return bounds;
}

// bounds valid check
function boundsValidCheck(bounds) {
    return bounds.x === null || bounds.y === null || bounds.width === null || bounds.height === null || bounds.width <= 0 || bounds.height <= 0;
}

// bounds position check
function boundsPositionCheck(bounds) {
    const point = { x: bounds.x + parseInt(bounds.width / 2), y: bounds.y + parseInt(bounds.height / 2) };
    const nearestBounds = screen.getDisplayNearestPoint(point).bounds;

    if (bounds.width > nearestBounds.width) {
        bounds.width = nearestBounds.width;
    }

    if (bounds.height > nearestBounds.height) {
        bounds.height = nearestBounds.height;
    }

    if (bounds.x < nearestBounds.x) {
        bounds.x = nearestBounds.x;
    } else if (bounds.x > nearestBounds.x + nearestBounds.width - bounds.width) {
        bounds.x = nearestBounds.x + nearestBounds.width - bounds.width;
    }

    if (bounds.y < nearestBounds.y) {
        bounds.y = nearestBounds.y;
    } else if (bounds.y > nearestBounds.y + nearestBounds.height - bounds.height) {
        bounds.y = nearestBounds.y + nearestBounds.height - bounds.height;
    }

    return bounds;
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
