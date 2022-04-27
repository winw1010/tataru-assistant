'use strict';

// json fixer
const { readFileSync, writeFileSync } = require('fs');

// communicate with main process
const { ipcRenderer } = require('electron');

// json fixer
const jsonFixer = require('json-fixer');

// text to speech
const googleTTS = require('google-tts-api');

// language table
const { googleTable } = require('./translator/language-table');

// dialog timeout
let timeoutHideDialog = setTimeout(() => {}, 0);

// play list
let playList = [];
let isPlaying = false;

// append blank dialog
function appendBlankDialog(id, code) {
    if (document.getElementById(id)) {
        const dialog = document.getElementById(id);
        dialog.replaceChildren();
        dialog.innerHTML = '<span>......</span>';
        return;
    }

    const config = ipcRenderer.sendSync('load-config');
    const dialog = document.createElement('div');
    dialog.setAttribute('id', id);
    dialog.setAttribute('class', code);
    dialog.style.display = 'none';
    dialog.style.color = config.channel[code] ? config.channel[code] : getColor(code);
    dialog.style.fontSize = config.dialog.fontSize + 'rem';
    dialog.style.marginTop = config.dialog.spacing + 'rem';
    dialog.style.borderRadius = config.dialog.radius + 'rem';
    dialog.style.backgroundColor = config.dialog.backgroundColor;

    document.getElementById('div_dialog').append(dialog)

    try {
        document.getElementById('div_dialog').firstElementChild.style.marginTop = 0;
    } catch (error) {
        console.log(error);
    }
}

// update dialog
function updateDialog(id, name, text, dialogData = null, translation = null) {
    // set dialog
    const dialog = document.getElementById(id);

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

    // save dialog
    if (dialogData && translation) {
        saveLog(id, name, text, dialogData, translation);

        // play audio
        if (translation.autoPlay && dialogData.text != '') {
            try {
                const url = googleTTS.getAudioUrl(dialogData.text, { lang: googleTable[translation.from] });
                const audio = new Audio(url);

                audio.onended = () => {
                    isPlaying = false;
                }

                audio.currentTime = 0;
                audio.play();
            } catch (error) {
                console.log(error);
            }
        }
    }

    // move to dialog
    location.href = '#' + id;
}

function playNext() {
    try {
        const audio = playList.splice(0, 1)[0];
        audio.currentTime = 0;
        audio.play();
    } catch (error) {
        console.log(error);
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
    }, 5000);
}

// show dialog
function showDialog() {
    const config = ipcRenderer.sendSync('load-config');
    const dialog = document.getElementById('div_dialog');

    dialog.hidden = false;

    try {
        clearTimeout(timeoutHideDialog);
        timeoutHideDialog = null;
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

// get color
function getColor(code) {
    const chatCode = ipcRenderer.sendSync('load-chat-code');
    let color = '#FFFFFF';

    for (let index = 0; index < chatCode.length; index++) {
        const item = chatCode[index];

        if (code === item.ChatCode) {
            color = item.Color;
            break;
        }
    }

    return color;
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