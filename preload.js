// Communicate with main process
const { ipcRenderer } = require('electron');

// exec
const { exec } = require('child_process');

// exec
const { readFileSync } = require('fs');

// download github repo
const downloadGitRepo = require('download-git-repo');

// json fixer
const jsonFixer = require('json-fixer')

// server module
const { startServer } = require('./module/server-module');

// image processing module
const { takeScreenshot } = require('./module/image-module');

// correction module
const { correctionEntry } = require('./module/correction-module');
const { loadJSON_JP } = require('./module/correction-module-jp');
const { loadJSON_EN } = require('./module/correction-module-en');

// dialog module
const { appendBlankDialog, updateDialog, appendNotification, showDialog, moveToBottom } = require('./module/dialog-module');

// click through temp
let isClickThrough = false;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // F12
    document.addEventListener('keydown', (event) => {
        if (event.code == 'F12') {
            ipcRenderer.send('open-devtools');
        }
    });

    loadJSON();
    setHTML();
    startServer();
});

// set html
function setHTML() {
    setView();
    setEvent();
    setButton();
}

// set view
function setView() {
    let config = ipcRenderer.sendSync('load-config');
    resetView(config);
}

// set event
function setEvent() {
    // document click through
    document.addEventListener('mouseenter', () => {
        if (isClickThrough) {
            ipcRenderer.send('set-click-through', true, { forward: true });
        } else {
            ipcRenderer.send('set-click-through', false);
        }
    });
    document.addEventListener('mouseleave', () => {
        let config = ipcRenderer.sendSync('load-config');

        ipcRenderer.send('set-click-through', false);

        // hide button
        $('.auto_hidden').prop('hidden', config.preloadWindow.hideButton);
    });

    // button click through
    let buttonArray = document.getElementsByClassName('img_button');
    for (let index = 0; index < buttonArray.length; index++) {
        const element = buttonArray[index];

        element.addEventListener('mouseenter', () => {
            ipcRenderer.send('set-click-through', false);
        });

        element.addEventListener('mouseleave', () => {
            if (isClickThrough) {
                ipcRenderer.send('set-click-through', true, { forward: true });
            } else {
                ipcRenderer.send('set-click-through', false);
            }
        });
    }

    // show dialog and button
    document.addEventListener('mousemove', () => {
        // show dialog
        showDialog();

        // show button
        $('.auto_hidden').prop('hidden', false);
    });

    // download json
    ipcRenderer.on('download-json', (event) => {
        downloadJSON();
    });

    // read json
    ipcRenderer.on('read-json', (event) => {
        readJSON();
    });

    // start server
    ipcRenderer.on('start-server', (event) => {
        startServer();
    });

    // append dialog
    ipcRenderer.on('append-log', (event, id, code, name, text) => {
        appendBlankDialog(id, code);
        updateDialog(id, name, text);
        moveToBottom();
    });

    // restart translation
    ipcRenderer.on('restart-translation', (event, package, translation) => {
        correctionEntry(package, translation);
    });

    // reset view
    ipcRenderer.on('reset-view', (event, ...args) => {
        resetView(...args);
    });

    // start screen translation
    ipcRenderer.on('start-screen-translation', (event, ...args) => {
        takeScreenshot(...args);
    });

    // show notification
    ipcRenderer.on('show-notification', (event, text) => {
        appendNotification(text);
    });
}

// set button
function setButton() {
    // upper buttons
    // update
    $('#img_button_update').on('click', () => {
        exec('explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
    });

    // config
    $('#img_button_config').on('click', () => {
        ipcRenderer.send('create-window', 'config');
    });

    // capture
    $('#img_button_capture').on('click', () => {
        ipcRenderer.send('create-window', 'capture');
    });

    // throught
    $('#img_button_through').on('click', () => {
        isClickThrough = !isClickThrough;

        if (isClickThrough) {
            $('#img_button_through').prop('src', './img/ui/near_me_disabled_white_24dp.svg');
        } else {
            $('#img_button_through').prop('src', './img/ui/near_me_white_24dp.svg');
        }
    });

    // minimize
    $('#img_button_minimize').on('click', () => {
        ipcRenderer.send('minimize-window');
    });

    // close
    $('#img_button_close').on('click', () => {
        ipcRenderer.send('close-app');
    });

    // lower buttons

    /*
    // bottom
    $('#img_button_bottom').on('click', () => {
        moveToBottom();
    });
    */

    // read log
    $('#img_button_read_log').on('click', () => {
        ipcRenderer.send('create-window', 'read_log');
    });

    // delete all
    $('#img_button_clear').on('click', () => {
        $('#div_dialog').empty();
    });

    // delete last one
    $('#img_button_backspace').on('click', () => {
        $('#div_dialog div:last-child').remove();
    });
}

// reset view
function resetView(config) {
    // set always on top
    ipcRenderer.send('set-always-on-top', config.preloadWindow.alwaysOnTop);

    // set advance buttons
    $('#div_lower_button').prop('hidden', !config.preloadWindow.advance);

    // set button
    $('.auto_hidden').prop('hidden', config.preloadWindow.hideButton);

    // set dialog
    $('#div_dialog div').css({
        'font-size': config.dialog.fontSize + 'rem',
        'margin-top': config.dialog.spacing + 'rem',
        'border-radius': config.dialog.radius + 'rem',
        'background-color': config.dialog.backgroundColor
    });

    $('#div_dialog div:first-child').css({
        'margin-top': '0'
    });

    showDialog();

    // set background color
    $('#div_dialog').css({
        'background-color': config.preloadWindow.backgroundColor
    });
}

// load json
function loadJSON() {
    const config = ipcRenderer.sendSync('load-config');

    if (config.system.autoDownloadJson) {
        downloadJSON();
    } else {
        readJSON();
    }
}

// download json
function downloadJSON() {
    exec(`rmdir /Q /S json\\text`, () => {
        downloadGitRepo('winw1010/tataru-helper-node-text-ver.2.0.0#main', 'json/text', (err) => {
            if (err) {
                console.error(err);
            } else {
                appendNotification('對照表下載完畢');
                readJSON();
            }
        });
    });
}

// read json
function readJSON() {
    const config = ipcRenderer.sendSync('load-config');

    loadJSON_JP(config.translation.to);
    loadJSON_EN(config.translation.to);

    appendNotification('對照表讀取完畢');

    // version check
    versionCheck();
}

// version check
function versionCheck() {
    try {
        const latestVersion = jsonFixer(readFileSync('./json/text/version.json').toString()).data.number;
        const appVersion = ipcRenderer.sendSync('get-version');

        if (latestVersion != appVersion) {
            $('#img_button_update').prop('hidden', false);
        } else {
            $('#img_button_update').prop('hidden', true);
        }
    } catch (error) {
        console.log(error);
        $('#img_button_update').prop('hidden', false);
    }
}