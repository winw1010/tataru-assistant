'use strict';

// path
const { resolve } = require('path');

// fs
const { readFileSync, writeFileSync, readdirSync } = require('fs');

// json fixer
const jsonFixer = require('json-fixer');

// text function
function skipCheck(code, name, text, ignoreArray) {
    return (name + text).includes('') || (['0039', '0839'].includes(code) && canIgnore(text, ignoreArray));
}

function replaceText(text, array, search = 0, replacement = 1) {
    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return text;
    }

    const target = includesArrayItem(text, array, search);

    if (target) {
        for (let index = 0; index < target.length; index++) {
            const element = target[index];
            text = text.replaceAll(element[search], element[replacement]);
        }
    }

    return text;
}

function canIgnore(text, ignoreArray) {
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

function includesArrayItem(text, array, searchIndex = 0) {
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
    for (let index = 0; index < searchArray.length; index++) {
        const element = searchArray[index].replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

        if (new RegExp(element, 'gi').test(text)) {
            text = text.replaceAll(element, '');
            temp.push(array[index]);
        }
    }

    target = temp.length > 0 ? temp : null;

    return target;
}

function sameAsArrayItem(text, array, searchIndex = 0) {
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
            target = [array[index], index];
            break;
        }
    }

    return target;
}

function markFix(text, isTranslated = false) {
    // remove （） and its content
    text = text.replaceAll(/（.*?）/gi, '');

    // remove () and its content
    text = text.replaceAll(/\(.*?\)/gi, '');

    if (isTranslated) {
        // fix 「「
        text = text.replaceAll(/(「)([^」]*?)(\1)/gi, '「$2」');

        // fix 」」
        text = text.replaceAll(/(」)([^「]*?)(\1)/gi, '「$2」');

        // fix ""
        text = text.replaceAll(/(")(.*?)(\1)/gi, '「$2」');

        // fix ''
        text = text.replaceAll(/(')(.*?)(\1)/gi, '「$2」');

        // fix .
        text = text.replaceAll(/([^.])\.([^.])/gi, '$1・$2');
    }

    return text;
}

function clearCode(text, table) {
    if (table.length > 0) {
        table.forEach((value) => {
            const character = value[0];
            text = text.replaceAll(new RegExp(`\\s?${character}+\\s?`, 'gi'), character.toUpperCase());
        });
    }

    return text;
}

function valueFixBefore(text) {
    const values = text.match(/\d+((,\d{3})+)?(\.\d+)?/gi);
    let valueTable = [];

    if (values) {
        for (let index = 0; index < values.length; index++) {
            const element = values[index];
            if (element.includes(',')) {
                const element2 = element.replaceAll(',', '');
                text = text.replaceAll(element, element2);
                valueTable.push([element2, element]);
            }
        }
    }

    return {
        text: text,
        table: valueTable,
    };
}

function valueFixAfter(text, valueTable) {
    for (let index = 0; index < valueTable.length; index++) {
        const element = valueTable[index];
        text = text.replaceAll(element[0], element[1]);
    }

    return text;
}

// json function
function readJSON(path = '', name = '', needSub = false, sub0 = 0, sub1 = 1) {
    try {
        const dir = './json';
        const finalPath = path.includes(':') ? resolve(path, name) : resolve(dir, path, name);

        // parse
        let array = jsonFixer(readFileSync(finalPath).toString()).data;

        if (!Array.isArray(array)) {
            console.log(`${path}/${name} is not an array.`);
            writeJSON(path, name, []);
            return [];
        }

        // sub array
        if (needSub) {
            array = subArray(array, sub0, sub1);
        }

        // remove comment and N/A
        array = clearArray(array);

        // sort
        array = sortArray(array);

        // log array
        console.log(`Read ${finalPath}. (length: ${array.length})`);

        return array;
    } catch (error) {
        console.log(error);
        writeJSON(path, name, []);
        return [];
    }
}

function readJSONMain(sub0, sub1) {
    try {
        const fileList = readdirSync('./json/text/main');
        let mainArray = [];

        if (fileList.length > 0) {
            fileList.forEach((value) => {
                if (value !== 'hidden.json') {
                    mainArray = mainArray.concat(readJSON('text/main', value, true, sub0, sub1));
                }
            });
        }

        mainArray = sortArray(mainArray);
        console.log('main:', mainArray);
        return mainArray;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function readJSONOverwrite(ch, directory) {
    try {
        const fileList = readdirSync(`./json/${ch}/${directory}`);
        let overwrite = [];

        if (fileList.length > 0) {
            fileList.forEach((value) => {
                if (value !== 'hidden.json') {
                    overwrite = overwrite.concat(readJSON(`${ch}/${directory}`, value));
                }
            });
        }

        overwrite = sortArray(overwrite);
        console.log('overwrite:', overwrite);
        return overwrite;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function readJSONSubtitle() {
    try {
        const fileList = readdirSync('./json/text/jp/subtitle');
        let subtitle = [];

        if (fileList.length > 0) {
            fileList.forEach((value) => {
                if (value !== 'hidden.json') {
                    subtitle = subtitle.concat(readJSON('text/jp/subtitle', value));
                }
            });
        }

        subtitle = sortArray(subtitle);
        console.log('subtitle:', subtitle);
        return subtitle;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function readJSONPure(path = '', name = '') {
    try {
        const dir = './json';
        const finalPath = path.includes(':') ? resolve(path, name) : resolve(dir, path, name);

        // parse
        let array = jsonFixer(readFileSync(finalPath).toString()).data;

        // log array
        console.log(`Read ${finalPath}. (length: ${array.length})`);

        return array;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function writeJSON(path = '', name = '', array = []) {
    try {
        const dir = './json';
        const finalPath = path.includes(':') ? resolve(path, name) : resolve(dir, path, name);
        writeFileSync(
            finalPath,
            JSON.stringify(array)
                .replaceAll('[[', '[\n\t[')
                .replaceAll('],["//comment",', '],\n\n\t["//comment",')
                .replaceAll('],[', '],\n\t[')
                .replaceAll(',"', ', "')
                .replaceAll(']]', ']\n]')
        );
    } catch (error) {
        console.log(error);
    }
}

function subArray(array, sub0, sub1) {
    if (!Array.isArray(array)) {
        return [];
    }

    if (!array.length > 0) {
        return [];
    }

    array.forEach((value, index, array) => {
        array[index] = [value[sub0], value[sub1]];
    });

    return array;
}

function clearArray(array) {
    if (!Array.isArray(array)) {
        return [];
    }

    if (!array.length > 0) {
        return [];
    }

    if (Array.isArray(array[0])) {
        // 2d
        for (let index = array.length - 1; index >= 0; index--) {
            const element = array[index];

            if (element[0].includes('//comment') || element[0] === 'N/A' || element[1] === 'N/A') {
                array.splice(index, 1);
            }
        }
    } else {
        // not 2d
        for (let index = array.length - 1; index >= 0; index--) {
            const element = array[index];
            if (element.includes('//comment')) {
                array.splice(index, 1);
            }
        }
    }

    return array;
}

function sortArray(array) {
    if (!Array.isArray(array)) {
        return [];
    }

    if (!array.length > 0) {
        return [];
    }

    if (Array.isArray(array[0])) {
        // 2d
        return array.sort((a, b) => b[0].length - a[0].length);
    } else {
        // not 2d
        return array.sort((a, b) => b.length - a.length);
    }
}

function combineArray(...args) {
    return [].concat(...args);
}

function combineArrayWithTemp(temp, ...args) {
    // remove index
    let tempIgnoreIndex = [];
    let combineIgnoreIndex = [];

    // combine without temp
    let combine = combineArray(...args);

    // search same element
    for (let tempIndex = 0; tempIndex < temp.length; tempIndex++) {
        const tempElement = temp[tempIndex];

        for (let combineIndex = 0; combineIndex < combine.length; combineIndex++) {
            const combineElement = combine[combineIndex];

            if (tempElement[0] === combineElement[0]) {
                if (tempElement[2] === 'temp') {
                    tempIgnoreIndex.push(tempIndex);
                } else {
                    combineIgnoreIndex.push(combineIndex);
                }
                break;
            }
        }
    }

    // clear temp array
    if (tempIgnoreIndex.length > 0) {
        tempIgnoreIndex.sort((a, b) => a - b);
        tempIgnoreIndex.reverse();
        for (let index = 0; index < tempIgnoreIndex.length; index++) {
            const element = tempIgnoreIndex[index];
            temp.splice(element, 1);
        }
    }

    // clear combine array
    if (combineIgnoreIndex.length > 0) {
        combineIgnoreIndex.sort((a, b) => a - b);
        combineIgnoreIndex.reverse();
        for (let index = 0; index < combineIgnoreIndex.length; index++) {
            const element = combineIgnoreIndex[index];
            combine.splice(element, 1);
        }
    }

    // combine temp
    temp = temp.map((x) => [x[0], x[1]]);
    combine = combineArray(temp, combine);

    return sortArray(combine);
}

exports.skipCheck = skipCheck;
exports.replaceText = replaceText;
exports.includesArrayItem = includesArrayItem;
exports.sameAsArrayItem = sameAsArrayItem;
exports.markFix = markFix;
exports.clearCode = clearCode;
exports.valueFixBefore = valueFixBefore;
exports.valueFixAfter = valueFixAfter;

exports.readJSON = readJSON;
exports.readJSONMain = readJSONMain;
exports.readJSONOverwrite = readJSONOverwrite;
exports.readJSONSubtitle = readJSONSubtitle;
exports.readJSONPure = readJSONPure;
exports.writeJSON = writeJSON;
exports.combineArray = combineArray;
exports.combineArrayWithTemp = combineArrayWithTemp;
