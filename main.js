'use strict';

// replaceAll
String.prototype.replaceAll = function(search, replacement) {
    if (search === '') {
        return this;
    } else {
        return this.split(search).join(replacement);
    }
}

// fs
const { existsSync, mkdirSync } = require('fs');

// path
const path = require('path');

// electron modules
const { app, ipcMain, screen, BrowserWindow } = require('electron');

// config module
const { loadConfig, saveConfig, saveDefaultConfig } = require('./module/config-module');

// chat code module
const { loadChatCode, saveChatCode, saveDefaultChatCode } = require('./module/chat-code-module');

// window list
let windowList = {
    preload: null,
    config: null,
    capture: null,
    capture_edit: null,
    edit: null,
    read_log: null
}

app.whenReady().then(() => {
    // check diretory
    try {
        if (!existsSync('./json')) {
            mkdirSync('./json');
        }

        if (!existsSync('./json/log')) {
            mkdirSync('./json/log');
        }

        if (!existsSync('./json/setting')) {
            mkdirSync('./json/setting');
        }

        if (!existsSync('./json/text')) {
            mkdirSync('./json/text');
        }

        if (!existsSync('./json/text_temp')) {
            mkdirSync('./json/text_temp');
        }
    } catch (error) {
        console.log(error);
    }

    // create preload window
    createWindow('preload');

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow('preload');
    });
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit();
});

// ipc
// get app version
ipcMain.on('get-version', (event) => {
    event.returnValue = app.getVersion();
});

// load config
ipcMain.on('load-config', (event) => {
    event.returnValue = loadConfig();
});

// save config
ipcMain.on('save-config', (event, config) => {
    saveConfig(config);
});

// save default config
ipcMain.on('save-default-config', (event) => {
    saveDefaultConfig();
});

// load chat code
ipcMain.on('load-chat-code', (event) => {
    event.returnValue = loadChatCode();
});

// save chat code
ipcMain.on('save-chat-code', (event, chatCode) => {
    saveChatCode(chatCode);
});

// save default chat code
ipcMain.on('save-default-chat-code', (event) => {
    saveDefaultChatCode();
});

// open devtools
ipcMain.on('open-devtools', (event) => {
    let window = BrowserWindow.fromWebContents(event.sender);

    if (window.webContents.isDevToolsOpened()) {
        window.webContents.closeDevTools();
    } else {
        window.webContents.openDevTools({ mode: 'detach' });
    }
});

// open preload devtools
ipcMain.on('open-preload-devtools', (event) => {
    let window = windowList['preload'];

    if (window.webContents.isDevToolsOpened()) {
        window.webContents.closeDevTools();
    } else {
        window.webContents.openDevTools({ mode: 'detach' });
    }
});

// always on top
ipcMain.on('set-always-on-top', (event, top) => {
    try {
        windowList['preload'].setAlwaysOnTop(top, 'screen-saver');
    } catch (error) {

    }
});

// send preload
ipcMain.on('send-preload', (event, channel, ...args) => {
    sendPreload(channel, ...args);
});

// click through
ipcMain.on('set-click-through', (event, ...args) => {
    BrowserWindow.fromWebContents(event.sender).setIgnoreMouseEvents(...args);
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

// close app
ipcMain.on('close-app', (event) => {
    app.quit();
});

// create sindow
ipcMain.on('create-window', (event, type, data = null) => {
    try {
        // force close
        windowList[type].close();

        // restart
        throw null;

        /*
        if (type === 'capture_edit') {
            throw null;
        }
        */
    } catch (error) {
        // create window
        createWindow(type, data);
    }
});

// start screen translation
ipcMain.on('start-screen-translation', (event, rectangleSize) => {
    console.log(rectangleSize);

    // get display matching the rectangle
    let display = screen.getDisplayMatching(rectangleSize);

    // get display's index
    let displayIndex = 0;
    let displays = screen.getAllDisplays();

    for (let index = 0; index < displays.length; index++) {
        if (displays[index].id === display.id) {
            displayIndex = index;
            break;
        }
    }

    // fix x
    if (rectangleSize.x < 0 || rectangleSize.x >= display.bounds.width) {
        rectangleSize.x = rectangleSize.x - display.bounds.x;
    }

    // image processing
    sendPreload('start-screen-translation', rectangleSize, display.bounds, displayIndex);
});

// save capture config
ipcMain.on('save-capture-config', (event, split, edit) => {
    let config = loadConfig();
    config.captureWindow.split = split;
    config.captureWindow.edit = edit;
    saveConfig(config);
})

// functions
function sendPreload(channel, ...args) {
    try {
        windowList['preload'].webContents.send(channel, ...args);
    } catch (error) {
        console.log(error);
    }
}

function getSize(type) {
    // load config
    let config = loadConfig();

    // set default value
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    // get current display bounds
    let displayBounds = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;

    // get current screen size
    let screenWidth = displayBounds.width;
    let screenHeight = displayBounds.height;

    switch (type) {
        case 'preload':
            // first time
            if (config.preloadWindow.width < 0 || config.preloadWindow.height < 0) {
                config.preloadWindow.width = parseInt(screenWidth * 0.2);
                config.preloadWindow.height = parseInt(screenHeight * 0.6);
                config.preloadWindow.x = displayBounds.x + parseInt(screenWidth * 0.7);
                config.preloadWindow.y = parseInt(screenHeight * 0.2);

                saveConfig(config);
            }

            x = config.preloadWindow.x;
            y = config.preloadWindow.y;
            width = config.preloadWindow.width;
            height = config.preloadWindow.height;
            break;

        case 'config':
            x = displayBounds.x + parseInt(screenWidth * 0.35);
            y = parseInt(screenHeight * 0.2);
            width = parseInt(screenWidth * 0.22);
            height = parseInt(screenHeight * 0.65);
            break;

        case 'capture':
            // first time
            if (config.captureWindow.width < 0 || config.captureWindow.height < 0) {
                config.captureWindow.x = displayBounds.x + parseInt(screenWidth * 0.33);
                config.captureWindow.y = parseInt(screenHeight * 0.63);
                config.captureWindow.width = parseInt(screenWidth * 0.33);
                config.captureWindow.height = parseInt(screenHeight * 0.36);

                saveConfig(config);
            }

            x = config.captureWindow.x;
            y = config.captureWindow.y;
            width = config.captureWindow.width;
            height = config.captureWindow.height;
            break;

        case 'capture_edit':
            x = displayBounds.x + parseInt(screenWidth * 0.35);
            y = parseInt(screenHeight * 0.325);
            width = parseInt(screenWidth * 0.27);
            height = parseInt(screenHeight * 0.35);
            break;

        case 'edit':
            x = displayBounds.x + parseInt(screenWidth * 0.3);
            y = parseInt(screenHeight * 0.1);
            width = parseInt(screenWidth * 0.3);
            height = parseInt(screenHeight * 0.8);
            break;

        case 'read_log':
            x = displayBounds.x + parseInt(screenWidth * 0.5);
            y = parseInt(screenHeight * 0.33);
            width = parseInt(screenWidth * 0.2);
            height = parseInt(screenHeight * 0.2);
            break;

        default:
            break;
    }

    return {
        x: x >= displayBounds.x && x < displayBounds.x + displayBounds.width ? x : displayBounds.x,
        y: y >= 0 && y < displayBounds.y + displayBounds.height ? y : displayBounds.y,
        width: width,
        height: height
    };
}

// create window
function createWindow(type, data) {
    try {
        // get size
        let size = getSize(type);

        // create new window
        const window = new BrowserWindow({
            show: false,
            x: size.x,
            y: size.y,
            width: size.width,
            height: size.height,
            transparent: true,
            frame: false,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, type + '.js')
            }
        });

        // load html
        window.loadFile(type + '.html');

        // set always on top
        const isTop = (type === 'preload' || type === 'capture' || type === 'capture_edit');
        window.setAlwaysOnTop(isTop, 'screen-saver');

        // set minimizable
        window.setMinimizable(false);

        switch (type) {
            case 'preload':
                //window.webContents.openDevTools({ mode: 'undocked' });
                window.once('close', () => {
                    let config = loadConfig();

                    // save position
                    config.preloadWindow.x = window.getPosition()[0];
                    config.preloadWindow.y = window.getPosition()[1];
                    config.preloadWindow.width = window.getSize()[0];
                    config.preloadWindow.height = window.getSize()[1];

                    saveConfig(config);
                });
                break;

            case 'capture':
                window.once('close', () => {
                    let config = loadConfig();

                    // save position
                    config.captureWindow.x = window.getPosition()[0];
                    config.captureWindow.y = window.getPosition()[1];
                    config.captureWindow.width = window.getSize()[0];
                    config.captureWindow.height = window.getSize()[1];

                    saveConfig(config);
                });
                break;

            case 'capture_edit':
                window.webContents.on('did-finish-load', () => {
                    window.webContents.send('send-data', data);
                });
                break;

            case 'edit':
                window.webContents.on('did-finish-load', () => {
                    window.webContents.send('send-data', data);
                });
                break;

            default:
                break;
        }

        window.webContents.on('did-finish-load', () => {
            window.show();
        });

        windowList[type] = window;
    } catch (error) {
        console.log(error);
    }
}