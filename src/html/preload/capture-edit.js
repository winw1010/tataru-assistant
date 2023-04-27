'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

// image path
const imagePath = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'img');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setContextBridge();
    setIPC();

    setView();
    setEvent();
    setButton();
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
        document.dispatchEvent(new CustomEvent('change-ui-text'));
    });

    // send data
    ipcRenderer.on('send-data', (event, text) => {
        document.getElementById('textarea_screen_text').value = text;
    });
}

// set view
function setView() {
    const config = ipcRenderer.sendSync('get-config');
    document.getElementById('checkbox_split').checked = config.captureWindow.split;
    document.getElementById('img_captured').setAttribute('src', ipcRenderer.sendSync('get-path', imagePath, 'crop.png'));
}

// set event
function setEvent() {
    // checkbox
    document.getElementById('checkbox_split').oninput = () => {
        let config = ipcRenderer.sendSync('get-config');
        config.captureWindow.split = document.getElementById('checkbox_split').checked;
        ipcRenderer.send('set-config', config);
    };
}

// set button
function setButton() {
    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };

    // page
    document.getElementsByName('btnradio').forEach((btnradio) => {
        btnradio.onclick = () => {
            document.querySelectorAll('.div_page').forEach((page) => {
                document.getElementById(page.id).hidden = true;
            });
            document.getElementById(btnradio.value).hidden = false;
        };
    });

    // translate
    document.getElementById('button_translate').onclick = () => {
        ipcRenderer.send('translate-image-text', document.getElementById('textarea_screen_text').value);
    };
}
