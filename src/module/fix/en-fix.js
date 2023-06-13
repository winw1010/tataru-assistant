'use strict';

// function
const enFunction = require('./en-function');
const fixFunction = require('./fix-function');

// en json
const enJson = require('./en-json');

// json function
const jsonFunction = require('./json-function');

// translate module
const translateModule = require('../system/translate-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// array
let enArray = enJson.getEnArray();
let chArray = enJson.getChArray();

async function startFix(dialogData, translation) {
    try {
        // skip check
        if (translation.skip && fixFunction.skipCheck(dialogData.code, dialogData.name, dialogData.text, enArray.ignore)) {
            throw '';
        }

        // name translation
        let translatedName = '';
        if (enFunction.isChinese(dialogData.name, translation)) {
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
        if (enFunction.isChinese(dialogData.text, translation)) {
            translatedText = fixFunction.replaceText(dialogData.text, chArray.combine);
        } else {
            if (translation.fix) {
                translatedText = await textFix(dialogData.name, dialogData.text, translation);
            } else {
                translatedText = await translateModule.translate(dialogData.text, translation);
            }
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
        // code
        const codeResult = enFunction.replaceTextByCode(name, chArray.combine);

        // translate name
        let translatedName = '';
        translatedName = codeResult.text;

        // skip check
        if (!enFunction.canSkipTranslation(translatedName, codeResult.table)) {
            // translate
            translatedName = await translateModule.translate(translatedName, translation, codeResult.table);
        }

        // clear code
        translatedName = fixFunction.clearCode(translatedName, codeResult.table);

        // mark fix
        translatedName = fixFunction.markFix(translatedName, true);

        // table
        translatedName = fixFunction.replaceText(translatedName, codeResult.table);

        // save to temp
        saveName(name, translatedName);

        return translatedName;
    }
}

async function textFix(name, text, translation) {
    if (text === '') {
        return;
    }

    // force overwrite
    const target = fixFunction.sameAsArrayItem(text, chArray.overwrite);
    if (target) {
        return fixFunction.replaceText(target[0][1], chArray.combine);
    } else {
        // special fix
        text = specialTextFix(name, text);

        // mark fix
        text = fixFunction.markFix(text);

        // en1
        text = fixFunction.replaceText(text, enArray.en1);

        // combine
        const codeResult = enFunction.replaceTextByCode(text, chArray.combine);
        text = codeResult.text;

        // en2
        text = fixFunction.replaceText(text, enArray.en2);

        // value fix before
        const valueResult = fixFunction.valueFixBefore(text);
        text = valueResult.text;

        // skip check
        if (!enFunction.canSkipTranslation(text, codeResult.table)) {
            // translate
            text = await translateModule.translate(text, translation, codeResult.table);
        }

        // clear code
        text = fixFunction.clearCode(text, codeResult.table);

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

function saveName(name = '', translatedName = '') {
    if (name === translatedName) {
        return;
    }

    chArray.chTemp = jsonFunction.readTemp('chTemp.json', false);

    if (name.length < 3) {
        chArray.chTemp.push([name + '#', translatedName, 'temp']);
    } else {
        chArray.chTemp.push([name, translatedName, 'temp']);
    }

    // set combine
    chArray.combine = jsonFunction.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // write
    jsonFunction.writeTemp('chTemp.json', chArray.chTemp);
}

function specialTextFix(name, text) {
    let loopCount = 0;

    // A-Apple
    while (/\b(\w{1,2})-\1/gi.test(text) && loopCount < 10) {
        text = text.replaceAll(/\b(\w{1,2})-\1/gi, '$1');
        loopCount++;
    }

    return text;
}

// module exports
module.exports = {
    startFix,
};
