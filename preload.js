'use strict';

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
        if (event.code === 'F12') {
            ipcRenderer.send('open-devtools');
        }
    });

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-app');
    };

    document.getElementById('img_button_read_log').onclick = () => {
        ipcRenderer.send('create-window', 'read_log');
    };

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
        document.querySelectorAll('.auto_hidden').forEach((value) => {
            value.hidden = config.preloadWindow.hideButton;
        });
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
        document.querySelectorAll('.auto_hidden').forEach((value) => {
            value.hidden = false;
        });
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
    ipcRenderer.on('append-dialog', (event, id, code, name, text) => {
        appendBlankDialog(id, code);
        updateDialog(id, name, text);
        moveToBottom();
    });

    // restart translation
    ipcRenderer.on('restart-translation', (event, dialogData, translation) => {
        correctionEntry(dialogData, translation);
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
    document.getElementById('img_button_update').onclick = () => {
        exec('explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
    };

    // config
    document.getElementById('img_button_config').onclick = () => {
        ipcRenderer.send('create-window', 'config');
    };

    // capture
    document.getElementById('img_button_capture').onclick = () => {
        ipcRenderer.send('create-window', 'capture');
    };

    // throught
    document.getElementById('img_button_through').onclick = () => {
        isClickThrough = !isClickThrough;

        if (isClickThrough) {
            document.getElementById('img_button_through').setAttribute('src', './img/ui/near_me_disabled_white_24dp.svg');
        } else {
            document.getElementById('img_button_through').setAttribute('src', './img/ui/near_me_white_24dp.svg');
        }
    };

    // minimize
    document.getElementById('img_button_minimize').onclick = () => {
        ipcRenderer.send('minimize-window');
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-app');
    };

    // lower buttons
    // read log
    document.getElementById('img_button_read_log').onclick = () => {
        ipcRenderer.send('create-window', 'read_log');
    };

    // delete all
    document.getElementById('img_button_clear').onclick = () => {
        document.getElementById('div_dialog').replaceChildren();
    };

    // delete last one
    document.getElementById('img_button_clear').onclick = () => {
        document.getElementById('div_dialog').lastChild.remove();
    };
}

// reset view
function resetView(config) {
    // set always on top
    ipcRenderer.send('set-always-on-top', config.preloadWindow.alwaysOnTop);

    // set advance buttons
    document.getElementById('div_lower_button').hidden = !config.preloadWindow.advance;

    // set button
    document.querySelectorAll('.auto_hidden').forEach((value) => {
        value.hidden = config.preloadWindow.hideButton;
    });

    // set dialog
    document.querySelectorAll('#div_dialog div').forEach((value) => {
        value.style.color = config.channel[code];
        value.style.fontSize = config.dialog.fontSize + 'rem';
        value.style.marginTop = config.dialog.spacing + 'rem';
        value.style.borderRadius = config.dialog.radius + 'rem';
        value.style.backgroundColor = config.dialog.backgroundColor;
    });

    document.getElementById('div_dialog').firstElementChild.style.marginTop = 0;

    showDialog();

    // set background color
    document.getElementById('div_dialog').style.backgroundColor = config.preloadWindow.backgroundColor;
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

        if (latestVersion !== appVersion) {
            document.getElementById('img_button_update').hidden = false;
        } else {
            document.getElementById('img_button_update').hidden = true;
        }
    } catch (error) {
        console.log(error);
        document.getElementById('img_button_update').hidden = false;
    }
}