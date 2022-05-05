'use strict';

// path
const { resolve } = require('path');

// fs
const { readFileSync, writeFileSync, readdirSync } = require('fs');

// json fixer
const jsonFixer = require('json-fixer');

// translator
const translatorModule = require('./translator-module');

// text function
function skipCheck(code, name, text, ignoreArray) {
    return (name + text).includes('') || (['0039', '0839'].includes(code) && canIgnore(text, ignoreArray));
}

function canIgnore(text, ignoreArray) {
    if (text === '') {
        return false;
    }

    if (!Array.isArray(ignoreArray)) {
        return false;
    }

    for (let index = 0; index < ignoreArray.length; index++) {
        if (text.match(new RegExp(ignoreArray[index], 'gi'))) {
            return true;
        }
    }

    return false
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

async function translate(text, translation) {
    text = await translatorModule.translate(text, translation.engine, translation.from, translation.to, translation.autoChange);
    return text;
}

function markFix(text) {
    // remove （）
    text = text.replaceAll(/（.*?）/gi, '');

    // remove ()
    text = text.replaceAll(/\\(.*?\\)/gi, '');

    // fix 「「
    const matchStrings2 = text.match(/「[^」]*?「/gi);
    if (matchStrings2) {
        matchStrings2.forEach((value) => {
            text = text.replaceAll(value, `「${value.replaceAll('「','')}」`);
        });
    }

    // fix 」」
    const matchStrings3 = text.match(/」[^「]*?」/gi);
    if (matchStrings3) {
        matchStrings3.forEach((value) => {
            text = text.replaceAll(value, `「${value.replaceAll('」','')}」`);
        });
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

// json function
function readJSON(path = '', name = '', needSub = false, sub0 = 0, sub1 = 1) {
    try {
        const dir = './json';
        const finalPath = resolve(dir, path, name);

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
        console.log(`Read ${path}/${name}. (length: ${array.length})`);

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
            fileList.forEach((file) => {
                if (file !== 'hidden.json') {
                    mainArray = mainArray.concat(readJSON('text/main', file, true, sub0, sub1));
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

function readJSONOverwrite(ch) {
    try {
        const fileList = readdirSync(`./json/${ch}/overwrite`);
        let overwrite = [];

        if (fileList.length > 0) {
            fileList.forEach((file) => {
                if (file !== 'hidden.json') {
                    overwrite = overwrite.concat(readJSON(`${ch}/overwrite`, file));
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
            fileList.forEach((file) => {
                if (file !== 'hidden.json') {
                    subtitle = subtitle.concat(readJSON('text/jp/subtitle', file));
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
        const finalPath = resolve(dir, path, name);

        // parse
        let array = jsonFixer(readFileSync(finalPath).toString()).data;

        // log array
        console.log(`Read ${path}/${name}. (length: ${array.length})`);

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
            if (element[0].includes('//comment') || element[0] === 'N/A' || element[1] === 'N/A' || /[.+?!=^$<>()-\\]/gi.test(element[0])) {
                array.splice(index, 1);
            } else if (element[0].includes('*')) {
                array[index][0] = array[index][0].replaceAll('*', '#');
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

exports.skipCheck = skipCheck;
exports.includesArrayItem = includesArrayItem;
exports.sameAsArrayItem = sameAsArrayItem;
exports.translate = translate;
exports.markFix = markFix;
exports.clearCode = clearCode;

exports.readJSON = readJSON;
exports.readJSONMain = readJSONMain;
exports.readJSONOverwrite = readJSONOverwrite;
exports.readJSONSubtitle = readJSONSubtitle;
exports.readJSONPure = readJSONPure;
exports.writeJSON = writeJSON;
exports.combineArray = combineArray;
exports.combineArrayWithTemp = combineArrayWithTemp;