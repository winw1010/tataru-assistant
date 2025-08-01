'use strict';

// electron
const { dialog } = require('electron');

// child process
const childProcess = require('child_process');

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
const translateModule = require('./translate-module');

// version module
const versionModule = require('./version-module');

// window module
const windowModule = require('./window-module');

// fix entry
const { addTask } = require('../fix/fix-entry');

// json entry
const jsonEntry = require('../fix/json-entry');

// json function
const jsonFunction = require('../fix/json-function');

// google tts
const googleTTS = require('../translator/google-tts');

// gpt
//const gpt = require('../translator/gpt');

// app version
const appVersion = app.getVersion();

// No kanji
const regNoKanji = /^[^\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF]+$/;

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
  ipcMain.handle('get-version', () => {
    return appVersion;
  });

  // close app
  ipcMain.on('close-app', () => {
    sharlayanModule.stop(false);
    app.quit();
  });

  // get config
  ipcMain.handle('get-config', () => {
    return configModule.getConfig();
  });

  // set config
  ipcMain.handle('set-config', (event, newConfig) => {
    configModule.setConfig(newConfig);
    return configModule.getConfig();
  });

  // set default config
  ipcMain.handle('set-default-config', () => {
    configModule.setDefaultConfig();
    const defaultConfig = configModule.getConfig();

    try {
      // reset index bounds
      const defaultIndexBounds = windowModule.getWindowSize('index', defaultConfig);
      windowModule.getWindow('index').setContentBounds(defaultIndexBounds);

      // reset config bounds
      const defaultConfigBounds = windowModule.getWindowSize('config', defaultConfig);
      windowModule.getWindow('config').setContentBounds(defaultConfigBounds);
    } catch (error) {
      console.log(error);
    }

    return defaultConfig;
  });

  // get chat code
  ipcMain.handle('get-chat-code', () => {
    return chatCodeModule.getChatCode();
  });

  // set chat code
  ipcMain.handle('set-chat-code', (event, newChatCode) => {
    chatCodeModule.setChatCode(newChatCode);
    return chatCodeModule.getChatCode();
  });

  // set default chat code
  ipcMain.handle('set-default-chat-code', () => {
    chatCodeModule.setDefaultChatCode();
    return chatCodeModule.getChatCode();
  });

  // restart sharlayan reader
  ipcMain.on('restart-sharlayan-reader', () => {
    sharlayanModule.stop(true);
  });

  // fix reader
  ipcMain.on('fix-reader', (event) => {
    childProcess.exec('secedit /configure /cfg %windir%\\inf\\defltbase.inf /db defltbase.sdb /verbose', (error) => {
      let message = '';

      if (error && error.code === 740) {
        message = 'You must run Tataru Assistant as administrator. (Error 740)';
      } else {
        message = 'Completed.';
      }

      dialogModule.showInfo(event.sender, message);
    });
  });

  // console log
  ipcMain.on('console-log', (event, ...args) => {
    console.log(...args);
  });
}

// set window channel
function setWindowChannel() {
  // create window
  ipcMain.on('create-window', (event, windowName, data = null) => {
    try {
      windowModule.closeWindow(windowName);
    } catch (error) {
      error;
      windowModule.createWindow(windowName, data);
    }
  });

  // restart window
  ipcMain.on('restart-window', (event, windowName, data = null) => {
    windowModule.restartWindow(windowName, data);
  });

  ipcMain.on('move-window', (event, detail) => {
    BrowserWindow.fromWebContents(event.sender).setContentBounds(detail);
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
  /*
  ipcMain.on('set-always-on-top', (event, isAlwaysOnTop) => {
    try {
      BrowserWindow.fromWebContents(event.sender).setAlwaysOnTop(isAlwaysOnTop, 'screen-saver');
    } catch (error) {
      console.log(error);
    }
  });
  */

  // focusable
  ipcMain.on('set-focusable', (event, value = true) => {
    windowModule.setFocusable(value);
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

  // get click through config
  ipcMain.handle('get-click-through-config', () => {
    return configModule.getConfig().indexWindow.clickThrough;
  });

  // set click through config
  ipcMain.on('set-click-through-config', (event, value) => {
    let config = configModule.getConfig();
    config.indexWindow.clickThrough = value;
    configModule.setConfig(config);
  });

  // mute window
  ipcMain.on('mute-window', (event, autoPlay) => {
    event.sender.setAudioMuted(!autoPlay);
  });

  // send index
  ipcMain.on('send-index', (event, channel, ...args) => {
    windowModule.sendIndex(channel, ...args);
  });

  // change UI text
  ipcMain.on('change-ui-text', () => {
    windowModule.forEachWindow((appWindow) => {
      appWindow.webContents.send('change-ui-text');
    });
  });

  // execute command
  ipcMain.on('execute-command', (event, command) => {
    childProcess.exec(command, () => {
      //console.log(error.message);
    });
  });

  ipcMain.on('show-info', (event, message = '') => {
    dialogModule.showInfo(event.sender, message);
  });
}

// set dialog channel
function setDialogChannel() {
  // add log
  ipcMain.on('add-log', (event, dialogData = {}, scroll = false) => {
    dialogModule.updateDialog(dialogData, scroll, false);
  });

  // add notification
  ipcMain.on('add-notification', (event, text = '') => {
    dialogModule.addNotification(text);
  });

  // reset dialog style
  ipcMain.on('reset-dialog-style', (event, resetList = []) => {
    for (let index = 0; index < resetList.length; index++) {
      const element = resetList[index];
      resetList[index].style = dialogModule.getStyle(element.code);
    }

    event.sender.send('reset-dialog-style', resetList);
  });

  // show dialog
  ipcMain.on('show-dialog', () => {
    dialogModule.showDialog();
  });

  // create log name
  ipcMain.handle('create-log-name', (event, milliseconds) => {
    return dialogModule.createLogName(milliseconds);
  });
}

// set capture channel
function setCaptureChannel() {
  // get screen bounds
  ipcMain.handle('get-screen-bounds', () => {
    return screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).bounds;
  });

  // get mouse position
  ipcMain.handle('get-mouse-position', () => {
    return screen.getCursorScreenPoint();
  });

  // start recognize
  ipcMain.on('start-recognize', (event, captureData) => {
    // get display nearest point
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());

    // find display's index
    const displayIDs = screen.getAllDisplays().map((x) => x.id);
    captureData.displayIndex = displayIDs.indexOf(display.id);

    // take screenshot
    imageModule.takeScreenshot(captureData);
  });

  // minimize all windows
  ipcMain.on('minimize-all-windows', () => {
    windowModule.forEachWindow((myWindow) => {
      myWindow.minimize();
    });
  });

  // translate image text
  ipcMain.on('translate-image-text', (event, captureData) => {
    textDetectModule.translateImageText(captureData);
  });

  // set google credential
  ipcMain.on('set-google-credential', () => {
    dialog
      .showOpenDialog({
        defaultPath: fileModule.getDownloadsPath(),
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      .then((value) => {
        if (!value.canceled && value.filePaths.length > 0 && value.filePaths[0].length > 0) {
          let data = fileModule.read(value.filePaths[0], 'json');

          if (data) {
            fileModule.write(fileModule.getUserDataPath('config', 'google-vision-credential.json'), data, 'json');
            dialogModule.addNotification('GOOGLE_CREDENTIAL_SAVED');
          } else {
            dialogModule.addNotification('INCORRECT_FILE');
          }
        }
      })
      .catch(console.log);
  });
}

// set request channel
function setRequestChannel() {
  // set UA
  ipcMain.on('set-ua', (event, scuValue, uaValue) => {
    requestModule.setUA(scuValue, uaValue);
  });

  // version check
  ipcMain.on('version-check', (event) => {
    // get lastest version
    requestModule
      .get('https://api.github.com/repos/winw1010/tataru-assistant/releases/latest')
      .then((response) => {
        // compare with app version
        const latestVersion = response?.data?.tag_name;

        if (latestVersion) {
          if (versionModule.isLatest(appVersion, latestVersion)) {
            windowModule.sendIndex('hide-update-button', true);
            console.log('latest version');
          } else {
            windowModule.sendIndex('hide-update-button', false);
            dialogModule.addNotification('UPDATE_AVAILABLE');
          }
        } else {
          throw 'VERSION_CHECK_ERRORED';
        }
      })
      .catch((error) => {
        console.log(error);
        windowModule.sendIndex('hide-update-button', false);
        dialogModule.addNotification(error);
      });

    // get info
    requestModule
      .get('https://raw.githubusercontent.com/winw1010/tataru-assistant-text/main/info.json')
      .then((response) => {
        if (response?.data?.show) {
          // show info
          dialogModule.showInfo(event.sender, '' + response.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        dialogModule.addNotification(error);
      });
  });

  // post form
  ipcMain.on('post-form', (event, path) => {
    requestModule.post('https://docs.google.com' + path).catch(console.log);
  });
}

// set json channel
function setJsonChannel() {
  // initialize json
  ipcMain.on('initialize-json', () => {
    jsonEntry.initializeJSON();
  });

  // download json
  ipcMain.on('download-json', () => {
    jsonEntry.downloadJSON();
  });

  // load json
  ipcMain.on('load-json', () => {
    jsonEntry.loadJSON();
  });

  // delete temp
  ipcMain.on('delete-temp', () => {
    jsonFunction.deleteTemp();
    jsonEntry.loadJSON();
    dialogModule.addNotification('TEMP_DELETED');
  });

  // get array
  ipcMain.handle('get-user-array', (event, name = '') => {
    let array = jsonEntry.getUserArray(name);
    return array;
  });

  // save user custom
  ipcMain.on('save-user-custom', (event, textBefore = '', textAfter = '', type = '') => {
    let fileName = '';
    let textBefore2 = textBefore;
    let array = [];

    if (type !== 'custom-overwrite' && textBefore2.length < 3 && regNoKanji.test(textBefore2)) textBefore2 += '#';

    if (type === 'custom-source') {
      fileName = 'custom-source.json';
      array.push([textBefore2, textAfter]);
    } else if (type === 'custom-overwrite') {
      fileName = 'custom-overwrite.json';
      array.push([textBefore2, textAfter]);
    } else if (type === 'player' || type === 'retainer') {
      fileName = 'player-name.json';
      array.push([textBefore2, textAfter, type]);
    } else {
      fileName = 'custom-target.json';
      array.push([textBefore2, textAfter, type]);
    }

    jsonFunction.saveUserCustom(fileName, array);
    jsonEntry.loadJSON();
    event.sender.send('create-table');
  });

  // delete user custom
  ipcMain.on('delete-user-custom', (event, textBefore = '', type = '') => {
    let fileName = '';
    let textBefore2 = textBefore;

    if (type !== 'custom-overwrite' && textBefore2.length < 3 && regNoKanji.test(textBefore2)) {
      textBefore2 += '#';
    }

    if (type === 'custom-source') {
      fileName = 'custom-source.json';
    } else if (type === 'custom-overwrite') {
      fileName = 'custom-overwrite.json';
    } else if (type === 'player' || type === 'retainer') {
      fileName = 'player-name.json';
    } else {
      fileName = 'custom-target.json';
    }

    jsonFunction.editUserCustom(fileName, textBefore2);
    jsonFunction.editUserCustom('temp-name.json', textBefore2);
    jsonEntry.loadJSON();
    event.sender.send('create-table');
  });
}

// set translate channel
function setTranslateChannel() {
  // get engine select
  ipcMain.handle('get-engine-select', () => {
    return engineModule.getEngineSelect();
  });

  // get all language select
  ipcMain.handle('get-all-language-select', () => {
    return engineModule.getAllLanguageSelect();
  });

  // get source select
  ipcMain.handle('get-source-select', () => {
    return engineModule.getSourceSelect();
  });

  // get source select
  ipcMain.handle('get-player-source-select', () => {
    return engineModule.getPlayerSourceSelect();
  });

  // get target select
  ipcMain.handle('get-target-select', () => {
    return engineModule.getTargetSelect();
  });

  // get UI select
  ipcMain.handle('get-ui-select', () => {
    return engineModule.getUISelect();
  });

  // get AI list
  ipcMain.handle('get-ai-list', () => {
    return engineModule.aiList;
  });

  // add task
  ipcMain.on('add-task', (event, dialogData) => {
    addTask(dialogData);
  });

  // get translation
  ipcMain.on('translate-text', async (event, dialogData) => {
    event.sender.send('show-translation', await translateModule.translate(dialogData.text, dialogData.translation), dialogData.translation.to);
  });

  // google tts
  ipcMain.handle('google-tts', (event, text, from) => {
    return googleTTS.getAudioUrl(text, from);
  });

  /*
  // check API
  ipcMain.on('check-api', (event, engine) => {
    if ([].concat(engineModule.aiList, ['google-vision']).includes(engine)) {
      const config = configModule.getConfig();
      let message = '';

      if (engine === 'Gemini') {
        if (config.api.geminiApiKey === '') message = '請至【API設定】輸入API key';
      } else if (engine === 'GPT') {
        if (config.api.gptApiKey === '' || config.api.gptModel === '') message = '請至【API設定】輸入API key和模型';
      } else if (engine === 'Cohere') {
        if (config.api.cohereToken === '') message = '請至【API設定】輸入API key';
      } else if (engine === 'Kimi') {
        if (config.api.kimiToken === '') message = '請至【API設定】輸入API key';
      } else if (engine === 'google-vision') {
        const keyPath = fileModule.getUserDataPath('config', 'google-vision-credential.json');
        if (!fileModule.exists(keyPath)) {
          message = '尚未設定Google憑證，請至【設定】>【API設定】輸入憑證';
        }
      }

      if (message !== '') {
        dialogModule.showInfo(event.sender, message);
      }
    }
  });
  */

  /*
  // get GPT model list
  ipcMain.handle('get-gpt-model-list', (event, apiKey) => {
    return gpt.getModelList(apiKey);
  });
  */
}

// set file channel
function setFileChannel() {
  // read directory
  ipcMain.handle('read-directory', (event, path) => {
    return fileModule.readdir(path);
  });

  // read json
  ipcMain.handle('read-json', (event, filePath, returnArray) => {
    return fileModule.read(filePath, 'json') || (returnArray ? [] : {});
  });

  // get path
  ipcMain.handle('get-path', (event, ...args) => {
    return fileModule.getPath(...args);
  });

  // get root path
  ipcMain.handle('get-root-path', (event, ...args) => {
    return fileModule.getRootPath(...args);
  });

  // get user data path
  ipcMain.handle('get-user-data-path', (event, ...args) => {
    return fileModule.getUserDataPath(...args);
  });

  ipcMain.on('clear-cache', async (event) => {
    const response = await dialogModule.showInfo(event.sender, 'Delete cache file?', ['YES', 'NO'], 1);
    if (response === 0) {
      fileModule.unlink(fileModule.getUserDataPath('text', 'temp-name.json'));
      jsonEntry.loadJSON();
    }
  });
}

// module exports
module.exports = { setIPC };
