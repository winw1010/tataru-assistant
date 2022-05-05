'use strict';

// female words
const femaleWords = [
    '女',
    '娘',
    '嬢',
    '母',
    'マザー',
    'ピクシー',
    'ティターニア'
];

// jp text function
function replaceText(text, array, search = 0, replacement = 1) {
    if (!Array.isArray(array)) {
        return text;
    }

    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        text = text.replaceAll(element[search], element[replacement]);
    }

    return text;
}

function replaceTextByCode(text, array, search = 0, replacement = 1) {
    if (!Array.isArray(array)) {
        return {
            text: text,
            table: []
        };
    }

    // set code
    let codeIndex = 0;
    let codeString = 'BCDFGHJKLMNPQRSTVWXYZ';

    // clear code
    for (let index = 0; index < text.length; index++) {
        codeString = codeString.replaceAll(text[index].toUpperCase(), '');
    }

    // create table
    let table = [];
    for (let index = 0; index < array.length && codeIndex < codeString.length; index++) {
        const element = array[index];

        const searchReg1 = new RegExp(`${element[search]}ちゃん`, 'gi'); //たん
        if (searchReg1.test(text)) {
            text = text.replaceAll(searchReg1, codeString[codeIndex]);
            table.push([codeString[codeIndex], '小' + element[replacement]]);
            codeIndex++;
        }

        const searchReg2 = new RegExp(`${element[search]}先輩`, 'gi');
        if (searchReg2.test(text)) {
            text = text.replaceAll(searchReg2, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '前輩']);
            codeIndex++;
        }

        const searchReg3 = new RegExp(`${element[search]}(さま|様)`, 'gi');
        if (searchReg3.test(text)) {
            text = text.replaceAll(searchReg3, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '大人']);
            codeIndex++;
        }

        const searchReg4 = new RegExp(`${element[search]}提督`, 'gi');
        if (searchReg4.test(text)) {
            text = text.replaceAll(searchReg4, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '提督']);
            codeIndex++;
        }

        const searchReg5 = new RegExp(`${element[search]}総長`, 'gi');
        if (searchReg5.test(text)) {
            text = text.replaceAll(searchReg5, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '總長']);
            codeIndex++;
        }

        const searchReg6 = new RegExp(`${element[search]}伯爵`, 'gi');
        if (searchReg6.test(text)) {
            text = text.replaceAll(searchReg6, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '伯爵']);
            codeIndex++;
        }

        const searchReg7 = new RegExp(`${element[search]}(陛下|猊下)`, 'gi');
        if (searchReg7.test(text)) {
            text = text.replaceAll(searchReg7, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '陛下']);
            codeIndex++;
        }

        const searchReg8 = new RegExp(`${element[search]}(殿下|殿様)`, 'gi');
        if (searchReg8.test(text)) {
            text = text.replaceAll(searchReg8, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '殿下']);
            codeIndex++;
        }

        const searchReg9 = new RegExp(`${element[search]}(卿|殿)`, 'gi');
        if (searchReg9.test(text)) {
            text = text.replaceAll(searchReg9, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '閣下']);
            codeIndex++;
        }

        const searchReg10 = new RegExp(`${element[search]}(お嬢ちゃん|お嬢さん|お嬢様)`, 'gi');
        if (searchReg10.test(text)) {
            text = text.replaceAll(searchReg10, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '小姐']);
            codeIndex++;
        }

        const searchReg = new RegExp(`${element[search]}(さん|くん|君|)`, 'gi');
        if (searchReg.test(text)) {
            text = text.replaceAll(searchReg, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement]]);
            codeIndex++;
        }
    }

    const result = {
        text: text,
        table: table
    }

    console.log('result:', result);

    return result;
}

function canSkipTranslation(text) {
    // remove english word and marks
    text = text.replaceAll(/[^ァ-ヺぁ-ゖ\u4E00-\u9FFF]/gi, '');

    return text === '';
}

function genderFix(originalText, translatedText) {
    let isFemale = false;
    if (new RegExp(femaleWords.join('|'), 'gi').test(originalText)) {
        isFemale = true;
    }

    if (!isFemale) {
        translatedText = translatedText
            .replaceAll('她', '他')
            .replaceAll('小姐', '')
            .replaceAll('女王', '王');
    }

    if (!originalText.includes('娘')) {
        translatedText = translatedText
            .replaceAll('女兒', '女孩');
    }

    return translatedText;
}

exports.replaceText = replaceText;
exports.replaceTextByCode = replaceTextByCode;
exports.canSkipTranslation = canSkipTranslation;
exports.genderFix = genderFix;