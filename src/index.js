'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

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
        ipcRendererSend: (channel, ...args) => {
            ipcRenderer.send(channel, ...args);
        },
        ipcRendererSendSync: (channel, ...args) => {
            return ipcRenderer.sendSync(channel, ...args);
        },
        ipcRendererInvoke: (channel, ...args) => {
            return ipcRenderer.invoke(channel, ...args);
        },
    });
}

// set IPC
function setIPC() {
    // change UI text
    ipcRenderer.on('change-ui-text', () => {
        dispatchCustomEvent('change-ui-text');
    });

    // version check
    ipcRenderer.on('version-check', () => {
        versionCheck();
    });

    // clear dialog
    ipcRenderer.on('clear-dialog', () => {
        document.getElementById('div_dialog').innerHTML = '';
    });

    // append blank dialog
    ipcRenderer.on('append-blank-dialog', (event, id, code) => {
        dispatchCustomEvent('append-blank-dialog', { id, code });
    });

    // update dialog
    ipcRenderer.on('update-dialog', (event, id, name, text, dialogData, translation) => {
        dispatchCustomEvent('update-dialog', { id, name, text, dialogData, translation });
    });

    // append dialog
    ipcRenderer.on('append-dialog', (event, id, code, name, text) => {
        dispatchCustomEvent('append-blank-dialog', { id, code });
        dispatchCustomEvent('update-dialog', { id, name, text, dialogData: null, translation: null });
    });

    // move to bottom
    ipcRenderer.on('move-to-bottom', () => {
        dispatchCustomEvent('move-to-bottom');
    });

    // reset view
    ipcRenderer.on('reset-view', (event, config) => {
        resetView(config);
    });

    // show notification
    ipcRenderer.on('show-notification', (event, text) => {
        dispatchCustomEvent('show-notification', { text });
    });

    // console log
    ipcRenderer.on('console-log', (event, text) => {
        console.log(text);
    });
}

// set view
function setView() {
    const config = ipcRenderer.sendSync('get-config');

    // reset view
    resetView(config);

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
        let config = ipcRenderer.sendSync('get-config');

        if (config.indexWindow.focusable) {
            ipcRenderer.send('minimize-window');
        } else {
            dispatchCustomEvent('show-notification', { text: '在不可選取的狀態下無法縮小視窗' });
        }
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
            dispatchCustomEvent('start-playing');
        } else {
            document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_off_white_24dp.svg');
            dispatchCustomEvent('stop-playing');
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
    versionCheck();
}

// reset view
function resetView(config) {
    // restore window
    ipcRenderer.send('restore-window');

    // set always on top
    ipcRenderer.send('set-always-on-top', config.indexWindow.alwaysOnTop);

    // set focusable
    ipcRenderer.send('set-focusable', config.indexWindow.focusable);

    // set button
    document.querySelectorAll('.auto_hidden').forEach((value) => {
        document.getElementById(value.id).hidden = config.indexWindow.hideButton;
    });

    // reset dialog style
    dispatchCustomEvent('reset-dialog-style');

    // show dialog
    dispatchCustomEvent('show-dialog');

    // set background color
    document.getElementById('div_dialog').style.backgroundColor = config.indexWindow.backgroundColor;

    // start/restart mouse out check interval
    clearInterval(mouseOutCheckInterval);
    mouseOutCheckInterval = setInterval(() => {
        ipcRenderer
            .invoke('mouse-out-check')
            .then((value) => {
                hideButton(value.isMouseOut, value.hideButton);
            })
            .catch(console.log);
    }, 100);
}

// hide button
function hideButton(isMouseOut, hideButton) {
    if (isMouseOut) {
        // hide
        document.querySelectorAll('.auto_hidden').forEach((value) => {
            document.getElementById(value.id).hidden = hideButton;
        });
    } else {
        // show
        document.querySelectorAll('.auto_hidden').forEach((value) => {
            document.getElementById(value.id).hidden = false;
        });

        // show dialog
        dispatchCustomEvent('show-dialog');
    }
}

// version check
async function versionCheck() {
    let notificationText = '';

    try {
        // get version data
        const data = await ipcRenderer.invoke('get-latest-version');
        const currentVersion = ipcRenderer.sendSync('get-version');
        const latestVersion = data?.number;
        const appVersion = ipcRenderer.sendSync('get-version');

        // set request config
        ipcRenderer.send('set-request-config', data);

        // compare app version
        if (appVersion === latestVersion) {
            document.getElementById('img_button_update').hidden = true;
            notificationText = '已安裝最新版本';
        } else {
            document.getElementById('img_button_update').hidden = false;
            notificationText = `已有可用的更新(目前版本: v${currentVersion}，最新版本: v${latestVersion})`;
        }
    } catch (error) {
        console.log(error);
        document.getElementById('img_button_update').hidden = false;
        notificationText = '版本檢查失敗: ' + error;
    }

    dispatchCustomEvent('show-notification', { text: notificationText });
    dispatchCustomEvent('show-notification', {
        text:
            '請點選上方的<img src="./img/ui/update_white_24dp.svg" style="width: 1.5rem; height: 1.5rem;">按鈕下載最新版本',
    });
}

// dispatch custom event
function dispatchCustomEvent(type, detail) {
    document.dispatchEvent(new CustomEvent(type, { detail }));
}
