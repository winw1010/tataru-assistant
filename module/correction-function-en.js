'use strict';

// en text function
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
        const searchReg = new RegExp(`\\b${element[search]}\\b`, 'gi');
        const searchRegN = new RegExp(`\\b${element[search]}n\\b`, 'gi');
        const searchRegS = new RegExp(`\\b${element[search]}s\\b|\\b${element[search]}es\\b`, 'gi');

        if (text.match(searchRegS)) {
            text = text.replaceAll(searchRegS, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '們']);
            codeIndex++;
        }

        if (text.match(searchRegN)) {
            text = text.replaceAll(searchRegN, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[replacement] + '人']);
            codeIndex++;
        }

        if (text.match(searchReg)) {
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

function canSkipTranslation(text, table) {
    const enTable = table;

    for (let index = 0; index < enTable.length; index++) {
        const en = enTable[index][0];
        text = text.replaceAll(new RegExp(en, 'gi'), '');
    }

    return text.replaceAll(new RegExp('[^a-z]', 'gi'), '') === '';
}

function genderFix(originalText, translatedText) {
    const femaleWord = [
        'Girl',
        'She',
        'Her',
        'Women',
        'Female',
        'Lady',
        'Grandmother',
        'Grandma',
        'Mother',
        'Mom',
        'Granddaughter',
        'Daughter',
        'Aunt',
        'Niece',
        'Waitress',
        'Actress',
        'Heroine'
    ];

    let isFemale = false;

    for (let index = 0; index < femaleWord.length; index++) {
        const word = femaleWord[index];

        if (originalText.match(new RegExp(`\\b${word}\\b`, 'gi'))) {
            isFemale = true;
            break;
        }
    }

    if (!isFemale) {
        translatedText = translatedText
            .replaceAll('她', '他')
            .replaceAll('小姐', '')
            .replaceAll('女王', '王');
    }

    return translatedText;
}

exports.replaceText = replaceText;
exports.replaceTextByCode = replaceTextByCode;
exports.canSkipTranslation = canSkipTranslation;
exports.genderFix = genderFix;