'use strict';

/*
UPDATE NOTE
- use axios
- dialog update
- error log
fix isch
change icon
*/

// electron
const { app, BrowserWindow } = require('electron');
app.disableHardwareAcceleration();
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
  console.log('\r\ncertificate-error');
  console.log(error);

  // write log
  appModule.wirteLog('certificate-error', error);

  // Prevent having error
  event.preventDefault();

  // and continue
  callback(true);
});

// ignore uncaughtException
process.on('uncaughtException', (error) => {
  console.log('\r\nuncaughtException');
  console.log(error);

  // write log
  appModule.wirteLog('uncaughtException', error);
});

// ignore unhandledRejection
process.on('unhandledRejection', (error) => {
  console.log('\r\nunhandledRejection');
  console.log(error);

  // write log
  appModule.wirteLog('unhandledRejection', error);
});
