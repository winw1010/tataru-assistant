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
        dragWindow: (...args) => {
            ipcRenderer.send('drag-window', ...args);
        },
        getConfig: () => {
            return ipcRenderer.sendSync('get-config');
        },
        getChatCode: () => {
            return ipcRenderer.sendSync('get-chat-code');
        },

        restartWindow: (windowName, data) => {
            ipcRenderer.send('restart-window', windowName, data);
        },

        getLanguageCode: (language, engine) => {
            return ipcRenderer.sendSync('get-language-code', language, engine);
        },
        zhConvert: (text, languageTo) => {
            return ipcRenderer.sendSync('zh-convert', text, languageTo);
        },
        googleTTS: (option) => {
            return ipcRenderer.sendSync('google-tts', option);
        },

        getPath: (...args) => {
            return ipcRenderer.sendSync('get-path', ...args);
        },
        getUserDataPath: (...args) => {
            return ipcRenderer.sendSync('get-user-data-path', ...args);
        },
        jsonReader: (filePath, returnArray) => {
            return ipcRenderer.sendSync('json-reader', filePath, returnArray);
        },
        jsonWriter: (filePath, data) => {
            return ipcRenderer.send('json-writer', filePath, data);
        },
        fileChecker: (filePath) => {
            return ipcRenderer.sendSync('file-checker', filePath);
        },
    });
}

// set IPC
function setIPC() {
    // change UI text
    ipcRenderer.on('change-ui-text', () => {
        document.dispatchEvent(new CustomEvent('change-ui-text'));
    });

    // clear dialog
    ipcRenderer.on('clear-dialog', () => {
        document.getElementById('div_dialog').innerHTML = '';
    });

    // append blank dialog
    ipcRenderer.on('append-blank-dialog', (event, id, code) => {
        document.dispatchEvent(new CustomEvent('append-blank-dialog', { detail: { id, code } }));
    });

    // update dialog
    ipcRenderer.on('update-dialog', (event, id, name, text, dialogData, translation) => {
        document.dispatchEvent(
            new CustomEvent('update-dialog', { detail: { id, name, text, dialogData, translation } })
        );
    });

    // append dialog
    ipcRenderer.on('append-dialog', (event, id, code, name, text) => {
        document.dispatchEvent(new CustomEvent('append-blank-dialog', { detail: { id, code } }));
        document.dispatchEvent(
            new CustomEvent('update-dialog', { detail: { id, name, text, dialogData: null, translation: null } })
        );
    });

    // move to bottom
    ipcRenderer.on('move-to-bottom', () => {
        document.dispatchEvent(new CustomEvent('move-to-bottom'));
    });

    // reset view
    ipcRenderer.on('reset-view', (event, config) => {
        resetView(config);
    });

    // show notification
    ipcRenderer.on('show-notification', (event, text) => {
        document.dispatchEvent(new CustomEvent('show-notification', { detail: { text } }));
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
            document.dispatchEvent(new CustomEvent('start-playing'));
        } else {
            document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_off_white_24dp.svg');
            document.dispatchEvent(new CustomEvent('stop-playing'));
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
    ipcRenderer.send('create-window', 'screenshot');
    ipcRenderer.send('start-server');
    ipcRenderer.send('initialize-json');
    ipcRenderer
        .invoke('version-check')
        .then((latestVersion) => {
            const appVersion = ipcRenderer.sendSync('get-version');

            if (appVersion === latestVersion) {
                document.getElementById('img_button_update').hidden = true;
                document.dispatchEvent(new CustomEvent('show-notification', { detail: { text: '已安裝最新版本' } }));
            } else {
                let latest = '';

                if (latestVersion?.length > 0) {
                    latest += `(Ver.${latestVersion})`;
                }

                document.getElementById('img_button_update').hidden = false;
                document.dispatchEvent(
                    new CustomEvent('show-notification', {
                        detail: {
                            text: `已有可用的更新${latest}，請點選上方的<img src="./img/ui/update_white_24dp.svg" style="width: 1.5rem; height: 1.5rem;">按鈕下載最新版本`,
                        },
                    })
                );
            }
        })
        .catch((error) => {
            console.log(error);
        });
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

    // reset dialog style
    document.dispatchEvent(new CustomEvent('reset-dialog-style'));

    // show dialog
    document.dispatchEvent(new CustomEvent('show-dialog'));

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
        document.dispatchEvent(new CustomEvent('show-dialog'));
    }
}
