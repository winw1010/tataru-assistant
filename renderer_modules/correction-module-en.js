'use strict';

// ipc
const { ipcRenderer } = require('electron');

// language table
const { languageEnum, languageIndex } = require('./engine-module');

// correction function
const cfen = require('./correction-function-en');
const cf = require('./correction-function');

// translator module
const tm = require('./translate-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// temp location
const tempLocation = process.env.USERPROFILE + '\\Documents\\Tataru Helper Node\\temp';

// correction queue
let correctionQueueItems = [];
let correctionQueueInterval = null;

// document
let chArray = {
    // force replace
    overwrite: [],

    // after
    afterTranslation: [],

    // replace
    main: [],

    // player
    player: [],

    // temp
    chTemp: [],

    // combine
    combine: [],
}

let enArray = {
    // ignore
    ignore: [],

    // en => en
    en1: [],
    en2: [],
};

function loadJSON(languageTo) {
    // clear queue interval
    clearInterval(correctionQueueInterval);
    correctionQueueInterval = null;

    const sub0 = languageIndex[languageEnum.en];
    const sub1 = languageIndex[languageTo];
    const chineseDirectory = sub1 === languageIndex[languageEnum.zht] ? 'text/cht' : 'text/chs';
    const englishDirectory = 'text/en';

    // ch array
    chArray.overwrite = cf.combineArrayWithTemp(cf.readJSON(tempLocation, 'overwriteTemp.json'), cf.readJSONOverwrite(chineseDirectory, 'overwriteEN'));
    chArray.afterTranslation = cf.readJSON(chineseDirectory, 'afterTranslation.json');

    chArray.main = cf.readJSONMain(sub0, sub1);
    chArray.player = cf.readJSON(tempLocation, 'player.json');
    chArray.chTemp = cf.readJSON(tempLocation, 'chTemp.json');

    // combine
    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // en array
    enArray.ignore = cf.readJSON(englishDirectory, 'ignore.json');
    enArray.en1 = cf.readJSON(englishDirectory, 'en1.json');
    enArray.en2 = cf.readJSON(englishDirectory, 'en2.json');

    // start/restart queue interval
    correctionQueueInterval = setInterval(() => {
        try {
            const item = correctionQueueItems.shift();

            if (item) {
                startCorrection(item.dialogData, item.translation, item.tryCount);
            }
        } catch (error) {
            console.log(error);
        }
    }, 1000);
}

function addToCorrectionQueue(dialogData, translation, tryCount = 0) {
    correctionQueueItems.push({
        dialogData: dialogData,
        translation: translation,
        tryCount: tryCount
    });
}

async function startCorrection(dialogData, translation, tryCount) {
    // skip check
    if (translation.skip && cf.skipCheck(dialogData.code, dialogData.name, dialogData.text, enArray.ignore)) {
        return;
    }

    // check try count
    if (tryCount > 5) {
        ipcRenderer.send('send-index', 'update-dialog', dialogData.id, '', '翻譯失敗，請更換翻譯引擎', dialogData, translation);
        return;
    } else {
        tryCount++;
    }

    // append blank dialog
    ipcRenderer.send('send-index', 'append-blank-dialog', dialogData.id, dialogData.code);

    // save player name
    savePlayerName(dialogData.playerName);

    // name translation
    let translatedName = '';
    if (npcChannel.includes(dialogData.code)) {
        if (translation.fix) {
            translatedName = await nameCorrection(dialogData.name, translation);
        } else {
            translatedName = await tm.translate(dialogData.name, translation);
        }
    } else {
        translatedName = dialogData.name;
    }

    // text translation
    let translatedText = '';
    if (translation.fix) {
        translatedText = await textCorrection(dialogData.name, dialogData.text, translation);
    } else {
        translatedText = await tm.translate(dialogData.text, translation);
    }

    // text check
    if (dialogData.text !== '' && translatedText === '') {
        addToCorrectionQueue(dialogData, translation, tryCount);
        return;
    }

    // set audio text
    dialogData.audioText = dialogData.text;

    // update dialog
    ipcRenderer.send('send-index', 'update-dialog', dialogData.id, translatedName, translatedText, dialogData, translation);
}

function savePlayerName(playerName) {
    if (playerName !== '' && playerName.includes(' ')) {
        if (!chArray.player.length > 0 || chArray.player[0][0] !== playerName) {
            const firstName = playerName.split(' ')[0];
            const lastName = playerName.split(' ')[1];

            chArray.player = [
                [playerName, playerName],
                [firstName, firstName],
                [lastName, lastName]
            ];

            // set combine
            chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

            // write
            cf.writeJSON(tempLocation, 'player.json', chArray.player);
        }
    }
}

async function nameCorrection(name, translation) {
    if (name === '') {
        return '';
    }

    // same check
    const target = cf.sameAsArrayItem(name, chArray.combine);
    if (target) {
        return target[0][1];
    } else {
        // code
        const codeResult = cfen.replaceTextByCode(name, chArray.combine);

        // translate name
        let translatedName = '';
        translatedName = codeResult.text;

        // skip check
        if (!cfen.canSkipTranslation(translatedName, codeResult.table)) {
            // translate
            translatedName = await tm.translate(translatedName, translation, codeResult.table);
        }

        // clear code
        translatedName = cf.clearCode(translatedName, codeResult.table);

        // mark fix
        translatedName = cf.markFix(translatedName, true);

        // table
        translatedName = cf.replaceText(translatedName, codeResult.table);

        // save to temp
        saveName(name, translatedName);

        return translatedName;
    }
}

async function textCorrection(name, text, translation) {
    if (text === '') {
        return;
    }

    // text temp
    const originalText = text;

    // force overwrite
    const target = cf.sameAsArrayItem(text, chArray.overwrite);
    if (target) {
        return cf.replaceText(target[0][1], chArray.combine);
    } else {
        // mark fix
        text = cf.markFix(text);

        // en1
        text = cf.replaceText(text, enArray.en1);

        // combine
        const codeResult = cfen.replaceTextByCode(text, chArray.combine);
        text = codeResult.text;

        // en2
        text = cf.replaceText(text, enArray.en2);

        // value fix before
        const valueResult = cf.valueFixBefore(text);
        text = valueResult.text;

        // skip check
        if (!cfen.canSkipTranslation(text, codeResult.table)) {
            // translate
            text = await tm.translate(text, translation, codeResult.table);
        }

        // value fix after
        text = cf.valueFixAfter(text, valueResult.table);

        // clear code
        text = cf.clearCode(text, codeResult.table);

        // gender fix
        text = cfen.genderFix(originalText, text);

        // after translation
        text = cf.replaceText(text, chArray.afterTranslation);

        // mark fix
        text = cf.markFix(text, true);

        // table
        text = cf.replaceText(text, codeResult.table);

        return text;
    }
}

function saveName(name = '', translatedName = '') {
    if (name === translatedName) {
        return;
    }

    chArray.chTemp = cf.readJSONPure(tempLocation, 'chTemp.json');

    if (name.length < 3) {
        chArray.chTemp.push([name + '#', translatedName, 'temp']);
    } else {
        chArray.chTemp.push([name, translatedName, 'temp']);
    }

    // set combine
    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // write
    cf.writeJSON(tempLocation, 'chTemp.json', chArray.chTemp);
}

exports.loadJSON_EN = loadJSON;
exports.addToCorrectionQueue_EN = addToCorrectionQueue;