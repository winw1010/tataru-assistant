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

function loadJSON(language) {
    // clear queue interval
    clearInterval(correctionQueueInterval);
    correctionQueueInterval = null;

    const sub0 = getTableValue(languageTable.en, languageIndex);
    const sub1 = getTableValue(language, languageIndex);
    const chineseDirectory = sub1 === 2 ? 'text/cht' : 'text/chs';
    const englishDirectory = 'text/en';

    // ch array
    chArray.overwrite = cf.combineArrayWithTemp(cf.readJSON('text_temp', 'overwriteTemp.json'), cf.readJSONOverwrite(chineseDirectory, 'overwriteEN'));
    chArray.afterTranslation = cf.readJSON(chineseDirectory, 'afterTranslation.json');

    chArray.main = cf.readJSONMain(sub0, sub1);
    chArray.player = cf.readJSON('text_temp', 'player.json');
    chArray.chTemp = cf.readJSON('text_temp', 'chTemp.json', true, 0, 1);

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
            translatedName = await cf.translate(translatedName, translation);
        }

        // clear code
        translatedName = cf.clearCode(translatedName, codeResult.table);

        // mark fix
        translatedName = cf.markFix(translatedName, true);

        // table
        translatedName = cf.replaceText(translatedName, codeResult.table);

        // save to temp
        chArray.chTemp = cf.readJSONPure('text_temp', 'chTemp.json');

        if (name.length < 3) {
            chArray.chTemp.push([name + '#', translatedName, 'npc']);
        } else {
            chArray.chTemp.push([name, translatedName, 'npc']);
        }

        // set combine
        chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

        // write
        cf.writeJSON('text_temp', 'chTemp.json', chArray.chTemp);

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
        return target[0][1];
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
            text = await cf.translate(text, translation);
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

exports.loadJSON_EN = loadJSON;
exports.addToCorrectionQueue_EN = addToCorrectionQueue;