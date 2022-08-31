'use strict';

// language table
const { languageEnum, languageIndex } = require('./engine-module');

// correction function
const cfjp = require('./correction-function-jp');
const cf = require('./correction-function');

// translator module
const tm = require('./translate-module');

// main window module
const { sendIndex } = require('./main-window-module');

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
    chArray.overwrite = cf.combineArrayWithTemp(
        cf.readJSON(tempLocation, 'overwriteTemp.json'),
        cf.readJSONOverwrite(chineseDirectory, 'overwriteJP')
    );
    chArray.chName = cf.readJSON(chineseDirectory, 'chName.json');
    chArray.afterTranslation = cf.readJSON(chineseDirectory, 'afterTranslation.json');

    chArray.main = cf.readJSONMain(sub0, sub1);
    chArray.player = cf.readJSON(tempLocation, 'player.json');
    chArray.chTemp = cf.readJSON(tempLocation, 'chTemp.json');

    // combine
    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // jp array
    jpArray.ignore = cf.readJSON(japaneseDirectory, 'ignore.json');
    jpArray.subtitle = cf.combineArrayWithTemp(cf.readJSON(tempLocation, 'jpTemp.json'), cf.readJSONSubtitle());
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

        // append blank dialog
        sendIndex('append-blank-dialog', dialogData.id, dialogData.code);

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
        sendIndex('update-dialog', dialogData.id, translatedName, translatedText, dialogData, translation);
    } catch (error) {
        console.log(error);
        sendIndex('update-dialog', dialogData.id, 'Error', error, dialogData, translation);
    }
}

function savePlayerName(playerName) {
    if (playerName !== '' && playerName.includes(' ')) {
        if (!chArray.player.length > 0 || chArray.player[0][0] !== playerName) {
            const firstName = playerName.split(' ')[0];
            const lastName = playerName.split(' ')[1];

            chArray.player = [
                [playerName, playerName],
                [firstName, firstName],
                [lastName, lastName],
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

    // original text
    const originalText = text;

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

        // mark fix
        text = cf.markFix(text);

        // special fix
        text = specialTextFix(name, text);

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

        // value fix after
        text = cf.valueFixAfter(text, valueResult.table);

        // clear code
        text = cf.clearCode(text, codeResult.table);

        // gender fix
        text = cfjp.genderFix(originalText, text);

        // after translation
        text = cf.replaceText(text, chArray.afterTranslation);

        // mark fix
        text = cf.markFix(text, true);

        // table
        text = cf.replaceText(text, codeResult.table);

        return text;
    }
}

// get katakana name
function getKatakanaName(name = '') {
    if (/^([ァ-ヺ・ー]+)([^ァ-ヺ・ー]+)？*$/gi.test(name)) {
        // katakana + not katakana
        return name.replaceAll(/^([ァ-ヺ・ー]+)([^ァ-ヺ・ー]+)？*$/gi, '$1');
    } else if (/^([^ァ-ヺ・ー]+)([ァ-ヺ・ー]+)？*$/gi.test(name)) {
        // not katakana + katakana
        return name.replaceAll(/^([^ァ-ヺ・ー]+)([ァ-ヺ・ー]+)？*$/gi, '$2');
    } else if (/^([ァ-ヺ・ー]+)？*$/gi.test(name)) {
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
    const translatedKatakanaName = sameKatakanaName1
        ? sameKatakanaName1[0][1]
        : sameKatakanaName2
        ? sameKatakanaName2[0][1]
        : cf.replaceText(cf.replaceText(katakanaName, chArray.combine), chArray.chName);

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

        // mark fix
        translatedName = cf.markFix(translatedName);

        // code
        const codeResult =
            katakanaName !== ''
                ? cfjp.replaceTextByCode(
                      name,
                      cf.combineArray(chArray.combine, [[katakanaName, translatedKatakanaName]])
                  )
                : cfjp.replaceTextByCode(name, chArray.combine);

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

// save name
function saveName(name = '', translatedName = '', katakanaName = '', translatedKatakanaName = '') {
    if (name === translatedName) {
        return;
    }

    chArray.chTemp = cf.readJSONPure(tempLocation, 'chTemp.json');

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

    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);
    cf.writeJSON(tempLocation, 'chTemp.json', chArray.chTemp);
}

// special text fix
function specialTextFix(name, text) {
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
        text = text.replaceAll(
            /(?<!水晶|貴)公(?!開|的|然|共|衆|民|園|安|界|家|営|印|暇|課|会|海|宴|害|刊|館|器|儀|議|企|義|案|益|演|稲)/gi,
            '水晶公'
        );
    }

    // 若判斷
    if (/ユウギリ|ゴウセツ/gi.test(name)) {
        text = text.replaceAll('若', '坊ちゃん');
    }

    // 召喚士
    if (/ヤ・ミトラ|プリンキピア/gi.test(name)) {
        text = text.replaceAll('サリ', 'サリ#');
    }

    // 暗黒騎士
    if (/フレイ|シドゥルグ|リエル|^ミスト(|の声)$/gi.test(name)) {
        text = text.replaceAll('ミスト', 'ミスト#');
    }

    // あ…… or あ… or あ、
    while (/^[ぁ-ゖァ-ヺ][ぁぃぅぇぉゃゅょっァィゥェォャュョッ]?[…、]+[^…、]+/gi.test(text)) {
        text = text.replace(/^[ぁ-ゖァ-ヺ][ぁぃぅぇぉゃゅょっァィゥェォャュョッ]?[…、]+/gi, '');
    }

    return text;
}

// check katakana
function allKataCheck(name, text) {
    if (cf.includesArrayItem(name, jpArray.listHira)) {
        return true;
    }

    return /^[^ぁ-ゖ]+$/gi.test(text) && countKata(text) > 10;
}

// count katakana
function countKata(text) {
    const kataRegExp = /[ァ-ヺ]/;
    let count = 0;

    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        if (kataRegExp.test(char)) {
            count++;
        }
    }

    return count;
}

exports.loadJSON_JP = loadJSON;
exports.addToCorrectionQueue_JP = addToCorrectionQueue;
