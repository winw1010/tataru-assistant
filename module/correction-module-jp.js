'use strict';

// language table
const { languageTable, languageIndex, getTableValue } = require('./translator/language-table');

// correction function
const cfjp = require('./correction-function-jp');
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

    // kana name
    chName: [],

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

let jpArray = {
    // ignore
    ignore: [],

    // jp => jp
    subtitle: [],
    jp1: [],
    jp2: [],

    // temp
    jpTemp: [],

    // jp char
    kana: [],

    // jp list
    listHira: [],
    listCrystalium: [],
};

function loadJSON(language) {
    // clear queue interval
    try {
        clearInterval(correctionQueueInterval);
        correctionQueueInterval = null;
    } catch (error) {
        console.log(error);
    }

    const sub0 = getTableValue(languageTable.ja, languageIndex);
    const sub1 = getTableValue(language, languageIndex);
    const ch = sub1 === 2 ? 'text/cht' : 'text/chs';
    const jp = 'text/jp';

    // ch array
    chArray.overwrite = cf.combineArrayWithTemp(cf.readJSON('text_temp', 'overwriteTemp.json'), cf.readJSONOverwrite(ch));

    chArray.chName = cf.readJSON(ch, 'chName.json');
    chArray.afterTranslation = cf.readJSON(ch, 'afterTranslation.json');

    chArray.main = cf.readJSONMain(sub0, sub1);
    chArray.player = cf.readJSON('text_temp', 'player.json');
    chArray.chTemp = cf.readJSON('text_temp', 'chTemp.json', true, 0, 1);

    // combine
    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // jp array
    jpArray.ignore = cf.readJSON(jp, 'ignore.json');
    jpArray.subtitle = cf.combineArrayWithTemp(cf.readJSON('text_temp', 'jpTemp.json'), cf.readJSONSubtitle());
    jpArray.jp1 = cf.readJSON(jp, 'jp1.json');
    jpArray.jp2 = cf.readJSON(jp, 'jp2.json');

    jpArray.kana = cf.readJSON(jp, 'kana.json');
    jpArray.listHira = cf.readJSON(jp, 'listHira.json');
    jpArray.listCrystalium = cf.readJSON(jp, 'listCrystalium.json');

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
    if (translation.skip && cf.skipCheck(dialogData.code, dialogData.name, dialogData.text, jpArray.ignore)) {
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

            // combine
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
    if (cf.sameAsArrayItem(name, chArray.combine)) {
        return cfjp.replaceText(name, chArray.combine);
    } else if (cf.sameAsArrayItem(name + '#', chArray.combine)) {
        // 2 word name
        return cfjp.replaceText(name + '#', chArray.combine);
    } else {
        let outputName = '';

        if (isAllKata('', name)) {
            // all kata => use chName
            outputName = cfjp.replaceText(name, chArray.chName);
        } else {
            // not all kata => use standard
            // code
            const result = cfjp.replaceTextByCode(name, chArray.combine);

            // translate name
            outputName = result.text;

            // skip check
            if (!cfjp.canSkipTranslation(outputName)) {
                // translate
                outputName = await cf.translate(outputName, translation);
            }

            // clear code
            outputName = cf.clearCode(outputName, result.table);

            // table
            outputName = cfjp.replaceText(outputName, result.table);

            // mark fix
            outputName = cf.markFix(outputName);
        }

        // save to temp
        chArray.chTemp = cf.readJSONPure('text_temp', 'chTemp.json');

        if (outputName.length < 3) {
            chArray.chTemp.push([name + '#', outputName, 'npc']);
        } else {
            chArray.chTemp.push([name, outputName, 'npc']);
        }

        // combine
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

    // original text
    const originalText = text;

    // force overwrite
    if (cf.sameAsArrayItem(text, chArray.overwrite)) {
        return cfjp.replaceText(text, chArray.overwrite);
    } else {
        // subtitle
        text = cfjp.replaceText(text, jpArray.subtitle);

        // check kata
        const allKata = isAllKata(name, text);

        // special fix
        text = specialTextFix(name, text);

        // jp1
        text = cfjp.replaceText(text, jpArray.jp1);

        // combine
        const result = cfjp.replaceTextByCode(text, chArray.combine);
        text = result.text;

        // jp2
        text = cfjp.replaceText(text, jpArray.jp2);

        // to hira
        if (allKata) {
            text = cfjp.replaceText(text, jpArray.kana, 1, 0);
        }

        // skip check
        if (!cfjp.canSkipTranslation(text)) {
            // translate
            text = await cf.translate(text, translation);
        }

        // clear code
        text = cf.clearCode(text, result.table);

        // table
        text = cfjp.replaceText(text, result.table);

        // gender fix
        text = cfjp.genderFix(originalText, text);

        // after translation
        text = cfjp.replaceText(text, chArray.afterTranslation);

        // mark fix
        text = cf.markFix(text);

        return text;
    }
}

// special text fix
function specialTextFix(name, text) {
    // mark fix
    text = cf.markFix(text);

    // コボルド族
    if (/コボルド|\d{1,3}.*・.*|(?<![ァ-ヺ]).{1}・.{1}(?![ァ-ヺ])/gi.test(name) && !name.includes('マメット')) {
        text = text.replaceAll('ー', '');
    }

    // マムージャ族 & 強化グリーンワート
    if (/マムージャ|ージャジャ$|ージャ$|強化グリーンワート/gi.test(name)) {
        text = text.replaceAll('、', '');
    }

    // バヌバヌ族
    if (/ヌバ|バヌ|ズンド|ブンド|グンド/gi.test(name)) {
        // 長老さま、長老さま！
        // ぬおおおおおん！まただ、まただ、浮島が食べられたね！
        text = text.replaceAll(/(.{3,}?)、\1/gi, '$1');
    }

    // 核修正
    if (text.includes('核')) {
        text = text.replaceAll(/心核|中核|内核|核(?!心)/gi, '核心');
    }

    // 水晶公判斷
    if (text.includes('公') && cf.includesArrayItem(name, jpArray.listCrystalium)) {
        text = text
            .replaceAll(/(?<!水晶|貴)公(?!開|的|然|共|衆|民|園|安|界|家|営|印|暇|課|会|海|宴|害|刊|館|器|儀|議|企|義|案|益|演|稲)/gi, '水晶公');
    }

    // 若判斷
    if (/ユウギリ|ゴウセツ/gi.test(name)) {
        text = text.replaceAll('若', '主人');
    }

    // 召喚士
    if (/ヤ・ミトラ|プリンキピア/gi.test(name)) {
        text = text.replaceAll('サリ', 'サリ*');
    }

    // 暗黒騎士
    if (/フレイ|シドゥルグ|リエル/gi.test(name)) {
        text = text.replaceAll('ミスト', 'ミスト*');
    }

    return text;
}

// kata check
function isAllKata(name, text) {
    if (cf.includesArrayItem(name, jpArray.listHira)) {
        return true;
    }

    return !/[ぁ-ゖ]/gi.test(text);
}

exports.loadJSON_JP = loadJSON;
exports.addToCorrectionQueue_JP = addToCorrectionQueue;