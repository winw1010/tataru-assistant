'use strict';

// correction function
const cf = require('./correction-function');

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
function replaceTextByCode(text, array, search = 0, replacement = 1) {
    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return {
            text: text,
            table: []
        };
    }

    // set code
    let codeIndex = 0;
    let codeString = 'BCFGHJKLMNPQRSTVWXYZ';

    // clear code
    const characters = text.match(/[a-z]/gi);
    if (characters) {
        for (let index = 0; index < characters.length; index++) {
            codeString = codeString.replaceAll(characters[index].toUpperCase(), '');
        }
    }

    // set table
    const target = cf.includesArrayItem(text, array, search);
    let table = [];

    if (target) {
        for (let index = 0; index < target.length && codeIndex < codeString.length; index++) {
            const element = target[index];
            const searchElement = element[search].replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchReg = new RegExp(`\\b(The |A |)${searchElement}(es|an|s|n|)\\b`, 'gi');

            if (searchReg.test(text)) {
                text = text.replaceAll(searchReg, codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement]]);
                codeIndex++;
            }
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

exports.replaceTextByCode = replaceTextByCode;
exports.canSkipTranslation = canSkipTranslation;
exports.genderFix = genderFix;