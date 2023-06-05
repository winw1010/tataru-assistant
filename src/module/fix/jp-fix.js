'use strict';

// function
const jpFunction = require('./jp-function');
const fixFunction = require('./fix-function');

// jp json
const jpJson = require('./jp-json');

// json function
const jsonFunction = require('./json-function');

// translate module
const translateModule = require('../system/translate-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// array
let jpArray = jpJson.getJpArray();
let chArray = jpJson.getChArray();

async function startFix(dialogData, translation) {
    try {
        // skip check
        if (translation.skip && fixFunction.skipCheck(dialogData.code, dialogData.name, dialogData.text, jpArray.ignore)) {
            throw '';
        }

        // name translation
        let translatedName = '';
        if (jpFunction.isChinese(dialogData.name, translation)) {
            translatedName = fixFunction.replaceText(dialogData.name, chArray.combine);
        } else {
            if (npcChannel.includes(dialogData.code)) {
                if (translation.fix) {
                    translatedName = await nameFix(dialogData.name, translation);
                } else {
                    translatedName = await translateModule.translate(dialogData.name, translation);
                }
            } else {
                translatedName = dialogData.name;
            }
        }

        // text translation
        let translatedText = '';
        if (jpFunction.isChinese(dialogData.text, translation)) {
            translatedText = fixFunction.replaceText(dialogData.text, chArray.combine);
        } else {
            if (translation.fix) {
                translatedText = await textFix(dialogData.name, dialogData.text, translation);
            } else {
                translatedText = await translateModule.translate(dialogData.text, translation);
            }
        }

        // set audio text
        if (fixFunction.includesArrayItem(dialogData.name, jpArray.listReverse)) {
            // reverse kana
            dialogData.audioText = jpFunction.reverseKana(dialogData.text);
        } else if (allKataCheck(dialogData.name, dialogData.text)) {
            // convert to hira
            dialogData.audioText = jpFunction.convertKana(dialogData.text, 'hira');
        }

        // set translated text
        dialogData.translatedName = translatedName;
        dialogData.translatedText = translatedText;
    } catch (error) {
        console.log(error);

        // set translated text
        dialogData.translatedName = 'Error';
        dialogData.translatedText = error;
    }

    return dialogData;
}

async function nameFix(name, translation) {
    if (name === '') {
        return '';
    }

    // same check
    const target1 = fixFunction.sameAsArrayItem(name, chArray.combine);
    const target2 = fixFunction.sameAsArrayItem(name + '#', chArray.combine);
    if (target1) {
        return target1[0][1];
    } else if (target2) {
        return target2[0][1].replaceAll('#', '');
    } else {
        const translatedName = translateName(name, getKatakanaName(name), translation);
        return translatedName;
    }
}

async function textFix(name, text, translation) {
    if (text === '') {
        return;
    }

    let originalText = text;

    // force overwrite
    const target = fixFunction.sameAsArrayItem(text, chArray.overwrite);
    if (target) {
        return fixFunction.replaceText(target[0][1], chArray.combine);
    } else {
        // subtitle
        text = fixFunction.replaceText(text, jpArray.subtitle);

        // check kana type
        let isAllKata = false;
        if (fixFunction.includesArrayItem(name, jpArray.listReverse)) {
            // reverse kana
            console.log('reverse');
            text = jpFunction.reverseKana(text);
        } else {
            // all kata check
            isAllKata = allKataCheck(name, text);
        }

        // special fix
        text = specialTextFix(name, text);

        // mark fix
        text = fixFunction.markFix(text);

        // jp1
        text = fixFunction.replaceText(text, jpArray.jp1);

        // combine
        const codeResult = jpFunction.replaceTextByCode(text, chArray.combine);
        text = codeResult.text;

        // jp2
        text = fixFunction.replaceText(text, jpArray.jp2);

        // convert to hira
        if (isAllKata) {
            text = jpFunction.convertKana(text, 'hira');
        }

        // value fix before
        const valueResult = fixFunction.valueFixBefore(text);
        text = valueResult.text;

        // skip check
        if (!jpFunction.canSkipTranslation(text)) {
            // translate
            text = await translateModule.translate(text, translation, codeResult.table);
        }

        // clear code
        text = fixFunction.clearCode(text, codeResult.table);

        // gender fix
        text = jpFunction.genderFix(originalText, text);

        // after translation
        text = fixFunction.replaceText(text, chArray.afterTranslation);

        // mark fix
        text = fixFunction.markFix(text, true);

        // value fix after
        text = fixFunction.valueFixAfter(text, valueResult.table);

        // table
        text = fixFunction.replaceText(text, codeResult.table);

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
    const sameKatakanaName1 = fixFunction.sameAsArrayItem(katakanaName, chArray.combine);
    const sameKatakanaName2 = fixFunction.sameAsArrayItem(katakanaName + '#', chArray.combine);

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
            katakanaName !== ''
                ? jpFunction.replaceTextByCode(name, jsonFunction.combineArray(chArray.combine, [[katakanaName, translatedKatakanaName]]))
                : jpFunction.replaceTextByCode(name, chArray.combine);

        // translate name
        translatedName = codeResult.text;

        // skip check
        if (!jpFunction.canSkipTranslation(translatedName)) {
            // translate
            translatedName = await translateModule.translate(translatedName, translation, codeResult.table);
        }

        // clear code
        translatedName = fixFunction.clearCode(translatedName, codeResult.table);

        // mark fix
        translatedName = fixFunction.markFix(translatedName, true);

        // table
        translatedName = fixFunction.replaceText(translatedName, codeResult.table);

        // save name
        saveName(name, translatedName, katakanaName, translatedKatakanaName);

        return translatedName;
    }
}

// create name
function createName(katakanaName) {
    let tempName = fixFunction.replaceText(katakanaName, chArray.combine);
    tempName = tempName.replace(/^ルル/, '路路');
    tempName = tempName.replace(/^ル/, '路');
    tempName = tempName.replace(/^ア/, '阿');

    return fixFunction.replaceText(tempName, chArray.chName);
}

// create east name
//function createEastName(katakanaName) {}

// save name
function saveName(name = '', translatedName = '', katakanaName = '', translatedKatakanaName = '') {
    if (name === translatedName) {
        return;
    }

    chArray.chTemp = jsonFunction.readTemp('chTemp.json', false);

    if (name.length > 0 && name.length < 3) {
        chArray.chTemp.push([name + '#', translatedName, 'temp']);
    } else {
        chArray.chTemp.push([name, translatedName, 'temp']);
    }

    if (katakanaName.length > 0 && !fixFunction.includesArrayItem(katakanaName, chArray.combine)) {
        if (katakanaName.length < 3) {
            chArray.chTemp.push([katakanaName + '#', translatedKatakanaName, 'temp']);
        } else {
            chArray.chTemp.push([katakanaName, translatedKatakanaName, 'temp']);
        }
    }

    console.log(chArray.chTemp);

    // write
    chArray.combine = jsonFunction.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);
    jsonFunction.writeTemp('chTemp.json', chArray.chTemp);
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
    if (text.includes('公') && fixFunction.includesArrayItem(name, jpArray.listCrystalium)) {
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
        const t2 = jpFunction.convertKana(t1, 'hira');
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
    if (fixFunction.includesArrayItem(name, jpArray.listHira)) {
        return true;
    }

    //return /^[^ぁ-ゖ]+$/gi.test(text) && text.match(/[ァ-ヺ]/gi)?.length > 10;
    return /^[^ぁ-ゖ]+$/gi.test(text) && text.match(/[\u3400-\u9FFF]/gi)?.length > 0;
}

// module exports
module.exports = {
    startFix,
};
