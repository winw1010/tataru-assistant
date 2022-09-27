'use strict';

// fs
const { existsSync, mkdirSync } = require('fs');

// file module
const fm = require('./src/main_modules/file-module');

// electron modules
const { app, ipcMain, screen, globalShortcut, BrowserWindow } = require('electron');

// child process
const { exec } = require('child_process');

// download github repo
const downloadGitRepo = require('download-git-repo');

// config module
const { loadConfig, saveConfig, getDefaultConfig } = require('./src/main_modules/config-module');

// chat code module
const { loadChatCode, saveChatCode, getDefaultChatCode } = require('./src/main_modules/chat-code-module');

// request
const { makeRequest } = require('./src/main_modules/translator/request-module');
const { getTranslation } = require('./src/main_modules/translate-module');

// window module
const windowModule = require('./src/main_modules/window-module');

// correction-module
const { correctionEntry } = require('./src/main_modules/correction-module');
const { loadJSON_EN } = require('./src/main_modules/correction-module-en');
const { loadJSON_JP } = require('./src/main_modules/correction-module-jp');

// app version
const appVersion = app.getVersion();

// config
let config = null;
let chatCode = null;

// when ready
app.whenReady().then(() => {
    // disable http cache
    app.commandLine.appendSwitch('disable-http-cache');

    // directory check
    directoryCheck();

    // load config
    config = loadConfig();

    // load chat code
    chatCode = loadChatCode();

    // detect user language
    detectUserLanguage();

    // set ipc main
    setIpcMain();

    // set shortcut
    setGlobalShortcut();

    // create index window
    createWindow('index');
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow('index');
    });
});

// on window all closed
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// set ipc main
function setIpcMain() {
    setSystemChannel();
    setWindowChannel();
    setCaptureChannel();
    setTranslationChannel();
    setRequestChannel();
}

// set system channel
function setSystemChannel() {
    // get app version
    ipcMain.on('get-version', (event) => {
        event.returnValue = appVersion;
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
        event.returnValue = config;
    });

    // set default config
    ipcMain.on('set-default-config', (event) => {
        config = getDefaultConfig();
        event.returnValue = config;
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
        event.returnValue = chatCode;
    });

    // set default chat code
    ipcMain.on('set-default-chat-code', (event) => {
        chatCode = getDefaultChatCode();
        event.returnValue = chatCode;
    });
}

// set window channel
function setWindowChannel() {
    // create window
    ipcMain.on('create-window', (event, windowName, data = null) => {
        try {
            windowModule.closeWindow(windowName);
        } catch (error) {
            createWindow(windowName, data);
        }
    });

    // restart window
    ipcMain.on('restart-window', (event, windowName, data = null) => {
        try {
            windowModule.closeWindow(windowName);
            throw null;
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
    ipcMain.on('set-always-on-top', (event, isAlwaysOnTop) => {
        try {
            const indexWindow = BrowserWindow.fromWebContents(event.sender);
            indexWindow.setAlwaysOnTop(isAlwaysOnTop, 'screen-saver');
        } catch (error) {
            console.log(error);
        }
    });

    // set focusable
    ipcMain.on('set-focusable', (event, isFocusable) => {
        try {
            const indexWindow = BrowserWindow.fromWebContents(event.sender);
            indexWindow.setFocusable(isFocusable);
            indexWindow.setAlwaysOnTop(true, 'screen-saver');
        } catch (error) {
            console.log(error);
        }
    });

    // set click through
    ipcMain.on('set-click-through', (event, ignore) => {
        try {
            const indexWindow = BrowserWindow.fromWebContents(event.sender);
            indexWindow.setIgnoreMouseEvents(ignore, { forward: true });
            indexWindow.setResizable(!ignore);
        } catch (error) {
            console.log(error);
        }
    });

    // mouse out check
    ipcMain.on('mouse-out-check', (event) => {
        const cursorScreenPoint = screen.getCursorScreenPoint();
        const windowBounds = BrowserWindow.fromWebContents(event.sender).getBounds();
        const isMouseOut =
            cursorScreenPoint.x < windowBounds.x ||
            cursorScreenPoint.x > windowBounds.x + windowBounds.width ||
            cursorScreenPoint.y < windowBounds.y ||
            cursorScreenPoint.y > windowBounds.y + windowBounds.height;

        BrowserWindow.fromWebContents(event.sender).webContents.send(
            'hide-button',
            isMouseOut,
            config.indexWindow.hideButton
        );
    });

    // mute window
    ipcMain.on('mute-window', (event, autoPlay) => {
        BrowserWindow.fromWebContents(event.sender).webContents.setAudioMuted(!autoPlay);
    });

    // send index
    ipcMain.on('send-index', (event, channel, ...args) => {
        windowModule.sendIndex(channel, ...args);
    });

    // change UI text
    ipcMain.on('change-ui-text', () => {
        windowModule.forEachWindow((myWindow) => {
            myWindow.webContents.send('change-ui-text');
        });
    });

    // execute command
    ipcMain.on('execute-command', (event, command) => {
        exec(command);
    });
}

// set capture channel
function setCaptureChannel() {
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
        windowModule.sendIndex('start-screen-translation', rectangleSize, display.bounds, displayIndex);
    });

    // get position
    ipcMain.on('get-screen-position', (event) => {
        event.returnValue = screen.getCursorScreenPoint();
    });

    // get dispaly bounds
    ipcMain.on('get-dispaly-bounds', (event) => {
        event.returnValue = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;
    });

    // minimize all windows
    ipcMain.on('minimize-all-windows', () => {
        windowModule.forEachWindow((myWindow) => {
            myWindow.minimize();
        });
    });

    // restore all windows
    ipcMain.on('restore-all-windows', () => {
        windowModule.forEachWindow((myWindow) => {
            myWindow.restore();
        });
    });
}

// set translation channel
function setTranslationChannel() {
    // initialize json
    ipcMain.on('initialize-json', () => {
        initializeJSON();
    });

    // download json
    ipcMain.on('download-json', () => {
        downloadJSON();
    });

    // load json
    ipcMain.on('load-json', () => {
        loadJSON();
    });

    // start translation
    ipcMain.on('start-translation', (event, ...args) => {
        correctionEntry(...args);
    });
}

// set request channel
function setRequestChannel() {
    // request latest verssion
    ipcMain.on('version-check', () => {
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
                path: '/winw1010/tataru-helper-node-text-v2/main/version.json',
            },
            callback: callback,
        })
            .then((latestVersion) => {
                if (appVersion === latestVersion) {
                    windowModule.sendIndex('hide-update-button', true);
                    windowModule.sendIndex('show-notification', '已安裝最新版本');
                } else {
                    let latest = '';
                    if (latestVersion?.length > 0) {
                        latest += `(Ver.${latestVersion})`;
                    }

                    windowModule.sendIndex('hide-update-button', false);
                    windowModule.sendIndex(
                        'show-notification',
                        `已有可用的更新${latest}，請點選上方的<img src="./img/ui/update_white_24dp.svg" style="width: 1.5rem; height: 1.5rem;">按鈕下載最新版本`
                    );
                }
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
}

// directory check
function directoryCheck() {
    const documentPath = fm.getUserPath('Documents');
    const subPath = [
        '',
        'Tataru Helper Node',
        'Tataru Helper Node\\log',
        'Tataru Helper Node\\setting',
        'Tataru Helper Node\\temp',
    ];

    subPath.forEach((value) => {
        try {
            const dir = fm.getPath(documentPath, value);
            if (!existsSync(dir)) {
                mkdirSync(dir);
            }
        } catch (error) {
            console.log(error);
        }
    });
}

// detect user language
function detectUserLanguage() {
    if (config.system.firstTime) {
        const env = process.env;
        const envLanguage = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES || 'zh_TW';

        if (/zh_TW|zh_HK|zh_MO|zh_CHT|zh_Hant/i.test(envLanguage)) {
            config.translation.to = 'Traditional-Chinese';
        } else if (/zh_CN|zh_SG|zh_CHS|zh_Hans/i.test(envLanguage)) {
            config.translation.to = 'Simplified-Chinese';
        } else {
            config.translation.to = 'Traditional-Chinese';
        }
    }
}

// set global shortcut
function setGlobalShortcut() {
    globalShortcut.register('CommandOrControl+F9', () => {
        exec(`explorer "${fm.getRootPath('src', 'json', 'text', 'readme', 'index.html')}"`);
    });

    globalShortcut.register('CommandOrControl+F10', () => {
        try {
            windowModule.closeWindow('config');
        } catch (error) {
            createWindow('config');
        }
    });

    globalShortcut.register('CommandOrControl+F11', () => {
        try {
            windowModule.closeWindow('capture');
        } catch (error) {
            createWindow('capture');
        }
    });

    globalShortcut.register('CommandOrControl+F12', () => {
        windowModule.openDevTools();
    });
}

// initialize json
function initializeJSON() {
    if (config.system.autoDownloadJson) {
        downloadJSON();
    } else {
        loadJSON();
    }
}

// download json
function downloadJSON() {
    try {
        // delete text
        exec('rmdir /Q /S src\\json\\text', () => {
            // clone json
            downloadGitRepo('winw1010/tataru-helper-node-text-v2#main', 'src/json/text', (error) => {
                if (error) {
                    console.log(error);
                    windowModule.sendIndex('show-notification', '對照表下載失敗：' + error);
                } else {
                    windowModule.sendIndex('show-notification', '對照表下載完畢');
                    loadJSON();
                }
            });
        });
    } catch (error) {
        console.log(error);
    }
}

// load json
function loadJSON() {
    let languageTo = config.translation.to;
    loadJSON_EN(languageTo);
    loadJSON_JP(languageTo);

    windowModule.sendIndex('show-notification', '對照表讀取完畢');
}

// create window
function createWindow(windowName, data = null) {
    try {
        // get size
        const windowSize = windowModule.getWindowSize(windowName, config);

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
                preload: fm.getPath(__dirname, 'src', `${windowName}.js`),
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
        window.loadFile(fm.getPath(__dirname, 'src', `${windowName}.html`));

        // save window
        windowModule.setWindow(windowName, window);
    } catch (error) {
        console.log(error);
    }
}
