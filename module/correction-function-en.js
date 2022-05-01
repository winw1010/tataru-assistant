'use strict';

// en text function
function replaceText(text, array, search = 0, replacement = 1) {
    if (!Array.isArray(array)) {
        return text;
    }

    for (let index = 0; index < array.length; index++) {
        const element = array[index];

        // Aaa
        text = replaceWord(text, UpperFirst(element[search]), element[replacement]);

        // Aaa Bbb
        text = replaceWord(text, UpperFirstAll(element[search]), element[replacement]);

        // AAA
        text = replaceWord(text, element[search].toUpperCase(), element[replacement]);

        // aaa
        text = replaceWord(text, ' ' + element[search].toLowerCase(), ' ' + element[replacement]);

        // original
        text = replaceWord(text, element[search], element[replacement]);
    }

    return text;
}

function replaceTextPure(text, array, search = 0, replacement = 1) {
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
        let isIncluded = false;

        // Aaa
        if (text.includes(UpperFirst(element[search]))) {
            text = replaceWord(text, UpperFirst(element[search]), codeString[codeIndex]);
            isIncluded = true;
        }

        // Aaa Bbb
        if (text.includes(UpperFirstAll(element[search]))) {
            text = replaceWord(text, UpperFirstAll(element[search]), codeString[codeIndex]);
            isIncluded = true;
        }

        // AAA
        if (text.includes(element[search].toUpperCase())) {
            text = replaceWord(text, element[search].toUpperCase(), codeString[codeIndex]);
            isIncluded = true;
        }

        // aaa
        if (text.includes(element[search].toLowerCase())) {
            text = replaceWord(text, ' ' + element[search].toLowerCase(), ' ' + codeString[codeIndex]);
            isIncluded = true;
        }

        // original
        if (text.includes(element[search])) {
            text = replaceWord(text, element[search], codeString[codeIndex]);
            isIncluded = true;
        }

        if (isIncluded) {
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

function replaceWord(text, search, replacement) {
    const mark = [' ', ',', '.', '!', '?', ':', ';', '\'', '─', '-', '…', '"', '/', '(', '[', '{', '<'];

    mark.forEach((value) => {
        text = text.replaceAll(search + value, replacement + value);
    });

    return text;
}

function canSkipTranslation(text, table) {
    const en = table;
    const marks = [
        ',', '.', '?', '!', '♪', '・', ':', 'ー', '―', '-',
        '(', ')', '[', ']', ' '
    ];

    for (let index = 0; index < en.length; index++) {
        const item = en[index][0];
        text = text.replaceAll(item.toUpperCase(), '');
        text = text.replaceAll(item, '');
    }

    for (let index = 0; index < marks.length; index++) {
        text = text.replaceAll(marks[index], '');
    }

    return text === '';
}

function UpperFirst(text = '') {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function UpperFirstAll(text = '') {
    let textArray = text.split(' ');
    textArray.forEach((value, index, array) => {
        array[index] = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    });

    return textArray.join(' ');
}

function genderFix(originalText, translatedText) {
    const femaleWord = [
        'Girl', 'girl',
        'She', 'she',
        'Her', 'her',
        'Women', 'women',
        'Female', 'female',
        'Lady', 'lady',
        'Mother', 'mother',
        'Mom', 'mom',
        'Grandma', 'grandma',
        'Daughter', 'daughter',
        'Aunt', 'aunt',
        'Waitress', 'waitress',
        'Actress', 'actress',
        'Heroine', 'heroine'
    ];

    let isFemale = false;

    for (let index = 0; index < femaleWord.length; index++) {
        const word = femaleWord[index];

        if (originalText.includes(word)) {
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
exports.replaceTextPure = replaceTextPure;
exports.replaceTextByCode = replaceTextByCode;
exports.canSkipTranslation = canSkipTranslation;
exports.genderFix = genderFix;