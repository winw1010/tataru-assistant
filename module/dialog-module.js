'use strict';

// json fixer
const { readFileSync, writeFileSync } = require('fs');

// communicate with main process
const { ipcRenderer } = require('electron');

// json fixer
const jsonFixer = require('json-fixer');

// dialog timeout
let timeoutHideDialog = setTimeout(() => {}, 0);

// append blank dialog
function appendBlankDialog(id, code) {
    if (document.getElementById(id)) {
        const div = document.getElementById(id);
        div.replaceChildren();
        div.innerHTML = '<span>......</span>';
        return;
    }

    const config = ipcRenderer.sendSync('load-config');
    const div = document.createElement('div');
    div.setAttribute('id', id);
    div.setAttribute('class', code);
    div.style.display = 'none';
    div.style.color = config.channel[code];
    div.style.fontSize = config.dialog.fontSize + 'rem';
    div.style.marginTop = document.querySelectorAll('#div_dialog div').length > 0 ? config.dialog.spacing + 'rem' : 0;
    div.style.borderRadius = config.dialog.radius + 'rem';
    div.style.backgroundColor = config.dialog.backgroundColor;

    document.getElementById('div_dialog').append(div)
}

// update dialog
function updateDialog(id, name, text, dialogData = null, translation = null) {
    // set dialog
    const dialog = document.getElementById(id);

    // append dialog
    dialog.replaceChildren();
    dialog.style.cursor = 'pointer';
    dialog.style.display = 'block';
    dialog.onclick = () => {
        const config = ipcRenderer.sendSync('load-config');

        if (config.preloadWindow.advance) {
            ipcRenderer.send('create-window', 'edit', id);
        }
    }

    if (name !== '') {
        dialog.innerHTML = `<span class="drop_shadow">${name}:</span><br><span class="drop_shadow">${text}</span>`;
    } else {
        dialog.innerHTML = `<span class="drop_shadow">${text}</span>`;
    }

    // show dialog
    showDialog();

    // move to dialog
    location.href = '#' + id;

    // save dialog
    if (dialogData && translation) {
        saveLog(id, name, text, dialogData, translation);
    }
}

// append notification
function appendNotification(text) {
    const timestamp = new Date().getTime();
    const id = 'id' + timestamp;
    const code = 'FFFF';

    appendBlankDialog(id, code);
    updateDialog(id, '', text, { id: id, code: code, playerName: '', name: '', text: '', timestamp: timestamp }, {});

    // set timeout
    setTimeout(() => {
        document.getElementById(id).remove();
    }, 3000);
}

// show dialog
function showDialog() {
    const config = ipcRenderer.sendSync('load-config');
    const dialog = document.getElementById('div_dialog');

    dialog.hidden = false;

    try {
        clearTimeout(timeoutHideDialog);
    } catch (error) {
        console.log(error);
    } finally {
        if (config.preloadWindow.hideDialog) {
            timeoutHideDialog = setTimeout(() => {
                dialog.hidden = true;
            }, config.preloadWindow.hideDialogInterval * 1000);
        }
    }
}

// save dialog
function saveLog(id, name, text, dialogData, translation) {
    const item = {
        id: id,
        code: dialogData.code,
        player: dialogData.playerName,
        name: dialogData.name,
        text: dialogData.text,
        translated_name: name,
        translated_text: text,
        timestamp: dialogData.timestamp,
        datetime: new Date(dialogData.timestamp).toLocaleString(),
        translation: translation
    }

    const fileName = createLogName(item.timestamp);
    let log = {};

    try {
        log = jsonFixer(readFileSync(`./json/log/${fileName}`).toString()).data;
        log[item.id] = item;
    } catch (error) {
        console.log(error);
        log[item.id] = item;
    }

    try {
        writeFileSync(`./json/log/${fileName}`, JSON.stringify(log, null, '\t'));
    } catch (error) {
        console.error(error);
    }
}

// create log name
function createLogName(milliseconds = null) {
    const date = Number.isInteger(milliseconds) ? new Date(milliseconds) : new Date();
    let dateString = date.toLocaleDateString().split('/');

    if (dateString[1].length < 2) {
        dateString[1] = '0' + dateString[1];
    }

    if (dateString[2].length < 2) {
        dateString[2] = '0' + dateString[2];
    }

    return dateString.join('-') + '.json';
}

// move to bottom
function moveToBottom() {
    clearSelection();

    let div = (document.getElementById('div_dialog') || document.scrollingElement || document.body);
    div.scrollTop = div.scrollHeight;
}

// clear selection
function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
}

exports.appendBlankDialog = appendBlankDialog;
exports.updateDialog = updateDialog;
exports.appendNotification = appendNotification;
exports.createLogName = createLogName;
exports.showDialog = showDialog;
exports.moveToBottom = moveToBottom;