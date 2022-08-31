'use strict';

// path
const { resolve } = require('path');

// electron module
const { screen, BrowserWindow } = require('electron');

let windowList = {
    index: null,
    edit: null,
    config: null,
    capture: null,
    'captrue-edit': null,
    'read-log': null,
    dictionary: null,
};

// create window
function createWindow(windowName, data = null) {
    try {
        // get size
        const windowSize = getWindowSize(windowName);

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
                sandbox: false,
                preload: resolve(process.cwd(), 'src', `${windowName}.js`),
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

        // save config on closing
        switch (windowName) {
            case 'index':
                // set foucusable
                window.setFocusable(config.indexWindow.focusable);
                window.on('restore', () => {
                    window.setFocusable(config.indexWindow.focusable);
                });
                window.on('minimize', () => {
                    window.setFocusable(true);
                });

                // save position on close
                window.once('close', () => {
                    config.indexWindow.x = window.getPosition()[0];
                    config.indexWindow.y = window.getPosition()[1];

                    // save size
                    config.indexWindow.width = window.getSize()[0];
                    config.indexWindow.height = window.getSize()[1];

                    // save config
                    saveConfig(config);

                    // save chat code
                    saveChatCode(chatCode);
                });
                break;

            case 'capture':
                window.once('close', () => {
                    // save position
                    config.captureWindow.x = window.getPosition()[0];
                    config.captureWindow.y = window.getPosition()[1];

                    // save size
                    config.captureWindow.width = window.getSize()[0];
                    config.captureWindow.height = window.getSize()[1];
                });
                break;

            default:
                break;
        }

        // load html
        window.loadFile(resolve(process.cwd(), 'src', `${windowName}.html`));

        // save window
        windowList[windowName] = window;
    } catch (error) {
        console.log(error);
    }
}

function getWindowSize(windowName) {
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
            if (config.indexWindow.width < 0 || config.indexWindow.height < 0) {
                config.indexWindow.width = parseInt(screenWidth * 0.2);
                config.indexWindow.height = parseInt(screenHeight * 0.6);
                config.indexWindow.x = displayBounds.x + parseInt(screenWidth * 0.7);
                config.indexWindow.y = parseInt(screenHeight * 0.2);
            }

            x = config.indexWindow.x;
            y = config.indexWindow.y;
            width = config.indexWindow.width;
            height = config.indexWindow.height;
            break;
        }

        case 'capture': {
            // first time
            if (config.captureWindow.width < 0 || config.captureWindow.height < 0) {
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
            height = parseInt(screenHeight * 0.35);
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

module.exports = {
    createWindow,
};
