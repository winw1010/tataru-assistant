'use strict';

// config module
const configModule = require('./config-module');

// engine module
const engineModule = require('./engine-module');

// correction-module
const { correctionEntry } = require('../correction/correction-module');

// system channel
const systemChannel = ['0039', '0839', '0003', '0038', '003C', '0048', '001D', '001C'];

// text history
// let textHistory = {};

// last text
let lastText = '';

// data process
function dataProcess(data) {
    try {
        const config = configModule.getConfig();
        let dialogData = JSON.parse(data.toString());
        console.log('Dialog Data:', dialogData);

        // check dialog data
        if (dataCheck(dialogData)) {
            // check dialog code
            if (dialogData.text !== '' && config.channel[dialogData.code]) {
                /*
                // check history
                if (textHistory[dialogData.text] && new Date().getTime() - textHistory[dialogData.text] < 5000) {
                    return;
                } else {
                    textHistory[dialogData.text] = new Date().getTime();
                }
                */

                // check repetition
                if (dialogData.text.replaceAll('\r', '') !== lastText) {
                    lastText = dialogData.text.replaceAll('\r', '');
                } else {
                    return;
                }

                // clear id and timestamp
                dialogData.id = null;
                dialogData.timestamp = null;

                // name check
                if (dialogData.name === '...') {
                    dialogData.name = '';
                }

                // text fix
                dialogData.text = dialogData.text.replaceAll('%&', '');

                // system message fix
                if (systemChannel.includes(dialogData.code)) {
                    if (dialogData.name !== '') {
                        dialogData.text = dialogData.name + ':' + dialogData.text;
                        dialogData.name = '';
                    }
                }

                // new line fix
                if (config.translation.from === engineModule.languageEnum.ja) {
                    if (dialogData.type === 'CUTSCENE') {
                        dialogData.text = dialogData.text.replaceAll('\r', '、');
                    } else {
                        dialogData.text = dialogData.text.replaceAll('\r', '');
                    }
                } else {
                    dialogData.text = dialogData.text.replaceAll('\r', ' ');
                }

                // set translation
                dialogData.translation = config.translation;

                // start translation
                console.log('Start translation');
                correctionEntry(dialogData, config.translation);
            } else {
                console.log('Skip translation');
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// data check
function dataCheck(dialogData) {
    const names = Object.getOwnPropertyNames(dialogData);
    return names.includes('code') && names.includes('name') && names.includes('text');
}

// module exports
module.exports = {
    dataProcess,
};
