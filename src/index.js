'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// exec
const { execSync } = require('child_process');

// audio module
const { stopPlaying, startPlaying } = require('./renderer_modules/audio-module');

// dialog module
const {
    appendBlankDialog,
    updateDialog,
    appendNotification,
    showDialog,
    setStyle,
    moveToBottom,
} = require('./renderer_modules/dialog-module');

// drag module
const { setDragElement } = require('./renderer_modules/drag-module');

// image processing module
const { takeScreenshot } = require('./renderer_modules/image-module');

// server module
const { startServer } = require('./renderer_modules/server-module');

// click through temp
let isClickThrough = false;

// hide button check interval
let hideButtonCheckInterval = null;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setEvent();
    setIPC();
    setButton();
    startApp();
});

// set view
function setView() {
    const config = ipcRenderer.sendSync('get-config');

    // reset view
    resetView(config);

    // auto play
    if (config.translation.autoPlay) {
        document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_up_white_24dp.svg');
        startPlaying();
    } else {
        document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_off_white_24dp.svg');
    }
}

// set event
function setEvent() {
    // document click through
    document.addEventListener('mouseenter', () => {
        if (isClickThrough) {
            ipcRenderer.send('set-click-through', true);
        } else {
            ipcRenderer.send('set-click-through', false);
        }
    });

    document.addEventListener('mouseleave', () => {
        ipcRenderer.send('set-click-through', false);
    });

    // button click through
    const buttonArray = document.getElementsByClassName('img_button');
    for (let index = 0; index < buttonArray.length; index++) {
        const element = buttonArray[index];

        element.addEventListener('mouseenter', () => {
            ipcRenderer.send('set-click-through', false);
        });

        element.addEventListener('mouseleave', () => {
            if (isClickThrough) {
                ipcRenderer.send('set-click-through', true);
            } else {
                ipcRenderer.send('set-click-through', false);
            }
        });
    }
}

// set IPC
function setIPC() {
    // start server
    ipcRenderer.on('start-server', () => {
        startServer();
    });

    // hide update button
    ipcRenderer.on('hide-update-button', (event, ishidden) => {
        document.getElementById('img_button_update').hidden = ishidden;
    });

    // hide button
    ipcRenderer.on('hide-button', (event, ishidden, config) => {
        if (ishidden) {
            // hide button
            document.querySelectorAll('.auto_hidden').forEach((value) => {
                document.getElementById(value.id).hidden = config.indexWindow.hideButton;
            });
        } else {
            // show button
            document.querySelectorAll('.auto_hidden').forEach((value) => {
                document.getElementById(value.id).hidden = false;
            });

            // show dialog
            showDialog();
        }
    });

    // clear dialog
    ipcRenderer.on('clear-dialog', () => {
        document.getElementById('div_dialog').innerHTML = '';
    });

    // append blank dialog
    ipcRenderer.on('append-blank-dialog', (event, ...args) => {
        appendBlankDialog(...args);
    });

    // update dialog
    ipcRenderer.on('update-dialog', (event, ...args) => {
        updateDialog(...args);
    });

    // append dialog
    ipcRenderer.on('append-dialog', (event, id, code, name, text) => {
        appendBlankDialog(id, code);
        updateDialog(id, name, text);
    });

    // move to bottom
    ipcRenderer.on('move-to-bottom', () => {
        moveToBottom();
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
    // drag
    setDragElement(document.getElementById('img_button_drag'));

    // update
    document.getElementById('img_button_update').onclick = () => {
        try {
            execSync('explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
        } catch (error) {
            console.log(error);
        }
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
            document.getElementById('img_button_through').setAttribute('src', './img/ui/near_me_white_24dp.svg');
        } else {
            document
                .getElementById('img_button_through')
                .setAttribute('src', './img/ui/near_me_disabled_white_24dp.svg');
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
    // auto play
    document.getElementById('img_button_auto_play').onclick = () => {
        let config = ipcRenderer.sendSync('get-config');
        config.translation.autoPlay = !config.translation.autoPlay;
        ipcRenderer.send('set-config', config);
        ipcRenderer.send('mute-window', config.translation.autoPlay);

        if (config.translation.autoPlay) {
            document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_up_white_24dp.svg');
            startPlaying();
        } else {
            document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_off_white_24dp.svg');
            stopPlaying();
        }
    };

    // read log
    document.getElementById('img_button_read_log').onclick = () => {
        ipcRenderer.send('create-window', 'read-log');
    };

    // dictionary
    document.getElementById('img_button_dictionary').onclick = () => {
        ipcRenderer.send('create-window', 'dictionary');
    };

    // backspace
    document.getElementById('img_button_backspace').onclick = () => {
        try {
            document.getElementById('div_dialog').lastElementChild.remove();
        } catch (error) {
            console.log(error);
        }
    };

    // clear
    document.getElementById('img_button_clear').onclick = () => {
        document.getElementById('div_dialog').innerHTML = '';
    };
}

// start app
function startApp() {
    startServer();
    ipcRenderer.send('initialize-json');
    ipcRenderer.send('version-check');
}

// reset view
function resetView(config) {
    // set always on top
    ipcRenderer.send('set-always-on-top', config.indexWindow.alwaysOnTop);

    // set focusable
    ipcRenderer.send('set-focusable', config.indexWindow.focusable);

    // set advance buttons
    document.getElementById('div_lower_button').hidden = !config.indexWindow.advance;

    // set button
    document.querySelectorAll('.auto_hidden').forEach((value) => {
        document.getElementById(value.id).hidden = config.indexWindow.hideButton;
    });

    // set dialog
    const dialogs = document.querySelectorAll('#div_dialog div');
    if (dialogs.length > 0) {
        dialogs.forEach((value) => {
            setStyle(document.getElementById(value.id));
        });

        document.getElementById(document.getElementById('div_dialog').firstElementChild.id).style.marginTop = '0';
    }

    // show dialog
    showDialog();

    // set background color
    document.getElementById('div_dialog').style.backgroundColor = config.indexWindow.backgroundColor;

    // start/restart hide button check interval
    clearInterval(hideButtonCheckInterval);
    hideButtonCheckInterval = setInterval(() => {
        ipcRenderer.send('hide-button-check');
    }, 100);
}
