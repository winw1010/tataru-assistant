'use strict';

// fix function
const fixFunction = require('./fix-function');

// female words
//const femaleWords = getFemaleWords();

// uncountable list
const uncountableList = ['Allie'];

// en text function
function replaceTextByCode(text, array) {
    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return {
            text: text,
            table: [],
        };
    }

    // set parameters
    const srcIndex = 0;
    const rplIndex = 1;
    let codeIndex = 0;
    let codeString = 'BCFGHJLMNPQRSTVWXYZ';
    let tempText = text;
    let tempTable = fixFunction.includesArrayItem(text, array, srcIndex, true) || [];
    let table = [];

    // sort temp table
    tempTable = tempTable.sort((a, b) => b[0].length - a[0].length);

    // set temp text
    for (let index = 0; index < tempTable.length; index++) {
        const element = tempTable[index];
        tempText += element[rplIndex];
    }

    // clear code
    const characters = tempText.match(/[a-z]/gi);
    if (characters) {
        for (let index = 0; index < characters.length; index++) {
            codeString = codeString.replaceAll(characters[index].toUpperCase(), '');
        }
    }

    // search and replace
    for (let index = 0; index < tempTable.length && codeIndex < codeString.length; index++) {
        const element = tempTable[index];
        const searchElement = element[srcIndex].replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchElementPlural = getPluralType(searchElement);
        const searchElementAdjective = getAdjectiveType(searchElement);
        let searchReg = null;
        if (uncountableList.includes(searchElement)) {
            searchReg = new RegExp(`\\b(the |a |an )?(${searchElement}|${searchElementAdjective})\\b`, 'gi');
        } else {
            searchReg = new RegExp(`\\b(the |a |an )?(${searchElementPlural}|${searchElement}|${searchElementAdjective})\\b`, 'gi');
        }

        if (searchReg.test(text)) {
            text = text.replaceAll(searchReg, codeString[codeIndex]);
            table.push([codeString[codeIndex], element[rplIndex]]);
            codeIndex++;
        }
    }

    const result = {
        text: text,
        table: table,
    };

    console.log('result:', result);

    return result;
}

function canSkipTranslation(text, table) {
    // remove table index
    const enReg = table.map((value) => value[0]).join('|');
    if (enReg !== '') {
        text = text.replaceAll(new RegExp(enReg, 'gi'), '');
    }

    // remove marks
    text = text.replaceAll(/[^a-z]/gi, '');

    return text === '';
}

/*
function genderFix(originalText, translatedText) {
    const isFemale = new RegExp(femaleWords.join('|'), 'gi').test(originalText);

    if (!isFemale) {
        translatedText = translatedText.replaceAll('她', '他').replaceAll('小姐', '').replaceAll('女王', '王');
    }

    return translatedText;
}
*/

function getPluralType(text = '') {
    if (/(s|x|z|sh|ch)$/gi.test(text)) {
        return text + 'es';
    } else if (/(f|fe)$/gi.test(text)) {
        return text.replace(/(f|fe)$/gi, 'ves');
    } else if (/[^aeiou]y$/gi.test(text)) {
        return text.replace(/y$/gi, 'ies');
    } else if (/[^aeiou]o$/gi.test(text)) {
        return text + 'es';
    }

    return text + 's';
}

function getAdjectiveType(text = '') {
    if (/(s|x|z|sh|ch)$/gi.test(text)) {
        return text + 'en';
    } else if (/(f|fe)$/gi.test(text)) {
        return text.replace(/(f|fe)$/gi, 'ven');
    } else if (/[^aeiou]y$/gi.test(text)) {
        return text.replace(/y$/gi, 'ien');
    } else if (/(a|e|i|o|u)$/gi.test(text)) {
        return text.replace(/(a|e|i|o|u)$/gi, 'an');
    }

    return text + 'an';
}

function isChinese(text, translation) {
    //return /[\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF]/gi.test(text);
    return translation.skipChinese && text.match(/[\u3400-\u9FFF]/gi)?.length > text.length / 2;
}

/*
function getFemaleWords() {
    return ['Girl', 'She', 'Her', 'Women', 'Female', 'Lady', 'Grandmother', 'Grandma', 'Mother', 'Mom', 'Granddaughter', 'Daughter', 'Aunt', 'Niece', 'Waitress', 'Actress', 'Heroine'];
}
*/

// module exports
module.exports = {
    replaceTextByCode,
    canSkipTranslation,
    isChinese,
};
