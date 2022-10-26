'use strict';
/* eslint-disable */

// ipcRenderer.send
function ipcRendererSend(channel, ...args) {
    window?.myAPI?.ipcRendererSend(channel, ...args);
}

// ipcRenderer.sendSync
function ipcRendererSendSync(channel, ...args) {
    return window?.myAPI?.ipcRendererSendSync(channel, ...args);
}

// ipcRenderer.invoke
function ipcRendererInvoke(channel, ...args) {
    return window?.myAPI?.ipcRendererInvoke(channel, ...args);
}

// on document ready
function onDocumentReady(callback = () => {}) {
    document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
            callback();
        }
    });
}
