'use strict';

// skip check
function skipCheck(dialogData, ignoreArray = []) {
    return ['0039', '0839'].includes(dialogData.code) && canIgnore(dialogData.text, ignoreArray);
}

// replace text
function replaceText(text = '', array = [], useRegExp = false) {
    const srcIndex = 0;
    const rplIndex = 1;

    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return text;
    }

    if (useRegExp) {
        const target = includesArrayItem(text, array, srcIndex, true);
        if (target) {
            for (let index = 0; index < target.length; index++) {
                const element = target[index];
                text = text.replaceAll(element[srcIndex], element[rplIndex]);
            }
        }
    } else {
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            text = text.replaceAll(element[srcIndex], element[rplIndex]);
        }
    }

    return text;
}

// replace word
function replaceWord(text = '', table = []) {
    if (text === '' || !Array.isArray(table) || !table.length > 0) {
        return text;
    }

    const tableCode = table.map((x) => x[0]);
    let target = text.match(/[A-Z]+/gi)?.sort((a, b) => b.length - a.length) || [];
    let wordTable = [];

    for (let index = 0; index < target.length; index++) {
        let code = `*@${index}*`;
        text = text.replace(target[index], code);
        wordTable.push([code, target[index]]);
    }

    console.log(text);

    for (let index = 0; index < wordTable.length; index++) {
        const element = wordTable[index];
        let word = element[1];

        if (codeTest(word, tableCode)) {
            word = replaceText(word, table);
        } else if (/[a-z]/.test(word)) {
            word = word[0].toUpperCase() + word.slice(1).toLowerCase();
        }

        text = text.replace(element[0], word);
    }

    return text;
}

// code test
function codeTest(text = '', code = []) {
    if (text === '') return false;

    for (let index = 0; index < code.length; index++) {
        text = text.replaceAll(code[index], '');
    }
    text = text.replace(/[IVXLCDM]/, '');

    return text.trim() === '';
}

// can ignore
function canIgnore(text = '', ignoreArray = []) {
    if (text === '' || !Array.isArray(ignoreArray) || !ignoreArray.length > 0) {
        return false;
    }

    for (let index = 0; index < ignoreArray.length; index++) {
        if (text.match(new RegExp(ignoreArray[index], 'gi'))) {
            return true;
        }
    }

    return false;
}

// includes array item
function includesArrayItem(text = '', array = [], searchIndex = 0, useRegex = false) {
    // search array
    let searchArray = array;

    // target
    let target = null;

    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return target;
    }

    // 2d check
    if (Array.isArray(array[0])) {
        searchArray = array.map((value) => value[searchIndex]);
    }

    // match
    let temp = [];

    if (useRegex) {
        for (let index = 0; index < searchArray.length; index++) {
            const element = searchArray[index].replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(element, 'gi').test(text)) {
                text = text.replaceAll(element, '');
                temp.push(array[index]);
            }
        }
    } else {
        for (let index = 0; index < searchArray.length; index++) {
            const element = searchArray[index];
            if (text.includes(element)) {
                text = text.replaceAll(element, '');
                temp.push(array[index]);
            }
        }
    }

    target = temp.length > 0 ? temp : null;

    return target;
}

// same as array item
function sameAsArrayItem(text = '', array = [], searchIndex = 0) {
    // search array
    let searchArray = array;

    // target
    let target = null;

    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return target;
    }

    // 2d check
    if (Array.isArray(array[0])) {
        searchArray = array.map((value) => value[searchIndex]);
    }

    // match
    for (let index = 0; index < searchArray.length; index++) {
        const element = searchArray[index].replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

        if (new RegExp('^' + element + '$', 'gi').test(text)) {
            target = array[index];
            break;
        }
    }

    return target;
}

// mark fix
function markFix(text = '', isTranslated = false) {
    // remove （） and its content
    text = text.replaceAll(/（.*?）/gi, '');

    // remove () and its content
    text = text.replaceAll(/\(.*?\)/gi, '');

    if (isTranslated) {
        // fix 「「
        if (text.includes('「') && !text.includes('」')) {
            text = text.replaceAll(/「(.+?)「/gi, '「$1」');
        }

        // fix 」」
        if (text.includes('」') && !text.includes('「')) {
            text = text.replaceAll(/」(.+?)」/gi, '「$1」');
        }

        // fix ""
        //text = text.replaceAll(/"(.+?)"/gi, '「$1」');

        // fix .
        //text = text.replaceAll(/([^.0-9])\.([^.0-9])/gi, '$1・$2');

        // fix ·
        text = text.replaceAll(/([^·0-9])·([^·0-9])/gi, '$1・$2');

        // fix 0
        text = text.replaceAll(/([^-,.\w]|^)0([^-,.\w/%]|$)/gi, '$1零$2');
        text = text.replaceAll(/zero/gi, '零');
    }

    return text;
}

// value fix before
function valueFixBefore(text = '') {
    const valueList = text.match(/\d+((,\d{3})+)?(\.\d+)?/gi);
    let valueTable = [];

    if (valueList) {
        for (let index = 0; index < valueList.length; index++) {
            const value = valueList[index];
            if (value.includes(',')) {
                const tempValue = value.replaceAll(',', '');
                text = text.replaceAll(value, tempValue);
                valueTable.push([tempValue, value]);
            }
        }
    }

    return {
        text: text,
        table: valueTable.sort((a, b) => b[0].length - a[0].length),
    };
}

// value fix after
function valueFixAfter(text = '', valueTable = []) {
    for (let index = 0; index < valueTable.length; index++) {
        const element = valueTable[index];
        text = text.replaceAll(element[0], element[1]);
    }

    return text;
}

// sleep
function sleep(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
    skipCheck,
    replaceText,
    replaceWord,
    includesArrayItem,
    sameAsArrayItem,
    markFix,
    valueFixBefore,
    valueFixAfter,
    sleep,
};
