'use strict';

// language table
const { languageEnum, languageIndex } = require('../system/engine-module');

// correction function
const cfjp = require('./correction-function-jp');
const cf = require('./correction-function');

// translator module
const tm = require('../system/translate-module');

// dialog module
const dialogModule = require('../system/dialog-module');

// file module
const fileModule = require('../system/file-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// temp path
const tempPath = fileModule.getUserDataPath('temp');

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
};

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
    listReverse: [],
    listCrystalium: [],
};

function loadJSON(languageTo) {
    // clear queue interval
    clearInterval(correctionQueueInterval);
    correctionQueueInterval = null;

    const sub0 = languageIndex[languageEnum.ja];
    const sub1 = languageIndex[languageTo];
    const chineseDirectory = sub1 === languageIndex[languageEnum.zht] ? 'text/cht' : 'text/chs';
    const japaneseDirectory = 'text/jp';

    // ch array
    chArray.overwrite = cf.combineArrayWithTemp(cf.readJSON(tempPath, 'overwriteTemp.json'), cf.readJSONOverwrite(chineseDirectory, 'overwriteJP'));
    chArray.chName = cf.readJSON(chineseDirectory, 'chName.json');
    chArray.afterTranslation = cf.readJSON(chineseDirectory, 'afterTranslation.json');

    chArray.main = cf.readJSONMain(sub0, sub1);
    chArray.player = cf.readJSON(tempPath, 'player.json');
    chArray.chTemp = cf.readJSON(tempPath, 'chTemp.json');

    // combine
    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // jp array
    jpArray.ignore = cf.readJSON(japaneseDirectory, 'ignore.json');
    jpArray.subtitle = cf.combineArrayWithTemp(cf.readJSON(tempPath, 'jpTemp.json'), cf.readJSONSubtitle());
    jpArray.jp1 = cf.readJSON(japaneseDirectory, 'jp1.json');
    jpArray.jp2 = cf.readJSON(japaneseDirectory, 'jp2.json');

    jpArray.kana = cf.readJSON(japaneseDirectory, 'kana.json');
    jpArray.listHira = cf.readJSON(japaneseDirectory, 'listHira.json');
    jpArray.listReverse = cf.readJSON(japaneseDirectory, 'listReverse.json');
    jpArray.listCrystalium = cf.readJSON(japaneseDirectory, 'listCrystalium.json');

    // start/restart queue interval
    correctionQueueInterval = setInterval(() => {
        const item = correctionQueueItems.shift();

        if (item) {
            startCorrection(item.dialogData, item.translation);
        }
    }, 1000);
}

function addToCorrectionQueue(dialogData, translation) {
    correctionQueueItems.push({
        dialogData: dialogData,
        translation: translation,
    });
}

async function startCorrection(dialogData, translation) {
    try {
        // skip check
        if (translation.skip && cf.skipCheck(dialogData.code, dialogData.name, dialogData.text, jpArray.ignore)) {
            return;
        }

        // set id and timestamp
        if (!dialogData.id) {
            const timestamp = new Date().getTime();
            dialogData.id = 'id' + timestamp;
            dialogData.timestamp = timestamp;
        }

        // add dialog
        dialogModule.addDialog(dialogData.id, dialogData.code);

        // name translation
        let translatedName = '';
        if (cfjp.isChinese(dialogData.name, translation)) {
            translatedName = cf.replaceText(dialogData.name, chArray.combine);
        } else {
            if (npcChannel.includes(dialogData.code)) {
                if (translation.fix) {
                    translatedName = await nameCorrection(dialogData.name, translation);
                } else {
                    translatedName = await tm.translate(dialogData.name, translation);
                }
            } else {
                translatedName = dialogData.name;
            }
        }

        // text translation
        let translatedText = '';
        if (cfjp.isChinese(dialogData.text, translation)) {
            translatedText = cf.replaceText(dialogData.text, chArray.combine);
        } else {
            if (translation.fix) {
                translatedText = await textCorrection(dialogData.name, dialogData.text, translation);
            } else {
                translatedText = await tm.translate(dialogData.text, translation);
            }
        }

        // set audio text
        if (cf.includesArrayItem(dialogData.name, jpArray.listReverse)) {
            // reverse kana
            dialogData.audioText = cfjp.reverseKana(dialogData.text);
        } else if (allKataCheck(dialogData.name, dialogData.text)) {
            // convert to hira
            dialogData.audioText = cfjp.convertKana(dialogData.text, 'hira');
        } else {
            dialogData.audioText = dialogData.text;
        }

        // update dialog
        dialogModule.updateDialog(dialogData.id, translatedName, translatedText, dialogData, translation);
    } catch (error) {
        console.log(error);
        dialogModule.updateDialog(dialogData.id, 'Error', error, dialogData, translation);
    }
}

async function nameCorrection(name, translation) {
    if (name === '') {
        return '';
    }

    // same check
    const target1 = cf.sameAsArrayItem(name, chArray.combine);
    const target2 = cf.sameAsArrayItem(name + '#', chArray.combine);
    if (target1) {
        return target1[0][1];
    } else if (target2) {
        return target2[0][1].replaceAll('#', '');
    } else {
        const translatedName = translateName(name, getKatakanaName(name), translation);
        return translatedName;
    }
}

async function textCorrection(name, text, translation) {
    if (text === '') {
        return;
    }

    // force overwrite
    const target = cf.sameAsArrayItem(text, chArray.overwrite);
    if (target) {
        return cf.replaceText(target[0][1], chArray.combine);
    } else {
        // subtitle
        text = cf.replaceText(text, jpArray.subtitle);

        // check kana type
        let isAllKata = false;
        if (cf.includesArrayItem(name, jpArray.listReverse)) {
            // reverse kana
            console.log('reverse');
            text = cfjp.reverseKana(text);
        } else {
            // all kata check
            isAllKata = allKataCheck(name, text);
        }

        // special fix
        text = specialTextFix(name, text);

        // mark fix
        text = cf.markFix(text);

        // jp1
        text = cf.replaceText(text, jpArray.jp1);

        // combine
        const codeResult = cfjp.replaceTextByCode(text, chArray.combine);
        text = codeResult.text;

        // jp2
        text = cf.replaceText(text, jpArray.jp2);

        // convert to hira
        if (isAllKata) {
            text = cfjp.convertKana(text, 'hira');
        }

        // value fix before
        const valueResult = cf.valueFixBefore(text);
        text = valueResult.text;

        // skip check
        if (!cfjp.canSkipTranslation(text)) {
            // translate
            text = await tm.translate(text, translation, codeResult.table);
        }

        // clear code
        text = cf.clearCode(text, codeResult.table);

        // after translation
        text = cf.replaceText(text, chArray.afterTranslation);

        // mark fix
        text = cf.markFix(text, true);

        // value fix after
        text = cf.valueFixAfter(text, valueResult.table);

        // table
        text = cf.replaceText(text, codeResult.table);

        return text;
    }
}

// get katakana name
function getKatakanaName(name = '') {
    if (/^([ァ-ヺ・ー＝]+)([^ァ-ヺ・ー＝]+)？*$/gi.test(name)) {
        // katakana + not katakana
        return name.replaceAll(/^([ァ-ヺ・ー＝]+)([^ァ-ヺ・ー＝]+)？*$/gi, '$1');
    } else if (/^([^ァ-ヺ・ー＝]+)([ァ-ヺ・ー＝]+)？*$/gi.test(name)) {
        // not katakana + katakana
        return name.replaceAll(/^([^ァ-ヺ・ー＝]+)([ァ-ヺ・ー＝]+)？*$/gi, '$2');
    } else if (/^([ァ-ヺ・ー＝]+)？*$/gi.test(name)) {
        // all katakana
        return name;
    } else {
        // other
        return '';
    }
}

// translate name
async function translateName(name, katakanaName, translation) {
    // same check
    const sameKatakanaName1 = cf.sameAsArrayItem(katakanaName, chArray.combine);
    const sameKatakanaName2 = cf.sameAsArrayItem(katakanaName + '#', chArray.combine);

    // translate katakana name
    const translatedKatakanaName = sameKatakanaName1 ? sameKatakanaName1[0][1] : sameKatakanaName2 ? sameKatakanaName2[0][1] : createName(katakanaName);

    if (name === katakanaName) {
        // all katakana => use translatedKatakanaName

        // save name
        saveName(name, translatedKatakanaName);

        // return translatedKatakanaName
        return translatedKatakanaName;
    } else {
        // not all katakana => use standard

        // translated name
        let translatedName = '';

        // code
        const codeResult =
            katakanaName !== '' ? cfjp.replaceTextByCode(name, cf.combineArray(chArray.combine, [[katakanaName, translatedKatakanaName]])) : cfjp.replaceTextByCode(name, chArray.combine);

        // translate name
        translatedName = codeResult.text;

        // skip check
        if (!cfjp.canSkipTranslation(translatedName)) {
            // translate
            translatedName = await tm.translate(translatedName, translation, codeResult.table);
        }

        // clear code
        translatedName = cf.clearCode(translatedName, codeResult.table);

        // mark fix
        translatedName = cf.markFix(translatedName, true);

        // table
        translatedName = cf.replaceText(translatedName, codeResult.table);

        // save name
        saveName(name, translatedName, katakanaName, translatedKatakanaName);

        return translatedName;
    }
}

// create name
function createName(katakanaName) {
    let tempName = cf.replaceText(katakanaName, chArray.combine);
    tempName = tempName.replace(/^ルル/, '路路');
    tempName = tempName.replace(/^ル/, '路');
    tempName = tempName.replace(/^ア/, '阿');

    return cf.replaceText(tempName, chArray.chName);
}

// create east name
//function createEastName(katakanaName) {}

// save name
function saveName(name = '', translatedName = '', katakanaName = '', translatedKatakanaName = '') {
    if (name === translatedName) {
        return;
    }

    chArray.chTemp = fileModule.read(fileModule.getPath(tempPath, 'chTemp.json'), 'json') || [];

    if (name.length > 0 && name.length < 3) {
        chArray.chTemp.push([name + '#', translatedName, 'temp']);
    } else {
        chArray.chTemp.push([name, translatedName, 'temp']);
    }

    if (katakanaName.length > 0 && !cf.includesArrayItem(katakanaName, chArray.combine)) {
        if (katakanaName.length < 3) {
            chArray.chTemp.push([katakanaName + '#', translatedKatakanaName, 'temp']);
        } else {
            chArray.chTemp.push([katakanaName, translatedKatakanaName, 'temp']);
        }
    }

    console.log(chArray.chTemp);

    // write
    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);
    fileModule.write(fileModule.getPath(tempPath, 'chTemp.json'), chArray.chTemp, 'json');
}

// special text fix
function specialTextFix(name, text) {
    let loopCount = 0;

    // コボルド族
    if (/コボルド|\d{1,3}.*?・.*?|(^[ァ-ヺ]{1}・[ァ-ヺ]{1}$)/gi.test(name) && !name.includes('マメット')) {
        text = text.replaceAll('ー', '');
    }

    // マムージャ族 & 強化グリーンワート
    if (/マムージャ|ージャジャ$|男.*ージャ$|強化グリーンワート/gi.test(name)) {
        text = text.replaceAll('、', '');
    }

    // バヌバヌ族
    if (/ブンド|ズンド|グンド|ヌバ|バヌ/gi.test(name)) {
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
        text = text.replaceAll(/(?<!水晶|貴)公(?!開|的|然|共|衆|民|園|安|界|家|営|印|暇|課|会|海|宴|害|刊|館|器|儀|議|企|義|案|益|演|稲)/gi, '水晶公');
    }

    // 若判斷
    /*
    if (/ユウギリ|ゴウセツ/gi.test(name)) {
        text = text.replaceAll('若', '坊ちゃん');
    }
    */

    // 召喚士
    // ラムブルース？
    if (/ヤ・ミトラ|プリンキピア|クリスピン|ジャジャサム|デニース|^サリ(|の声)$/gi.test(name)) {
        text = text.replaceAll('サリ', 'サリ#');
    }

    // 暗黒騎士
    if (/フレイ|シドゥルグ|リエル|^ミスト(|の声)$/gi.test(name)) {
        text = text.replaceAll('ミスト', 'ミスト#');
    }

    // あ…… or あ… or あ、
    loopCount = 0;
    while (/^([ぁ-ゖ][ぁぃぅぇぉゃゅょっ]?|[ァ-ヺ][ァィゥェォャュョッ]?)[…、]+([^…、])/gi.test(text) && loopCount++ < 10) {
        text = text.replace(/^([ぁ-ゖ][ぁぃぅぇぉゃゅょっ]?|[ァ-ヺ][ァィゥェォャュョッ]?)[…、]+([^…、])/gi, '$2');
    }

    if (loopCount > 1) {
        text = '……' + text;
    }

    loopCount = 0;
    while (/([、。！？])([ぁ-ゖ][ぁぃぅぇぉゃゅょっ]?|[ァ-ヺ][ァィゥェォャュョッ]?)[…、]+([^…、])/gi.test(text) && loopCount++ < 10) {
        text = text.replace(/([、。！？])([ぁ-ゖ][ぁぃぅぇぉゃゅょっ]?|[ァ-ヺ][ァィゥェォャュョッ]?)[…、]+([^…、])/gi, '$1$3');
    }

    /*
    // あ…… or あ… or あ、
    loopCount = 0;
    while (/^[ぁ-ゖァ-ヺ][ぁぃぅぇぉゃゅょっァィゥェォャュョッ]?[…、]+[^…、]+/gi.test(text) && loopCount++ < 10) {
        text = text.replace(/^[ぁ-ゖァ-ヺ][ぁぃぅぇぉゃゅょっァィゥェォャュョッ]?[…、]+/gi, '');
    }
    */

    // あアあ => あああ
    loopCount = 0;
    while (/([^ァ-ヺ・ー＝]|^)[ァ-ヺ][ァィゥェォャュョッ]?([^ァ-ヺ・ー＝]|$)/gi.test(text) && loopCount++ < 10) {
        let t1 = /([^ァ-ヺ・ー＝]|^)[ァ-ヺ][ァィゥェォャュョッ]?([^ァ-ヺ・ー＝]|$)/gi.exec(text);

        if (!t1?.length > 0) {
            break;
        }

        t1 = t1[0];
        const t2 = cfjp.convertKana(t1, 'hira');
        text = text.replaceAll(t1, t2);
    }

    // デス => です
    text = text.replaceAll(/([^ァ-ヺ・ー＝])デス([^ァ-ヺ・ー＝])/gi, '$1です$2');

    // 魔器装備（武器・盾） => 魔器装備「武器・盾」
    text = text.replaceAll('魔器装備（武器・盾）', '魔器装備「武器・盾」').replaceAll('魔器装備（防具）', '魔器装備「防具」');

    return text;
}

// check katakana
function allKataCheck(name, text) {
    if (cf.includesArrayItem(name, jpArray.listHira)) {
        return true;
    }

    return /^[^ぁ-ゖ]+$/gi.test(text) && text.match(/[ァ-ヺ]/gi)?.length > 10;
}

// module exports
module.exports = {
    loadJSON_JP: loadJSON,
    addToCorrectionQueue_JP: addToCorrectionQueue,
};
