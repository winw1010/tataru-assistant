'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

// audio module
const { stopPlaying, startPlaying } = require('./renderer_modules/audio-module');

// dialog module
const dialogModule = require('./renderer_modules/dialog-module');

// image processing module
const { takeScreenshot } = require('./renderer_modules/image-module');

// click through temp
let isClickThrough = false;
let isClickThroughTemp = false;

// mouse out check interval
let mouseOutCheckInterval = null;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setContextBridge();
    setIPC();

    setView();
    setEvent();
    setButton();

    startApp();
});

// set context bridge
function setContextBridge() {
    contextBridge.exposeInMainWorld('myAPI', {
        dragWindow: (...args) => {
            ipcRenderer.send('drag-window', ...args);
        },
        getConfig: () => {
            return ipcRenderer.sendSync('get-config');
        },
    });
}

// set IPC
function setIPC() {
    // change UI text
    ipcRenderer.on('change-ui-text', () => {
        document.dispatchEvent(new CustomEvent('change-ui-text'));
    });

    // hide update button
    ipcRenderer.on('hide-update-button', (event, ishidden) => {
        document.getElementById('img_button_update').hidden = ishidden;
    });

    // hide button
    ipcRenderer.on('hide-button', (event, isMouseOut, hideButton) => {
        if (isMouseOut) {
            // hide button
            document.querySelectorAll('.auto_hidden').forEach((value) => {
                document.getElementById(value.id).hidden = hideButton;
            });
        } else {
            // show button
            document.querySelectorAll('.auto_hidden').forEach((value) => {
                document.getElementById(value.id).hidden = false;
            });

            // show dialog
            dialogModule.showDialog();
        }
    });

    // clear dialog
    ipcRenderer.on('clear-dialog', () => {
        document.getElementById('div_dialog').innerHTML = '';
    });

    // append blank dialog
    ipcRenderer.on('append-blank-dialog', (event, ...args) => {
        dialogModule.appendBlankDialog(...args);
    });

    // update dialog
    ipcRenderer.on('update-dialog', (event, ...args) => {
        dialogModule.updateDialog(...args);
    });

    // append dialog
    ipcRenderer.on('append-dialog', (event, id, code, name, text) => {
        dialogModule.appendBlankDialog(id, code);
        dialogModule.updateDialog(id, name, text);
    });

    // move to bottom
    ipcRenderer.on('move-to-bottom', () => {
        dialogModule.moveToBottom();
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
        dialogModule.appendNotification(text);
    });
}

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

    // change UI text
    document.dispatchEvent(new CustomEvent('change-ui-text'));

    // first time check
    if (config.system.firstTime) {
        ipcRenderer.send('create-window', 'config', ['button_radio_translation', 'div_translation']);
    }
}

// set event
function setEvent() {
    // drag click through
    document.getElementById('img_button_drag').addEventListener('mousedown', () => {
        isClickThroughTemp = isClickThrough;
        isClickThrough = false;
    });
    document.getElementById('img_button_drag').addEventListener('mouseup', () => {
        isClickThrough = isClickThroughTemp;
    });

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

// set button
function setButton() {
    // upper buttons
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

    // update
    document.getElementById('img_button_update').onclick = () => {
        ipcRenderer.send('execute-command', 'explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
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
    ipcRenderer.send('start-server');
    ipcRenderer.send('initialize-json');
    ipcRenderer.send('version-check');
}

// reset view
function resetView(config) {
    // set always on top
    ipcRenderer.send('set-always-on-top', config.indexWindow.alwaysOnTop);

    // set focusable
    ipcRenderer.send('set-focusable', config.indexWindow.focusable);

    // set button
    document.querySelectorAll('.auto_hidden').forEach((value) => {
        document.getElementById(value.id).hidden = config.indexWindow.hideButton;
    });

    // set dialog
    const dialogs = document.querySelectorAll('#div_dialog div');
    if (dialogs.length > 0) {
        dialogs.forEach((value) => {
            dialogModule.setStyle(document.getElementById(value.id));
        });

        document.getElementById(dialogs[0].id).style.marginTop = '0';
    }

    // show dialog
    dialogModule.showDialog();

    // set background color
    document.getElementById('div_dialog').style.backgroundColor = config.indexWindow.backgroundColor;

    // start/restart mouse out check interval
    clearInterval(mouseOutCheckInterval);
    mouseOutCheckInterval = setInterval(() => {
        ipcRenderer.send('mouse-out-check');
    }, 100);
}
