'use strict';

// electron modules
const { BrowserWindow, screen } = require('electron');

// config module
const configModule = require('./config-module');

// chat code module
const chatCodeModule = require('./chat-code-module');

// file module
const fileModule = require('./file-module');

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
    const appWindow = new BrowserWindow({
      ...windowSize,
      show: false,
      frame: false,
      transparent: true,
      fullscreenable: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        preload: fileModule.getPath(__dirname, `../../html/util/${windowName}.js`),
      },
    });

    // load html
    appWindow.loadFile(fileModule.getPath(__dirname, `../../html/${windowName}.html`));

    // set always on top
    appWindow.setAlwaysOnTop(true, 'screen-saver');

    // set minimizable
    appWindow.setMinimizable(false);

    // show window
    appWindow.once('ready-to-show', () => {
      appWindow.show();
    });

    // did-finish-load
    appWindow.webContents.once('did-finish-load', () => {
      // change language
      appWindow.webContents.send('change-ui-text');

      // send data
      if (data) {
        appWindow.webContents.send('send-data', data);
      }
    });

    // set event
    switch (windowName) {
      case 'index':
        // set close event
        appWindow.once('close', () => {
          // save position
          const config = configModule.getConfig();
          config.indexWindow.x = appWindow.getPosition()[0];
          config.indexWindow.y = appWindow.getPosition()[1];
          config.indexWindow.width = appWindow.getSize()[0];
          config.indexWindow.height = appWindow.getSize()[1];
          configModule.setConfig(config);

          // save config
          configModule.saveConfig();

          // save chat code
          chatCodeModule.saveChatCode();
        });
        break;

      case 'capture':
        // set close event
        appWindow.once('close', () => {
          // save position
          const config = configModule.getConfig();
          config.captureWindow.x = appWindow.getPosition()[0];
          config.captureWindow.y = appWindow.getPosition()[1];
          config.captureWindow.width = appWindow.getSize()[0];
          config.captureWindow.height = appWindow.getSize()[1];
          configModule.setConfig(config);
        });
        break;

      default:
        break;
    }

    // devtools
    //window.webContents.openDevTools({ mode: 'detach' });

    // save window
    setWindow(windowName, appWindow);
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
  const displaySizeRate = displayBounds.width >= 1920 ? 0.9 : 1;
  const displayLength = displayBounds.width > displayBounds.height ? Math.min(parseInt((displayBounds.height * 16) / 9), displayBounds.width) * displaySizeRate : displayBounds.width * displaySizeRate;

  switch (windowName) {
    case 'index':
      {
        const indexBounds = config.indexWindow;

        // first time
        if (boundsValidCheck(indexBounds)) {
          bounds.x = displayBounds.x + parseInt(displayBounds.width * 0.7);
          bounds.y = displayBounds.y + parseInt(displayBounds.height * 0.2);
          bounds.width = parseInt(displayLength * 0.16);
          bounds.height = parseInt(displayLength * 0.32);
        } else {
          bounds.x = indexBounds.x;
          bounds.y = indexBounds.y;
          bounds.width = indexBounds.width;
          bounds.height = indexBounds.height;
        }

        if (configModule.getConfig().indexWindow.minSize) {
          bounds.minWidth = 200;
          bounds.minHeight = 200;
        }

        bounds = boundsSizeCheck(bounds);
      }
      break;

    case 'capture':
      {
        const captureBounds = config.captureWindow;

        // first time
        if (boundsValidCheck(captureBounds)) {
          bounds.x = displayBounds.x + parseInt(displayBounds.width * 0.3);
          bounds.y = displayBounds.y + parseInt(displayBounds.height * 0.6);
          bounds.width = parseInt(displayLength * 0.5);
          bounds.height = parseInt(displayLength * 0.19);
        } else {
          bounds.x = captureBounds.x;
          bounds.y = captureBounds.y;
          bounds.width = captureBounds.width;
          bounds.height = captureBounds.height;
        }

        if (configModule.getConfig().indexWindow.minSize) {
          bounds.minWidth = parseInt(displayLength * 0.5);
          bounds.minHeight = 200;
        }

        bounds = boundsSizeCheck(bounds);
      }
      break;

    case 'capture-edit':
      {
        const indexBounds = windowList['index'].getBounds();
        bounds.width = parseInt(displayLength * 0.32);
        bounds.height = parseInt(displayLength * 0.32);
        bounds.minWidth = bounds.width;
        bounds.minHeight = bounds.height;
        bounds = getNearPosition(displayBounds, indexBounds, bounds);
      }
      break;

    case 'config':
      {
        const indexBounds = windowList['index'].getBounds();
        bounds.width = parseInt(displayLength * 0.26);
        bounds.height = parseInt(displayLength * 0.4);
        bounds.minWidth = bounds.width;
        bounds.minHeight = bounds.height;
        bounds = getNearPosition(displayBounds, indexBounds, bounds);
      }
      break;

    case 'dictionary':
      {
        const indexBounds = windowList['index'].getBounds();
        bounds.width = parseInt(displayLength * 0.27);
        bounds.height = parseInt(displayLength * 0.4);
        bounds.minWidth = bounds.width;
        bounds.minHeight = bounds.height;
        bounds = getNearPosition(displayBounds, indexBounds, bounds);
      }
      break;

    case 'edit':
      {
        const indexBounds = windowList['index'].getBounds();
        bounds.width = parseInt(displayLength * 0.45);
        bounds.height = parseInt(displayLength * 0.45);
        bounds.minWidth = bounds.width;
        bounds.minHeight = bounds.height;
        bounds = getNearPosition(displayBounds, indexBounds, bounds);
      }
      break;

    case 'custom':
      {
        const indexBounds = windowList['index'].getBounds();
        bounds.width = parseInt(displayLength * 0.4);
        bounds.height = parseInt(displayLength * 0.4);
        bounds.minWidth = bounds.width;
        bounds.minHeight = bounds.height;
        bounds = getNearPosition(displayBounds, indexBounds, bounds);
      }
      break;

    case 'read-log':
      {
        const indexBounds = windowList['index'].getBounds();
        bounds.width = parseInt(displayLength * 0.25);
        bounds.height = parseInt(displayLength * 0.15);
        bounds.minWidth = bounds.width;
        bounds.minHeight = bounds.height;
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
  return (bounds.x === -1 && bounds.y === -1 && bounds.width === -1 && bounds.height === -1) || bounds.width <= 0 || bounds.height <= 0;
}

// bounds position check
function boundsPositionCheck(bounds) {
  const point = {
    x: bounds.x + parseInt(bounds.width / 2),
    y: bounds.y + parseInt(bounds.height / 2),
  };
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

// set focusable
function setFocusable(value = true) {
  windowList['index']?.setFocusable(value);
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

// close window
function closeWindow(windowName) {
  windowList[windowName].close();
}

// get window
function getWindow(windowName) {
  return windowList[windowName];
}

// set window
function setWindow(windowName, myWindow) {
  windowList[windowName] = myWindow;
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
  setFocusable,
  restartWindow,
  closeWindow,

  setWindow,
  getWindow,
  sendWindow,
  sendIndex,
  forEachWindow,

  openDevTools,
  consoleLog,
};
