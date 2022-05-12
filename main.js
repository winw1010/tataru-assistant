'use strict';

// fs
const { existsSync, mkdirSync } = require('fs');

// path
const path = require('path');

// electron modules
const { app, ipcMain, screen, BrowserWindow } = require('electron');

// config module
const { loadConfig, saveConfig, getDefaultConfig } = require('./module/config-module');

// chat code module
const { loadChatCode, saveChatCode, getDefaultChatCode } = require('./module/chat-code-module');

// config
let config = null;
let chatCode = null;

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
    // check directory
    checkDirectory();

    // load config
    config = loadConfig();

    // load chat code
    chatCode = loadChatCode();

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

// send preload
ipcMain.on('send-preload', (event, channel, ...args) => {
    sendPreload(channel, ...args);
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

// open devtools
ipcMain.on('open-devtools', (event) => {
    let window = BrowserWindow.fromWebContents(event.sender);

    try {
        window.webContents.closeDevTools();
    } catch (error) {
        console.log(error);
    } finally {
        window.webContents.openDevTools({ mode: 'detach' });
    }
});

// open preload devtools
ipcMain.on('open-preload-devtools', () => {
    let window = windowList['preload'];

    try {
        window.webContents.closeDevTools();
    } catch (error) {
        console.log(error);
    } finally {
        window.webContents.openDevTools({ mode: 'detach' });
    }
});

// always on top
ipcMain.on('set-always-on-top', (event, top) => {
    try {
        windowList['preload'].setAlwaysOnTop(top, 'screen-saver');
    } catch (error) {
        console.log(error);
    }
});

// mouse check
ipcMain.on('mouse-out-check', (event, windowX, windowY, windowWidth, windowHeight) => {
    const cursorScreenPoint = screen.getCursorScreenPoint();

    event.returnValue = (cursorScreenPoint.x < windowX ||
        cursorScreenPoint.x > windowX + windowWidth ||
        cursorScreenPoint.y < windowY ||
        cursorScreenPoint.y > windowY + windowHeight
    );
});

// click through
ipcMain.on('set-click-through', (event, ignore) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window.setIgnoreMouseEvents(ignore, { forward: true });
    window.setResizable(!ignore);
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

// drag window
ipcMain.on('drag-window', (event, clientX, clientY, windowWidth, windowHeight) => {
    try {
        const cursorScreenPoint = screen.getCursorScreenPoint();
        BrowserWindow.fromWebContents(event.sender).setBounds({
            x: cursorScreenPoint.x - clientX,
            y: cursorScreenPoint.y - clientY,
            width: windowWidth,
            height: windowHeight
        });
    } catch (error) {
        console.log(error);
    }
});

// mute window
ipcMain.on('mute-window', (event, isMuted) => {
    BrowserWindow.fromWebContents(event.sender).webContents.setAudioMuted(isMuted);
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
ipcMain.on('close-app', () => {
    app.quit();
});

// start screen translation
ipcMain.on('start-screen-translation', (event, rectangleSize) => {
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

// functions
function sendPreload(channel, ...args) {
    try {
        windowList['preload'].webContents.send(channel, ...args);
    } catch (error) {
        console.log(error);
    }
}

function checkDirectory() {
    const directories = ['./json', './json/log', './json/setting', './json/text', './json/text_temp'];

    directories.forEach((value) => {
        try {
            if (!existsSync(value)) {
                mkdirSync(value);
            }
        } catch (error) {
            console.log(error);
        }
    });
}

function getWindowSize(type) {
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
            x = displayBounds.x + parseInt(screenWidth * 0.2);
            y = parseInt(screenHeight * 0.2);
            width = parseInt(screenWidth * 0.5);
            height = parseInt(screenHeight * 0.6);
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
        const size = getWindowSize(type);

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
                window.once('close', () => {
                    // save position
                    config.preloadWindow.x = window.getPosition()[0];
                    config.preloadWindow.y = window.getPosition()[1];

                    // save size
                    config.preloadWindow.width = window.getSize()[0];
                    config.preloadWindow.height = window.getSize()[1];

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