'use strict';

// fs
const { existsSync, mkdirSync } = require('fs');

// path
const path = require('path');

// electron modules
const { app, ipcMain, screen, globalShortcut, BrowserWindow } = require('electron');

// config module
const { loadConfig, saveConfig, getDefaultConfig } = require('./main_modules/config-module');

// chat code module
const { loadChatCode, saveChatCode, getDefaultChatCode } = require('./main_modules/chat-code-module');

// request
const { makeRequest } = require('./main_modules/translator/request-module');
const { getTranslation } = require('./main_modules/translate-module');

// main window module
const { setIndex, sendIndex } = require('./main_modules/main-window-module');

// correction-module
const { correctionEntry } = require('./main_modules/correction-module');
const { loadJSON_EN } = require('./main_modules/correction-module-en');
const { loadJSON_JP } = require('./main_modules/correction-module-jp');

// disable http cache
app.commandLine.appendSwitch('disable-http-cache');

// config
let config = null;
let chatCode = null;

// window list
let windowList = {
    index: null,
    config: null,
    capture: null,
    'capture-edit': null,
    edit: null,
    'read-log': null,
    dictionary: null,
};

app.whenReady().then(() => {
    // check directory
    checkDirectory();

    // load config
    config = loadConfig();

    // load chat code
    chatCode = loadChatCode();

    // set key down
    setGlobalShortcut();

    // create index window
    createWindow('index');
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow('index');
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// ipc - main
// get app version
ipcMain.on('get-version', (event) => {
    event.returnValue = app.getVersion();
});

// close app
ipcMain.on('close-app', () => {
    app.quit();
});

// get config
ipcMain.on('get-config', (event) => {
    if (!config) {
        config = loadConfig();
    }

    event.returnValue = config;
});

// set config
ipcMain.on('set-config', (event, newConfig) => {
    config = newConfig;
});

// set default config
ipcMain.on('set-default-config', () => {
    config = getDefaultConfig();
});

// get chat code
ipcMain.on('get-chat-code', (event) => {
    if (!chatCode) {
        chatCode = loadChatCode();
    }

    event.returnValue = chatCode;
});

// set chat code
ipcMain.on('set-chat-code', (event, newChatCode) => {
    chatCode = newChatCode;
});

// set default chat code
ipcMain.on('set-default-chat-code', () => {
    chatCode = getDefaultChatCode();
});

// ipc - window
// create sindow
ipcMain.on('create-window', (event, windowName, data = null) => {
    try {
        windowList[windowName].close();
        windowList[windowName] = null;

        if (windowName === 'edit' || windowName === 'capture-edit') {
            throw null;
        }
    } catch (error) {
        createWindow(windowName, data);
    }
});

// drag window
ipcMain.on('drag-window', (event, clientX, clientY, windowWidth, windowHeight) => {
    try {
        const cursorScreenPoint = screen.getCursorScreenPoint();
        BrowserWindow.fromWebContents(event.sender).setBounds({
            x: cursorScreenPoint.x - clientX,
            y: cursorScreenPoint.y - clientY,
            width: windowWidth,
            height: windowHeight,
        });
    } catch (error) {
        console.log(error);
    }
});

// minimize window
ipcMain.on('minimize-window', (event) => {
    try {
        BrowserWindow.fromWebContents(event.sender).minimize();
    } catch (error) {
        console.log(error);
    }
});

// close window
ipcMain.on('close-window', (event) => {
    try {
        BrowserWindow.fromWebContents(event.sender).close();
    } catch (error) {
        console.log(error);
    }
});

// always on top
ipcMain.on('set-always-on-top', (event, top) => {
    const window = windowList['index'];

    if (window) {
        try {
            window.setAlwaysOnTop(top, 'screen-saver');
        } catch (error) {
            console.log(error);
        }
    }
});

// set click through
ipcMain.on('set-click-through', (event, ignore) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.setIgnoreMouseEvents(ignore, { forward: true });
    window.setResizable(!ignore);
});

// mouse check
ipcMain.on('mouse-out-check', (event, windowX, windowY, windowWidth, windowHeight) => {
    const cursorScreenPoint = screen.getCursorScreenPoint();

    event.returnValue =
        cursorScreenPoint.x < windowX ||
        cursorScreenPoint.x > windowX + windowWidth ||
        cursorScreenPoint.y < windowY ||
        cursorScreenPoint.y > windowY + windowHeight;
});

// mute window
ipcMain.on('mute-window', (event, autoPlay) => {
    BrowserWindow.fromWebContents(event.sender).webContents.setAudioMuted(!autoPlay);
});

// ipc - index
// send index
ipcMain.on('send-index', (event, channel, ...args) => {
    sendIndex(channel, ...args);
});

// ipc - capture
// start screen translation
ipcMain.on('start-screen-translation', (event, rectangleSize) => {
    // get display matching the rectangle
    const display = screen.getDisplayMatching(rectangleSize);

    // find display's index
    const displayIDs = screen.getAllDisplays().map((x) => x.id);
    const displayIndex = displayIDs.indexOf(display.id);

    // fix x
    rectangleSize.x = rectangleSize.x - display.bounds.x;

    // fix y
    rectangleSize.y = rectangleSize.y - display.bounds.y;

    // image processing
    sendIndex('start-screen-translation', rectangleSize, display.bounds, displayIndex);
});

// get position
ipcMain.on('get-screen-position', (event) => {
    event.returnValue = screen.getCursorScreenPoint();
});

// translation
// load json
ipcMain.on('load-json', (event, languageTo) => {
    loadJSON_EN(languageTo);
    loadJSON_JP(languageTo);

    sendIndex('show-notification', '對照表讀取完畢');
});

// start translation
ipcMain.on('start-translation', (event, ...args) => {
    correctionEntry(...args);
});

// ipc - request
// request latest verssion
ipcMain.on('request-latest-version', (event) => {
    const callback = function (response, chunk) {
        if (response.statusCode === 200) {
            return JSON.parse(chunk.toString()).number;
        }
    };

    makeRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'raw.githubusercontent.com',
            path: '/winw1010/tataru-helper-node-text-ver.2.0.0/main/version.json',
        },
        callback: callback,
    })
        .then((latestVersion) => {
            event.sender.send('version-check-response', app.getVersion(), latestVersion);
        })
        .catch((error) => {
            console.log(error);
        });
});

// get translation
ipcMain.on('get-translation', (event, engine, option) => {
    getTranslation(engine, option).then((translatedText) => {
        event.returnValue = translatedText;
    });
});

// get translation dictionary
ipcMain.on('get-translation-dictionary', (event, engine, option) => {
    getTranslation(engine, option).then((translatedText) => {
        event.sender.send('send-data', translatedText);
    });
});

// post form
ipcMain.on('post-form', (event, path) => {
    const callback = function (response) {
        if (response.statusCode === 200) {
            return 'OK';
        }
    };

    makeRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'docs.google.com',
            path: path,
        },
        callback: callback,
    });
});

/*
// functions
function sendIndex(channel, ...args) {
    const window = windowList['index'];

    if (window) {
        try {
            window.webContents.send(channel, ...args);
        } catch (error) {
            console.log(error);
        }
    }
}
*/

function checkDirectory() {
    const userDirectory = process.env.USERPROFILE + '\\Documents';
    const subDirectories = [
        '',
        '\\Tataru Helper Node',
        '\\Tataru Helper Node\\log',
        '\\Tataru Helper Node\\setting',
        '\\Tataru Helper Node\\temp',
    ];

    subDirectories.forEach((value) => {
        try {
            const dir = userDirectory + value;
            if (!existsSync(dir)) {
                mkdirSync(dir);
            }
        } catch (error) {
            console.log(error);
        }
    });
}

function setGlobalShortcut() {
    globalShortcut.register('CommandOrControl+F9', () => {
        try {
            windowList['read-log'].close();
            windowList['read-log'] = null;
        } catch (error) {
            createWindow('read-log');
        }
    });

    globalShortcut.register('CommandOrControl+F10', () => {
        try {
            windowList['config'].close();
            windowList['config'] = null;
        } catch (error) {
            createWindow('config');
        }
    });

    globalShortcut.register('CommandOrControl+F11', () => {
        try {
            windowList['capture'].close();
            windowList['capture'] = null;
        } catch (error) {
            createWindow('capture');
        }
    });

    globalShortcut.register('CommandOrControl+F12', () => {
        const window = windowList['index'];

        if (window) {
            if (window.webContents.isDevToolsOpened()) {
                window.webContents.closeDevTools();
            } else {
                window.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });
}

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
                preload: path.join(__dirname, `${windowName}.js`),
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
                // set index
                setIndex(window);

                // set foucusable
                window.setFocusable(false);
                window.on('restore', () => {
                    window.setFocusable(false);
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
        window.loadFile(`${windowName}.html`);

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
