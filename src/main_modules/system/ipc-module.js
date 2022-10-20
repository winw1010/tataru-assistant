'use strict';

// child process
const { exec } = require('child_process');

// electron
const { app, ipcMain, screen, BrowserWindow } = require('electron');

// config module
const configModule = require('./config-module');

// chat code module
const chatCodeModule = require('./chat-code-module');

// engine module
const { getLanguageCode } = require('./engine-module');

// request module
const { makeRequest } = require('./request-module');

// server module
const serverModule = require('./server-module');

// translate module
const { getTranslation, zhConvert } = require('./translate-module');

// window module
const windowModule = require('./window-module');

// correction-module
const { correctionEntry } = require('../correction/correction-module');

// json module
const jsonModule = require('../correction/json-module');

// google tts
const googleTTS = require('../translator/google-tts');

// app version
const appVersion = app.getVersion();

// set ipc
function setIPC() {
    setSystemChannel();
    setWindowChannel();
    setCaptureChannel();
    setJsonChannel();
    setRequestChannel();
    setTranslateChannel();
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
        event.returnValue = configModule.getConfig();
    });

    // set config
    ipcMain.on('set-config', (event, newConfig) => {
        configModule.setConfig(newConfig);
        event.returnValue = configModule.getConfig();
    });

    // set default config
    ipcMain.on('set-default-config', (event) => {
        configModule.setDefaultConfig();
        event.returnValue = configModule.getConfig();
    });

    // get chat code
    ipcMain.on('get-chat-code', (event) => {
        event.returnValue = chatCodeModule.getChatCode();
    });

    // set chat code
    ipcMain.on('set-chat-code', (event, newChatCode) => {
        chatCodeModule.setChatCode(newChatCode);
        event.returnValue = chatCodeModule.getChatCode();
    });

    // set default chat code
    ipcMain.on('set-default-chat-code', (event) => {
        chatCodeModule.setDefaultChatCode();
        event.returnValue = chatCodeModule.getChatCode();
    });

    // start server
    ipcMain.on('start-server', () => {
        serverModule.startServer();
    });
}

// set window channel
function setWindowChannel() {
    // create window
    ipcMain.on('create-window', (event, windowName, data = null) => {
        try {
            windowModule.closeWindow(windowName);
        } catch (error) {
            windowModule.createWindow(windowName, data);
        }
    });

    // restart window
    ipcMain.on('restart-window', (event, windowName, data = null) => {
        try {
            windowModule.closeWindow(windowName);
            throw null;
        } catch (error) {
            windowModule.createWindow(windowName, data);
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
            BrowserWindow.fromWebContents(event.sender).setAlwaysOnTop(isAlwaysOnTop, 'screen-saver');
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
        const config = configModule.getConfig();
        const cursorScreenPoint = screen.getCursorScreenPoint();
        const windowBounds = BrowserWindow.fromWebContents(event.sender).getBounds();
        const isMouseOut =
            cursorScreenPoint.x < windowBounds.x ||
            cursorScreenPoint.x > windowBounds.x + windowBounds.width ||
            cursorScreenPoint.y < windowBounds.y ||
            cursorScreenPoint.y > windowBounds.y + windowBounds.height;

        event.sender.send('hide-button', isMouseOut, config.indexWindow.hideButton);
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

// set json channel
function setJsonChannel() {
    // initialize json
    ipcMain.on('initialize-json', () => {
        jsonModule.initializeJSON();
    });

    // download json
    ipcMain.on('download-json', () => {
        jsonModule.downloadJSON();
    });

    // load json
    ipcMain.on('load-json', () => {
        jsonModule.loadJSON();
    });
}

// set translate channel
function setTranslateChannel() {
    // get language code
    ipcMain.on('get-language-code', (event, language, engine) => {
        event.returnValue = getLanguageCode(language, engine);
    });

    // start translation
    ipcMain.on('start-translation', (event, ...args) => {
        correctionEntry(...args);
    });

    // get translation
    ipcMain.on('get-translation', (event, engine, option) => {
        getTranslation(engine, option).then((translatedText) => {
            event.reply('send-data', translatedText);
        });
    });

    // zh convert
    ipcMain.on('zh-convert', (event, text, languageTo) => {
        event.returnValue = zhConvert(text, languageTo);
    });

    // google tts
    ipcMain.on('google-tts', (event, option) => {
        event.returnValue = googleTTS.getAudioUrl(option);
    });
}

// module exports
module.exports = { setIPC };