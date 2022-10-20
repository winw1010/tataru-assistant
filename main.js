'use strict';

// electron
const { app, BrowserWindow } = require('electron');

// window module
const windowModule = require('./src/main_modules/system/window-module');

// when ready
app.whenReady().then(() => {
    // app module
    const appModule = require('./src/main_modules/system/app-module');

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
