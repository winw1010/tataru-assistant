'use strict';

// language table
const { languageTable, languageIndex, getTableValue } = require('./translator/language-table');

// correction function
const cfen = require('./correction-function-en');
const cf = require('./correction-function');

// dialog module
const { appendBlankDialog, updateDialog } = require('./dialog-module');

// correction queue
let correctionQueueItems = [];
let correctionQueueInterval = null;

// document
let chArray = {
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
};

function loadJSON(language) {
    // clear queue interval
    try {
        clearInterval(correctionQueueInterval);
        correctionQueueInterval = null;
    } catch (error) {
        console.log(error);
    }

    const sub0 = getTableValue(languageTable.en, languageIndex);
    const sub1 = getTableValue(language, languageIndex);
    const ch = sub1 === 2 ? 'text/cht' : 'text/chs';
    const en = 'text/en';

    // ch array
    chArray.afterTranslation = cf.readJSON(ch, 'afterTranslation.json');

    chArray.main = cf.readJSONMain(sub0, sub1);
    chArray.player = cf.readJSON('text_temp', 'player.json');
    chArray.chTemp = cf.readJSON('text_temp', 'chTemp.json', true, 0, 1);

    // combine
    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // en array
    enArray.ignore = cf.readJSON(en, 'ignore.json');

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
        updateDialog(dialogData.id, '', '翻譯失敗，請改用其他翻譯引擎', dialogData, translation);
        return;
    } else {
        tryCount++;
    }

    // append blank dialog
    appendBlankDialog(dialogData.id, dialogData.code);

    // save player name
    savePlayerName(dialogData.playerName);

    // name translation
    let translatedName = '';
    if (translation.fix) {
        translatedName = await nameCorrection(dialogData.name, translation);
    } else {
        translatedName = await cf.translate(dialogData.name, translation);
    }

    // text translation
    let translatedText = '';
    if (translation.fix) {
        translatedText = await textCorrection(dialogData.name, dialogData.text, translation);
    } else {
        translatedText = await cf.translate(dialogData.text, translation);
    }

    // text check
    if (dialogData.text !== '' && translatedText === '') {
        addToCorrectionQueue(dialogData, translation, tryCount);
        return;
    }

    // update dialog
    updateDialog(dialogData.id, translatedName, translatedText, dialogData, translation);
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
            cf.writeJSON('text_temp', 'player.json', chArray.player);
        }
    }
}

async function nameCorrection(name, translation) {
    if (name === '') {
        return '';
    }

    // get combine
    const combine = chArray.combine;

    // same check
    const targetIndex = cf.sameAsArrayItem(name, combine);
    if (targetIndex >= 0) {
        return combine[targetIndex][1];
    } else {
        // code
        const result = cfen.replaceTextByCode(name, combine);

        // translate name
        let outputName = '';
        outputName = result.text;

        // skip check
        if (!cfen.canSkipTranslation(outputName, result.table)) {
            // translate
            outputName = await cf.translate(outputName, translation);
        }

        // clear code
        outputName = cf.clearCode(outputName, result.table);

        // table
        outputName = cfen.replaceText(outputName, result.table);

        // mark fix
        outputName = cf.markFix(outputName);

        // save to temp
        chArray.chTemp = cf.readJSONPure('text_temp', 'chTemp.json');

        if (name.length < 3) {
            chArray.chTemp.push([name + '#', outputName, 'npc']);
        } else {
            chArray.chTemp.push([name, outputName, 'npc']);
        }

        // set combine
        chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

        // write
        cf.writeJSON('text_temp', 'chTemp.json', chArray.chTemp);

        return outputName;
    }
}

async function textCorrection(name, text, translation) {
    if (text === '') {
        return;
    }

    // text temp
    const originalText = text;

    // special fix
    text = specialTextFix(name, text);

    // combine
    const result = cfen.replaceTextByCode(text, chArray.combine);
    text = result.text;

    // skip check
    if (!cfen.canSkipTranslation(text, result.table)) {
        // translate
        text = await cf.translate(text, translation);
    }

    // clear code
    text = cf.clearCode(text, result.table);

    // table
    text = cfen.replaceText(text, result.table);

    // gender fix
    text = cfen.genderFix(originalText, text);

    // after translation
    text = cfen.replaceText(text, chArray.afterTranslation);

    // mark fix
    text = cf.markFix(text);

    return text;
}

// special text fix
function specialTextFix(name, text) {
    // mark fix
    text = cf.markFix(text);

    return text;
}

exports.loadJSON_EN = loadJSON;
exports.addToCorrectionQueue_EN = addToCorrectionQueue;