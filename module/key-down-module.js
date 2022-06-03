// communicate with main process
const { ipcRenderer } = require('electron');

function onKeyDown(code) {
    if (code === 'F9') {
        ipcRenderer.send('create-window', 'read-log', null, true);
    } else if (code === 'F10') {
        ipcRenderer.send('create-window', 'config', null, true);
    } else if (code === 'F11') {
        ipcRenderer.send('create-window', 'capture', null, true);
    } else if (code === 'F12') {
        ipcRenderer.send('open-devtools');
    }
}

exports.onKeyDown = onKeyDown;