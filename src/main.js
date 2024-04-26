'use strict';

/*
UPDATE NOTE
use axios
fix isch
error log
gemini vision
change icon
*/

// electron
const { app, BrowserWindow } = require('electron');
app.commandLine.appendSwitch('disable-http-cache');

// app module
const appModule = require('./module/system/app-module');

// window module
const windowModule = require('./module/system/window-module');

// on ready
app.on('ready', () => {
  appModule.startApp();
  windowModule.createWindow('index');
});

// on window all closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// on activate
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) windowModule.createWindow('index');
});

// ignore certificate error
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // Prevent having error
  event.preventDefault();
  // and continue
  callback(true);
});

// ignore uncaughtException
process.on('uncaughtException', (error) => {
  console.log(error);
});

// ignore unhandledRejection
process.on('unhandledRejection', (error) => {
  console.log(error);
});
