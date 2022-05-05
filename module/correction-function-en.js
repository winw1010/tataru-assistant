'use strict';

// female words
const femaleWords = [
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
        const searchReg = new RegExp(`\\b(The |A |)${element[search]}(es|an|s|n|)\\b`, 'gi');

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

function canSkipTranslation(text, table) {
    // remove table index
    const enReg = table.map(value => value[0]).join('|');
    if (enReg !== '') {
        text = text.replaceAll(new RegExp(enReg, 'gi'), '');
    }

    // remove marks
    text = text.replaceAll(/[^a-z]/gi, '');

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

    return translatedText;
}

exports.replaceText = replaceText;
exports.replaceTextByCode = replaceTextByCode;
exports.canSkipTranslation = canSkipTranslation;
exports.genderFix = genderFix;