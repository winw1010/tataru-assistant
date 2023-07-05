'use strict';

// chat code module
const chatCodeModule = require('./chat-code-module');

// config module
const configModule = require('./config-module');

// file module
const fileModule = require('./file-module');

// google tts
const googleTTS = require('../translator/google-tts');

// translate module
const translateModule = require('./translate-module');

// window module
const windowModule = require('./window-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// log location
const logLocation = fileModule.getUserDataPath('log');

// dialog timeout
let hideDialogTimeout = null;

// add dialog
function addDialog(id, code) {
    windowModule.sendIndex('add-dialog', {
        id,
        code,
        innerHTML: '<span>......</span>',
        style: getStyle(code),
    });
}

// update dialog
async function updateDialog(id, name, text, dialogData = null) {
    // zh convert
    if (dialogData?.translation) {
        name = await translateModule.zhConvert(name, dialogData.translation.to);
        text = await translateModule.zhConvert(text, dialogData.translation.to);
    }

    // add dialog
    windowModule.sendIndex('add-dialog', {
        id,
        innerHTML: `<span>${name}</span>${name !== '' ? '：<br />' : ''}<span>${text}</span>`,
        style: { display: 'block' },
        scroll: true,
    });

    // show dialog
    showDialog();

    // save dialog
    if (dialogData) {
        saveLog(id, name, text, dialogData);
    }
}

// show notification
async function showNotification(text) {
    const config = configModule.getConfig();
    const timestamp = new Date().getTime();
    const id = 'id' + timestamp;
    const code = 'FFFF';

    // zh convert
    text = await translateModule.zhConvert(text, config.translation.to);

    addDialog(id, code);
    updateDialog(id, '', text).then(() => {
        // set timeout
        setTimeout(() => {
            windowModule.sendIndex('remove-dialog', id);
        }, 5000 + Math.min(text.length * 20, 5000));
    });
}

// show dialog
function showDialog() {
    clearTimeout(hideDialogTimeout);
    hideDialogTimeout = null;

    const config = configModule.getConfig();
    windowModule.sendIndex('hide-dialog', false);

    if (config.indexWindow.hideDialog) {
        hideDialogTimeout = setTimeout(() => {
            windowModule.sendIndex('hide-dialog', true);
        }, config.indexWindow.hideDialogTimeout * 1000);
    }
}

// get style
function getStyle(code = '0039') {
    const config = configModule.getConfig();
    return {
        fontWeight: config.dialog.weight,
        color: config.channel[code] || getColor(code),
        fontSize: config.dialog.fontSize + 'rem',
        marginTop: config.dialog.spacing + 'rem',
        borderRadius: config.dialog.radius + 'rem',
        backgroundColor: config.dialog.backgroundColor,
    };
}

// get color
function getColor(code) {
    const chatCode = chatCodeModule.getChatCode();
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

// save dialog
function saveLog(id, name, text, dialogData) {
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
        translation: dialogData.translation,
    };

    const filePath = fileModule.getPath(logLocation, createLogName(item.timestamp));
    let log = {};

    // read/create log file
    if (fileModule.exists(filePath)) {
        log = fileModule.read(filePath, 'json') || {};

        // fix old bug
        if (Array.isArray(log)) {
            log = {};
        }
    }

    // play audio at first time
    if (!log[item.id] && npcChannel.includes(dialogData.code) && dialogData.audioText !== '' && dialogData.translation.autoPlay) {
        const urlList = googleTTS.getAudioUrl(dialogData.audioText, dialogData.translation.from);
        windowModule.sendIndex('add-audio', urlList);
    }

    // add/replcae log
    log[item.id] = item;

    // write log file
    try {
        fileModule.write(filePath, log, 'json');
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

// module exports
module.exports = {
    addDialog,
    updateDialog,
    showNotification,
    showDialog,
    getStyle,
    createLogName,
};
