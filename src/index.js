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
        getConfig: () => {
            return ipcRenderer.sendSync('get-config');
        },
        dragWindow: (clientX, clientY, windowWidth, windowHeight) => {
            return ipcRenderer.send('drag-window', clientX, clientY, windowWidth, windowHeight);
        },
    });
}

// set IPC
function setIPC() {
    // change UI text
    ipcRenderer.on('change-ui-text', () => {
        dispatchCustomEvent('change-ui-text');
    });

    // clear dialog
    ipcRenderer.on('clear-dialog', () => {
        document.getElementById('div_dialog').innerHTML = '';
    });

    // move to bottom
    ipcRenderer.on('move-to-bottom', () => {
        moveToBottom();
    });

    // reset view
    ipcRenderer.on('reset-view', (event, config) => {
        resetView(config);
    });

    // console log
    ipcRenderer.on('console-log', (event, text) => {
        console.log(text);
    });

    // add dialog
    ipcRenderer.on('add-dialog', (event, { id = '', code = '', innerHTML = '', style = {} }) => {
        // div
        const div = document.getElementById('div_dialog');

        // dialog
        let dialog = document.getElementById(id);

        // check the dialog
        if (!dialog) {
            dialog = document.createElement('div');
            div.append(dialog);
            dialog.id = id;
            dialog.className = code;
        }

        // set the dialog
        dialog.innerHTML = innerHTML;
        setStyle(dialog, style);

        // set the first dialog
        if (div.firstElementChild) {
            document.getElementById(div.firstElementChild.id).style.marginTop = '0';
        }

        // add click listener
        if (dialog.className !== 'FFFF') {
            dialog.style.cursor = 'pointer';
            dialog.onclick = () => {
                ipcRenderer.send('restart-window', 'edit', id);
            };
        }

        // navigate to the dialog
        if (style?.display === 'block') {
            setTimeout(() => {
                location.href = '#' + id;
            }, 200);
        }
    });

    // remove dialog
    ipcRenderer.on('remove-dialog', (event, id) => {
        try {
            document.getElementById(id).remove();
        } catch (error) {
            console.log(error);
        }
    });

    // hide dialog
    ipcRenderer.on('hide-dialog', (event, isHidden) => {
        document.getElementById('div_dialog').hidden = isHidden;
    });

    // hide update button
    ipcRenderer.on('hide-update-button', (event, isHidden) => {
        document.getElementById('img_button_update').hidden = isHidden;
    });

    // add audio
    ipcRenderer.on('add-audio', (event, urlList) => {
        dispatchCustomEvent('add-to-playlist', { urlList });
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
            ipcRenderer.send('show-notification', '在不可選取的狀態下無法縮小視窗');
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
    ipcRenderer.send('version-check');
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
    resetDialogStyle();

    // show dialog
    ipcRenderer.send('show-dialog');

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

// set style
function setStyle(element, style = {}) {
    Object.keys(style).forEach((key) => {
        element.style[key] = style[key];
    });
}

// reset dialog style
function resetDialogStyle() {
    const dialogCollection = document.getElementById('div_dialog').children;

    for (let index = 0; index < dialogCollection.length; index++) {
        const dialog = document.getElementById(dialogCollection[index].id);
        const style = ipcRenderer.sendSync('get-style', dialog.className);
        setStyle(dialog, style);

        if (index === 0) {
            dialog.style.marginTop = '0';
        }
    }
}

// move to bottom
function moveToBottom() {
    setTimeout(() => {
        clearSelection();

        let div = document.getElementById('div_dialog') || document.scrollingElement || document.body;
        div.scrollTop = div.scrollHeight;
    }, 300);
}

// clear selection
function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
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
        ipcRenderer.send('show-dialog');
    }
}

// dispatch custom event
function dispatchCustomEvent(type, detail) {
    document.dispatchEvent(new CustomEvent(type, { detail }));
}
