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
    if ($('#' + id).length > 0) {
        $('#' + id).empty().append('<span>......</span>');
        return;
    }

    const config = ipcRenderer.sendSync('load-config');
    const div = $('<div>')
        .prop({
            'id': id,
            'class': code
        })
        .css({
            'display': 'none',
            'color': config.channel[code],
            'font-size': config.dialog.fontSize + 'rem',
            'margin-top': $('#div_dialog div').length > 0 ? config.dialog.spacing + 'rem' : 0,
            'border-radius': config.dialog.radius + 'rem',
            'background-color': config.dialog.backgroundColor
        });

    $('#div_dialog').append(div);
}

// update dialog
function updateDialog(id, name, text, dialogData = null, translation = null) {
    // set dialog
    let dialog;

    if (name !== '') {
        dialog = $(`<span class="drop_shadow">${name}:</span><br><span class="drop_shadow">${text}</span>`);
    } else {
        dialog = $('<span>').prop('class', 'drop_shadow').text(text);
    }

    // append dialog
    $('#' + id)
        .empty()
        .append(dialog)
        .css({
            'cursor': 'pointer',
            'display': 'block'
        })
        .on('click', () => {
            const config = ipcRenderer.sendSync('load-config');

            if (config.preloadWindow.advance) {
                ipcRenderer.send('create-window', 'edit', id);
            }
        });

    // show dialog
    showDialog();

    // move to dialog
    location.href = '#' + id;

    // save dialog
    if (dialogData && translation) {
        saveLog({
            id: id,
            code: dialogData.code ? dialogData.code : '',
            player: dialogData.playerName ? dialogData.playerName : '',
            name: dialogData.name ? dialogData.name : '',
            text: dialogData.text ? dialogData.text : '',
            translated_name: name,
            translated_text: text,
            timestamp: dialogData.timestamp ? dialogData.timestamp : new Date().getTime(),
            datetime: dialogData.timestamp ? new Date(dialogData.timestamp).toLocaleString() : new Date().toLocaleString(),
            translation: translation
        });
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
        $('#' + id).fadeOut('slow', () => {
            $('#' + id).remove();
        });
    }, 3000);
}

// show dialog
function showDialog() {
    const config = ipcRenderer.sendSync('load-config');

    $('#div_dialog').prop('hidden', false);

    try {
        clearTimeout(timeoutHideDialog);
    } catch (error) {

    } finally {
        if (config.preloadWindow.hideDialog) {
            timeoutHideDialog = setTimeout(() => {
                $('#div_dialog').prop('hidden', true);
            }, config.preloadWindow.hideDialogInterval * 1000);
        }
    }
}

// save dialog
function saveLog(item) {
    const milliseconds = parseInt(item.id.slice(2));
    const fileName = createLogName(milliseconds);
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
    const date = milliseconds ? new Date(milliseconds) : new Date();
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