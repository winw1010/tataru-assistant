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

// text type list
const textTypeList = {
    normal: 0,
    reversed: 1,
    allKatakana: 2,
};

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
        const textType = getTextType(dialogData.name, dialogData.text);
        if (textType === textTypeList.reversed) {
            // reverse kana
            dialogData.audioText = jpFunction.reverseKana(dialogData.text);
        } else if (textType === textTypeList.allKatakana) {
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
    const target3 = fixFunction.sameAsArrayItem(name + '##', chArray.combine);

    if (target1) {
        return target1[1];
    } else if (target2) {
        return target2[1].replaceAll(/#$/gi, '');
    } else if (target3) {
        return target3[1].replaceAll(/##$/gi, '');
    } else {
        const translatedName = translateName(name, getKatakanaName(name), translation);
        return translatedName;
    }
}

async function textFix(name, text, translation) {
    if (text === '') {
        return '';
    }

    let originalText = text;

    // force overwrite
    const target = fixFunction.sameAsArrayItem(text, chArray.overwrite);
    if (target) {
        return fixFunction.replaceText(target[1], chArray.combine);
    } else {
        // get text type
        const textType = getTextType(name, text);

        // subtitle
        text = fixFunction.replaceText(text, jpArray.subtitle);

        // reverse text
        if (textType === textTypeList.reversed) {
            text = jpFunction.reverseKana(text);
        }

        // special fix
        text = specialFix(name, text);

        // jp1
        text = fixFunction.replaceText(text, jpArray.jp1);

        // combine
        const codeResult = jpFunction.replaceTextByCode(text, chArray.combine, textType);
        text = codeResult.text;

        // jp2
        text = fixFunction.replaceText(text, jpArray.jp2);

        // convert to hira
        if (textType === textTypeList.allKatakana) {
            text = jpFunction.convertKana(text, 'hira');
        }

        // mark fix
        text = fixFunction.markFix(text);

        // value fix before
        const valueResult = fixFunction.valueFixBefore(text);
        text = valueResult.text;

        // skip check
        if (!jpFunction.canSkipTranslation(text)) {
            // translate
            text = await translateModule.translate(text, translation, codeResult.table);
        }

        // value fix after
        text = fixFunction.valueFixAfter(text, valueResult.table);

        // mark fix
        text = fixFunction.markFix(text, true);

        // gender fix
        text = jpFunction.genderFix(originalText, text);

        // after translation
        text = fixFunction.replaceText(text, chArray.afterTranslation);

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
    const translatedKatakanaName = sameKatakanaName1 ? sameKatakanaName1[1] : sameKatakanaName2 ? sameKatakanaName2[1] : createName(katakanaName);

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

        // after translation
        translatedName = fixFunction.replaceText(translatedName, chArray.afterTranslation);

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
    tempName = tempName.replaceAll(/^ルル/gi, '路路');
    tempName = tempName.replaceAll(/^ル/gi, '路');
    tempName = tempName.replaceAll(/^ア/gi, '阿');

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

    // write
    chArray.combine = jsonFunction.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);
    jsonFunction.writeTemp('chTemp.json', chArray.chTemp);
}

// special fix
function specialFix(name, text) {
    let loopCount = 0;

    // special replace
    for (let index = 0; index < jpArray.special.length; index++) {
        const element = jpArray.special[index];
        text = text.replaceAll(element[0], element[1]);
    }

    // コボルド族
    if (/コボルド|\d{1,3}.*?・.*?|(^[ァ-ヺ]{1}・[ァ-ヺ]{1}$)/gi.test(name) && !name.includes('マメット')) {
        text = text.replaceAll('ー', '');
    }

    // マムージャ族 & 強化グリーンワート
    if (/マムージャ|[ァ-ヺ]{2}ージャジャ$|[ァ-ヺ]{2}ージャ$|強化グリーンワート/gi.test(name)) {
        text = text.replaceAll('、', '');
    }

    // バヌバヌ族
    if (/ブンド|ズンド|グンド|ヌバ|バヌ/gi.test(name)) {
        // 長老さま、長老さま！
        // ぬおおおおおん！まただ、まただ、浮島が食べられたね！
        text = text.replaceAll(/(.{3,}?)、\1/gi, '$1');
    }

    // 異邦の詩人
    if (/異邦の詩人|異世界の詩人/gi.test(name)) {
        text = text.replaceAll(/\u3000/gi, '、');
    }

    // ヒエン
    if (/ユウギリ|ゴウセツ|ヨツユ/gi.test(name)) {
        text = text.replaceAll(/若(?!若|々|い|し|様)/gi, '若様');
    }

    // 水晶公
    if (fixFunction.includesArrayItem(name, jpArray.listCrystalium)) {
        text = text.replaceAll(/(?<!水晶|貴)公(?!開|的|然|共|衆|民|園|安|界|家|営|印|暇|課|会|海|宴|害|刊|館|器|儀|議|企|義|案|益|演|稲)/gi, '水晶公');
    }

    // ライアン
    if (/ライアン/gi.test(name)) {
        text = text.replaceAll('あーた', '貴方');
    }

    // 暗黒騎士
    if (/フレイ|シドゥルグ|リエル|^ミスト(の声)?$/gi.test(name)) {
        text = text.replaceAll('ミスト', 'ミスト#');
    }

    // あ…… or あ… or あ、
    loopCount = 0;
    while (/^([…、]*)([ぁ-ゖ][ぁぃぅぇぉゃゅょっ]?|[ァ-ヺ][ァィゥェォャュョッ]?)[…、]+([^…、])/gi.test(text) && loopCount < 10) {
        text = text.replaceAll(/^([…、]*)([ぁ-ゖ][ぁぃぅぇぉゃゅょっ]?|[ァ-ヺ][ァィゥェォャュョッ]?)[…、]+([^…、])/gi, '$1$3');
        loopCount++;
    }

    if (loopCount > 0 && !/^…+/gi.test(text)) {
        text = '……' + text;
    }

    loopCount = 0;
    while (/([、。！？])([…、]*)([ぁ-ゖ][ぁぃぅぇぉゃゅょっ]?|[ァ-ヺ][ァィゥェォャュョッ]?)[…、]+([^…、])/gi.test(text) && loopCount < 10) {
        text = text.replaceAll(/([、。！？])([…、]*)([ぁ-ゖ][ぁぃぅぇぉゃゅょっ]?|[ァ-ヺ][ァィゥェォャュョッ]?)[…、]+([^…、])/gi, '$1$2$4');
        loopCount++;
    }

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

    return text;
}

// get text type
function getTextType(name, text) {
    let type = textTypeList.normal;

    if (fixFunction.includesArrayItem(name, jpArray.listReverse)) {
        type = textTypeList.reversed;
    } else if (allKataCheck(name, text)) {
        type = textTypeList.allKatakana;
    }

    return type;
}

// check katakana
function allKataCheck(name, text) {
    if (fixFunction.includesArrayItem(name, jpArray.listHira)) {
        return true;
    }

    //return /^[^ぁ-ゖ]+$/gi.test(text) && text.match(/[ァ-ヺ]/gi)?.length > 10;
    const kanji = text.match(/[\u3400-\u9FFF]/gi);
    if (kanji?.length > 0) {
        return /^[^ぁ-ゖ]+$/gi.test(text);
    } else {
        return /^[^ぁ-ゖ]+$/gi.test(text) && text.length > 15;
    }
}

// module exports
module.exports = {
    startFix,
};
