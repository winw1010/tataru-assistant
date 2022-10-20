'use strict';

// package module
const packageModule = require('./src/main_modules/package-module');

// electron
const { app, BrowserWindow } = packageModule.electron;

// app module
const appModule = packageModule.appModule;

// window module
const windowModule = packageModule.windowModule;

// when ready
app.whenReady().then(() => {
    // start app
    appModule.startApp();

    // create index window
    windowModule.createWindow('index');
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) windowModule.createWindow('index');
    });
});

// on window all closed
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
