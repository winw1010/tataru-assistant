'use strict';

// path
const { resolve } = require('path');

// fs
const { readFileSync, writeFileSync, readdirSync } = require('fs');

// json fixer
const jsonFixer = require('json-fixer');

// text function
function exceptionCheck(code, name, text, array) {
    return text.includes('') || (['0039', '0839'].includes(code) && includesArrayItem(name + text, array));
}

function includesArrayItem(text, array, searchIndex = 0) {
    if (text === '') {
        return false;
    }

    if (!Array.isArray(array)) {
        return false;
    }

    if (Array.isArray(array[0])) {
        for (let index = 0; index < array.length; index++) {
            const item = array[index];

            if (text.includes(item[searchIndex])) {
                return true;
            }
        }
    } else {
        for (let index = 0; index < array.length; index++) {
            const item = array[index];

            if (text.includes(item)) {
                return true;
            }
        }
    }

    return false
}

function sameAsArrayItem(text, array, searchIndex = 0) {
    if (text === '') {
        return false;
    }

    if (!Array.isArray(array)) {
        return false;
    }

    if (Array.isArray(array[0])) {
        for (let index = 0; index < array.length; index++) {
            const item = array[index];

            if (text === item[searchIndex]) {
                return true;
            }
        }
    } else {
        return array.includes(text);
    }

    return false;
}

function arrayString(array, itemIndex) {
    let string = '';

    for (let index = 0; index < array.length; index++) {
        string += array[index][itemIndex];
    }

    return string;
}

function caiyunFix(text) {
    // remove caiyun's （）
    if (text.includes('（') && text.includes('）')) {
        let temp = text.split('（');

        for (let index = 0; index < temp.length; index++) {
            if (temp[index].includes('）')) {
                temp[index] = temp[index].slice(temp[index].indexOf('）') + 1);
            }
        }

        text = temp.join('');
    }

    // remove caiyun's ()
    if (text.includes('(') && text.includes(')')) {
        let temp = text.split('(');

        for (let index = 0; index < temp.length; index++) {
            if (temp[index].includes(')')) {
                temp[index] = temp[index].slice(temp[index].indexOf(')') + 1);
            }
        }

        text = temp.join('');
    }

    // caiyun's 「」
    if (text.includes('”') && !text.includes('“')) {
        let temp = text.split('”');

        for (let index = 0; index < temp.length - 1; index++) {
            temp[index] += (index % 2 === 0) ? '「' : '」';
        }

        text = temp.join('');
    }

    if (text.includes('」') && !text.includes('「')) {
        let temp = text.split('」');

        for (let index = 0; index < temp.length - 1; index++) {
            temp[index] += (index % 2 === 0) ? '「' : '」';
        }

        text = temp.join('');
    }

    return text;
}

function clearCode(text, table) {
    if (table.length > 0) {
        table.forEach((value) => {
            text = text.replaceAll(value[0].toLowerCase(), value[0].toUpperCase());
            text = text.replaceAll(' ' + value[0], value[0]);
            text = text.replaceAll(value[0] + ' ', value[0]);

            while (text.includes(value[0] + value[0])) {
                text = text.replaceAll(value[0] + value[0], value[0]);
            };
        });
    }

    return text;
}

// json function
function readJSON(path = '', name = '', needSub = false, sub0 = 0, sub1 = 1) {
    try {
        const dir = './json';
        const finalPath = resolve(dir, path, name);

        // parse
        let array = jsonFixer(readFileSync(finalPath).toString()).data;

        if (!Array.isArray(array)) {
            console.log(name + '.json is not an array.');
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
        console.log(`${name}.json has been loaded. (${array.length})`);

        return array;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function readJSONMain(sub0, sub1) {
    try {
        const fileList = readdirSync('./json/text/main');
        let mainArray = [];

        if (fileList.length > 0) {
            fileList.forEach((file) => {
                if (file !== 'hidden.json') {
                    mainArray = mainArray.concat(readJSON('text/main', file, true, sub0, sub1));
                };
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

function readJSONOverwrite(ch) {
    try {
        const fileList = readdirSync(`./json/${ch}/overwrite`);
        let overwrite = [];

        if (fileList.length > 0) {
            fileList.forEach((file) => {
                if (file !== 'hidden.json') {
                    overwrite = overwrite.concat(readJSON(`${ch}/overwrite`, file));
                };
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
            fileList.forEach((file) => {
                if (file !== 'hidden.json') {
                    subtitle = subtitle.concat(readJSON('text/jp/subtitle', file));
                };
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
        const finalPath = resolve(dir, path, name);

        // parse
        let array = jsonFixer(readFileSync(finalPath).toString()).data;

        // log array
        console.log(`${name}.json has been loaded. (${array.length})`);

        return array;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function writeJSON(path = '', name = '', array = []) {
    try {
        const dir = './json';
        const finalPath = resolve(dir, path, name);
        writeFileSync(finalPath, JSON.stringify(array)
            .replaceAll('],[', '],\n\t[')
            .replaceAll(']]', ']\n]')
            .replaceAll('["//comment"', '\n\t["//comment"'));
    } catch (error) {

    }
}

function subArray(array, sub0, sub1) {
    if (!Array.isArray(array)) {
        return []
    }

    if (!array.length > 0) {
        return []
    }

    array.forEach((value, index, array) => {
        array[index] = [value[sub0], value[sub1]];
    });

    return array;
}

function clearArray(array) {
    if (!Array.isArray(array)) {
        return []
    }

    if (!array.length > 0) {
        return []
    }

    if (Array.isArray(array[0])) {
        // 2d
        for (let index = array.length - 1; index >= 0; index--) {
            const element = array[index];
            if (element[0].includes('//comment') || element[1] === 'N/A') {
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
        return []
    }

    if (!array.length > 0) {
        return []
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
    // combine without temp
    let combine = combineArray(...args);

    // delete same item
    temp.forEach((value) => {
        for (let index = 0; index < combine.length; index++) {
            const item = combine[index];

            if (value[0] === item[0]) {
                combine.splice(index, 1);
                break;
            }
        }
    });

    // combine temp
    combine = combineArray(temp, combine);

    return sortArray(combine);
}

exports.exceptionCheck = exceptionCheck;
exports.includesArrayItem = includesArrayItem;
exports.sameAsArrayItem = sameAsArrayItem;
exports.arrayString = arrayString;
exports.caiyunFix = caiyunFix;
exports.clearCode = clearCode;

exports.readJSON = readJSON;
exports.readJSONMain = readJSONMain;
exports.readJSONOverwrite = readJSONOverwrite;
exports.readJSONSubtitle = readJSONSubtitle;
exports.readJSONPure = readJSONPure;
exports.writeJSON = writeJSON;
exports.combineArray = combineArray;
exports.combineArrayWithTemp = combineArrayWithTemp;