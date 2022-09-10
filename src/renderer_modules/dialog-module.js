'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// file module
const fm = require('../main_modules/file-module');

// audio module
const { addToPlaylist } = require('./audio-module');

// engine module
const { languageEnum } = require('./engine-module');

// zh convert
const zhConverter = require('../main_modules/translator/zh-convert');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// log location
const logLocation = fm.getUserDataPath('log');

// dialog timeout
let hideDialogTimeout = null;

// append blank dialog
function appendBlankDialog(id, code) {
    if (document.getElementById(id)) {
        const dialog = document.getElementById(id);
        dialog.innerHTML = '<span>......</span>';
        return;
    }

    const dialog = document.createElement('div');
    dialog.setAttribute('id', id);
    dialog.setAttribute('class', code);
    dialog.style.display = 'none';
    setStyle(dialog);
    document.getElementById('div_dialog').append(dialog);

    if (document.querySelectorAll('#div_dialog div').length > 0) {
        document.getElementById(document.getElementById('div_dialog').firstElementChild.id).style.marginTop = '0';
    }
}

// update dialog
function updateDialog(id, name, text, dialogData = null, translation = null) {
    // zh convert
    if (translation) {
        name = zhConvert(name, translation.to);
        text = zhConvert(text, translation.to);
    }

    // set dialog
    const dialog = document.getElementById(id);
    dialog.style.display = 'block';

    if (dialog.className !== 'FFFF') {
        dialog.style.cursor = 'pointer';
        dialog.onclick = () => {
            const config = ipcRenderer.sendSync('get-config');

            if (config.indexWindow.advance) {
                ipcRenderer.send('create-window', 'edit', id);
            }
        };
    }

    dialog.innerHTML = `<span class="drop_shadow">${name !== '' ? name + ':<br>' : ''}${text}</span>`;

    // show dialog
    showDialog();

    if (dialogData && translation) {
        // save dialog
        saveLog(id, name, text, dialogData, translation);
    }

    // move to dialog
    location.href = '#' + id;
}

// append notification
function appendNotification(text) {
    const config = ipcRenderer.sendSync('get-config');
    const timestamp = new Date().getTime();
    const id = 'id' + timestamp;
    const code = 'FFFF';

    // zh convert
    text = zhConvert(text, config.translation.to);

    appendBlankDialog(id, code);
    updateDialog(id, '', text);

    // set timeout
    setTimeout(() => {
        try {
            document.getElementById(id).remove();
        } catch (error) {
            console.log(error);
        }
    }, 5000 + Math.floor(text.length / 20));
}

// show dialog
function showDialog() {
    clearTimeout(hideDialogTimeout);
    hideDialogTimeout = null;

    const config = ipcRenderer.sendSync('get-config');
    const dialog = document.getElementById('div_dialog');
    dialog.hidden = false;

    if (config.indexWindow.hideDialog) {
        hideDialogTimeout = setTimeout(() => {
            dialog.hidden = true;
        }, config.indexWindow.hideDialogTimeout * 1000);
    }
}

// set style
function setStyle(dialog) {
    const config = ipcRenderer.sendSync('get-config');

    dialog.style.fontWeight = config.dialog.weight;
    dialog.style.color = config.channel[dialog.className]
        ? config.channel[dialog.className]
        : getColor(dialog.className);
    dialog.style.fontSize = config.dialog.fontSize + 'rem';
    dialog.style.marginTop = config.dialog.spacing + 'rem';
    dialog.style.borderRadius = config.dialog.radius + 'rem';
    dialog.style.backgroundColor = config.dialog.backgroundColor;
}

// get color
function getColor(code) {
    const chatCode = ipcRenderer.sendSync('get-chat-code');
    let color = '#FFFFFF';

    for (let index = 0; index < chatCode.length; index++) {
        const element = chatCode[index];

        if (code === element.ChatCode) {
            color = element.Color;
            break;
        }
    }

    return color;
}

// zh convert
function zhConvert(text, languageTo) {
    if (languageTo === languageEnum.zht) {
        return zhConverter.exec({ text: text, tableName: 'zh2Hant' });
    } else if (languageTo === languageEnum.zhs) {
        return zhConverter.exec({ text: text, tableName: 'zh2Hans' });
    } else {
        return text;
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
        audio_text: dialogData.audioText,
        translated_name: name,
        translated_text: text,
        timestamp: dialogData.timestamp,
        datetime: new Date(dialogData.timestamp).toLocaleString(),
        translation: translation,
    };

    const filePath = fm.getPath(logLocation, createLogName(item.timestamp));
    let log = null;

    // read/create log file
    try {
        log = fm.jsonReader(filePath, false);

        // fix old bug
        if (Array.isArray(log)) {
            throw null;
        }
    } catch (error) {
        console.log(error);
        log = {};
    }

    // play audio at first time
    if (!log[item.id]) {
        if (npcChannel.includes(dialogData.code)) {
            addToPlaylist(dialogData.audioText, translation);
        }
    }

    // add/replcae log
    log[item.id] = item;

    // write log file
    try {
        fm.jsonWriter(filePath, log);
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

    let div = document.getElementById('div_dialog') || document.scrollingElement || document.body;
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

// exports
module.exports = {
    appendBlankDialog,
    updateDialog,
    appendNotification,
    setStyle,
    createLogName,
    showDialog,
    moveToBottom,
};
