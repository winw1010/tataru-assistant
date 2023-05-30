'use strict';

// electron
const { dialog } = require('electron');

// child process
const { exec } = require('child_process');

// electron
const { app, ipcMain, screen, BrowserWindow } = require('electron');

// chat code module
const chatCodeModule = require('./chat-code-module');

// config module
const configModule = require('./config-module');

// dialog module
const dialogModule = require('./dialog-module');

// engine module
const engineModule = require('./engine-module');

// file module
const fileModule = require('./file-module');

// image module
const imageModule = require('./image-module');

// request module
const requestModule = require('./request-module');

// sharlayan module
const sharlayanModule = require('./sharlayan-module');

// text detect module
const textDetectModule = require('./text-detect-module');

// translate module
const { getTranslation, zhConvert } = require('./translate-module');

// window module
const windowModule = require('./window-module');

// correction-function
const { sameAsArrayItem } = require('../correction/correction-function');

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
    setDialogChannel();
    setCaptureChannel();
    setJsonChannel();
    setRequestChannel();
    setTranslateChannel();
    setFileChannel();
}

// set system channel
function setSystemChannel() {
    // get app version
    ipcMain.on('get-version', (event) => {
        event.returnValue = appVersion;
    });

    // close app
    ipcMain.on('close-app', () => {
        sharlayanModule.stop();
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

    // start sharlayan reader
    ipcMain.on('start-sharlayan-reader', () => {
        sharlayanModule.start();
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
        windowModule.restartWindow(windowName, data);
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

    // restore window
    ipcMain.on('restore-window', (event) => {
        try {
            BrowserWindow.fromWebContents(event.sender).restore();
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
            BrowserWindow.fromWebContents(event.sender).setFocusable(isFocusable);
        } catch (error) {
            console.log(error);
        }
    });

    // set min size
    ipcMain.on('set-min-size', (event, minSize) => {
        if (minSize) {
            BrowserWindow.fromWebContents(event.sender).setMinimumSize(300, 300);
        } else {
            BrowserWindow.fromWebContents(event.sender).setMinimumSize(1, 1);
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
    ipcMain.handle('mouse-out-check', (event) => {
        const config = configModule.getConfig();
        const cursorScreenPoint = screen.getCursorScreenPoint();
        const windowBounds = BrowserWindow.fromWebContents(event.sender).getBounds();
        const isMouseOut =
            cursorScreenPoint.x < windowBounds.x ||
            cursorScreenPoint.x > windowBounds.x + windowBounds.width ||
            cursorScreenPoint.y < windowBounds.y ||
            cursorScreenPoint.y > windowBounds.y + windowBounds.height;

        return { isMouseOut, hideButton: config.indexWindow.hideButton };
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

// set dialog channel
function setDialogChannel() {
    // add log
    ipcMain.on('add-log', (event, id, code, name, text) => {
        dialogModule.addDialog(id, code);
        dialogModule.updateDialog(id, name, text);
    });

    // show notification
    ipcMain.on('show-notification', (event, text) => {
        dialogModule.showNotification(text);
    });

    // get style
    ipcMain.on('get-style', (event, code) => {
        event.returnValue = dialogModule.getStyle(code);
    });

    // show dialog
    ipcMain.on('show-dialog', () => {
        dialogModule.showDialog();
    });

    // create log name
    ipcMain.on('create-log-name', (event, milliseconds) => {
        event.returnValue = dialogModule.createLogName(milliseconds);
    });
}

// set capture channel
function setCaptureChannel() {
    // start recognize
    ipcMain.on('start-recognize', (event, rectangleSize) => {
        // get display matching the rectangle
        const display = screen.getDisplayMatching(rectangleSize);

        // find display's index
        const displayIDs = screen.getAllDisplays().map((x) => x.id);
        const displayIndex = displayIDs.indexOf(display.id);

        // fix x
        rectangleSize.x = rectangleSize.x - display.bounds.x;

        // fix y
        rectangleSize.y = rectangleSize.y - display.bounds.y;

        // start recognize
        imageModule.startRecognize(rectangleSize, display.bounds, displayIndex);
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

    // translate image text
    ipcMain.on('translate-image-text', (event, text) => {
        textDetectModule.translateImageText(text);
    });

    // set google credential
    ipcMain.on('set-google-credential', () => {
        dialog
            .showOpenDialog({ filters: [{ name: 'JSON', extensions: ['json'] }] })
            .then((value) => {
                if (!value.canceled && value.filePaths.length > 0 && value.filePaths[0].length > 0) {
                    let data = fileModule.read(value.filePaths[0], 'json');

                    if (data) {
                        fileModule.write(fileModule.getUserDataPath('setting', 'google-credential.json'), data, 'json');
                        dialogModule.showNotification('已儲存Google憑證');
                    } else {
                        dialogModule.showNotification('檔案格式不正確');
                    }
                }
            })
            .catch(console.log);
    });
}

// set request channel
function setRequestChannel() {
    // version check
    ipcMain.on('version-check', () => {
        let notificationText = '';

        requestModule
            .get({
                protocol: 'https:',
                hostname: 'raw.githubusercontent.com',
                path: '/winw1010/tataru-helper-node-text-v2/main/version.json',
            })
            .then((data) => {
                // set request config
                let config = configModule.getConfig();
                config.system.scu = data.scu;
                config.system.userAgent = data.userAgent;
                configModule.setConfig(config);

                // compare app version
                const latestVersion = data?.number;
                if (appVersion === latestVersion) {
                    windowModule.sendIndex('hide-update-button', true);
                    notificationText = '已安裝最新版本';
                } else {
                    windowModule.sendIndex('hide-update-button', false);
                    notificationText = `已有可用的更新<br />請點選上方的<img src="./img/ui/update_white_24dp.svg" style="width: 1.5rem; height: 1.5rem;">按鈕下載最新版本<br />(目前版本: v${appVersion}，最新版本: v${latestVersion})`;
                }
            })
            .catch((error) => {
                console.log(error);
                windowModule.sendIndex('hide-update-button', false);
                notificationText = '版本檢查失敗: ' + error;
            })
            .finally(() => {
                dialogModule.showNotification(notificationText);
            });
    });

    // post form
    ipcMain.on('post-form', (event, path) => {
        requestModule.post({
            protocol: 'https:',
            hostname: 'docs.google.com',
            path: path,
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
    // same as array item
    ipcMain.on('same-as-array-item', (event, text, array, searchIndex) => {
        event.returnValue = sameAsArrayItem(text, array, searchIndex);
    });

    // get language enum
    ipcMain.on('get-language-enum', (event) => {
        event.returnValue = engineModule.languageEnum;
    });

    // get translate option
    ipcMain.on('get-translate-option', (event, engine, from, to, text) => {
        event.returnValue = engineModule.getTranslateOption(engine, from, to, text);
    });

    // get language code
    ipcMain.on('get-language-code', (event, language, engine) => {
        event.returnValue = engineModule.getLanguageCode(language, engine);
    });

    // start translation
    ipcMain.on('start-translation', (event, ...args) => {
        correctionEntry(...args);
    });

    // get translation
    ipcMain.handle('get-translation', (event, engine, option) => {
        return getTranslation(engine, option);
    });

    // zh convert
    ipcMain.handle('zh-convert', (event, text, languageTo) => {
        return zhConvert(text, languageTo);
    });

    // google tts
    ipcMain.on('google-tts', (event, text, from) => {
        event.returnValue = googleTTS.getAudioUrl(text, from);
    });

    // record
    ipcMain.on('change-reccord-icon', (event) => {
        let config = configModule.getConfig();
        config.translation.getCutsceneText = !config.translation.getCutsceneText;
        configModule.setConfig(config);
        event.sender.send('change-reccord-icon', config.translation.getCutsceneText);
    });
}

// set file channel
function setFileChannel() {
    // directory reader
    ipcMain.on('directory-reader', (event, path) => {
        event.returnValue = fileModule.readdir(path);
    });

    // json reader
    ipcMain.on('json-reader', (event, filePath, returnArray) => {
        event.returnValue = fileModule.read(filePath, 'json') || (returnArray ? [] : {});
    });

    // json writer
    ipcMain.on('json-writer', (event, filePath, data) => {
        fileModule.write(filePath, data, 'json');
    });

    // file writer
    ipcMain.on('file-writer', (event, filePath, data) => {
        fileModule.write(filePath, data);
    });

    // file checker
    ipcMain.on('file-checker', (event, filePath) => {
        event.returnValue = fileModule.exists(filePath);
    });

    // file deleter
    ipcMain.on('file-deleter', (event, filePath) => {
        fileModule.unlink(filePath);
    });

    // get path
    ipcMain.on('get-path', (event, ...args) => {
        event.returnValue = fileModule.getPath(...args);
    });

    // get root path
    ipcMain.on('get-root-path', (event, ...args) => {
        event.returnValue = fileModule.getRootPath(...args);
    });

    // get user data path
    ipcMain.on('get-user-data-path', (event, ...args) => {
        event.returnValue = fileModule.getUserDataPath(...args);
    });
}

// module exports
module.exports = { setIPC };
