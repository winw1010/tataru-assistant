'use strict';

// file module
const fileModule = require('../system/file-module');

// all kana
const allKana = /^[ぁ-ゖァ-ヺ]+$/gi;

// path list
const pathList = {
    ch: 'src/json/text/ch',
    en: 'src/json/text/en',
    jp: 'src/json/text/jp',
    main: 'src/json/text/main',
};

// get text path
function getTextPath(dir, ...args) {
    return fileModule.getRootPath(pathList[dir], ...args);
}

// get temp text path
function getTempTextPath(...args) {
    return fileModule.getUserDataPath('temp', ...args);
}

// read text
function readText(path, sort = true, map = false, srcIndex = 0, rplIndex = 1) {
    try {
        let array = fileModule.read(path, 'json');

        if (!Array.isArray(array)) {
            throw path + ' is not an array.';
        }

        // map array
        if (map) {
            array = mapArray(array, srcIndex, rplIndex);
        }

        // clear array
        array = clearArray(array);

        // sort array
        if (sort) {
            array = sortArray(array);
        }

        return array;
    } catch (error) {
        console.log(error);
        fileModule.write(path, [], 'json');
        return [];
    }
}

// read overwrite EN
function readOverwriteEN(rplIndex) {
    return readMultiText(fileModule.getRootPath(pathList.ch, 'overwrite-en'), 0, rplIndex);
}

// read overwrite JP
function readOverwriteJP(rplIndex) {
    return readMultiText(fileModule.getRootPath(pathList.ch, 'overwrite-jp'), 0, rplIndex);
}

// read subtitle EN
function readSubtitleEN() {
    return readMultiText(fileModule.getRootPath(pathList.en, 'subtitle'), 0, 1);
}

// read subtitle JP
function readSubtitleJP() {
    return readMultiText(fileModule.getRootPath(pathList.jp, 'subtitle'), 0, 1);
}

// read main
function readMain(srcIndex, rplIndex) {
    return readMultiText(fileModule.getRootPath(pathList.main), srcIndex, rplIndex);
}

// read multi texts
function readMultiText(filePath, srcIndex, rplIndex) {
    try {
        const fileList = fileModule.readdir(filePath);
        let array = [];

        if (fileList.length > 0) {
            fileList.forEach((value) => {
                if (value !== 'hidden.json') {
                    array = array.concat(readText(fileModule.getPath(filePath, value), false, true, srcIndex, rplIndex));
                }
            });
        }

        array = sortArray(array);
        return array;
    } catch (error) {
        console.log(error);
        return [];
    }
}

// map array
function mapArray(array, index0, index1) {
    if (!checkArray(array)) {
        return [];
    }

    array.forEach((value, index, array) => {
        array[index] = [value[index0], value[index1]];
    });

    return array;
}

// clear array
function clearArray(array) {
    if (!checkArray(array)) {
        return [];
    }

    if (Array.isArray(array[0])) {
        // 2d
        for (let index = array.length - 1; index >= 0; index--) {
            const element = array[index];

            if (element[0].includes('//comment') || element[0] === 'N/A' || element[0] === '' || element[1].includes('//comment') || element[1] === 'N/A') {
                array.splice(index, 1);
            }
        }
    } else {
        // not 2d
        for (let index = array.length - 1; index >= 0; index--) {
            const element = array[index];
            if (element.includes('//comment') || element === 'N/A' || element === '') {
                array.splice(index, 1);
            }
        }
    }

    return array;
}

// sort array
function sortArray(array) {
    if (!checkArray(array)) {
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

// combine array
function combineArray(...args) {
    return sortArray([].concat(...args));
}

// combine array with temp
function combineArrayWithTemp(temp, ...args) {
    // ignore index
    let tempIgnoreIndex = [];
    let combineIgnoreIndex = [];

    // combine array
    let combine = combineArray(...args);

    // search same name and delete it
    const combine0 = combine.map((x) => x[0]);
    temp.forEach((tempElement, tempIndex) => {
        const targetIndex1 = combine0.indexOf(tempElement[0]);
        const targetIndex2 = combine0.indexOf(tempElement[0] + '#');

        // delete name
        if (targetIndex1 >= 0) {
            if (tempElement[2] === 'temp') {
                // from temp
                if (!tempIgnoreIndex.includes(tempIndex)) tempIgnoreIndex.push(tempIndex);
            } else {
                // from combine
                if (!combineIgnoreIndex.includes(targetIndex1)) combineIgnoreIndex.push(targetIndex1);
            }
        }

        // delete name#
        if (targetIndex2 >= 0) {
            if (tempElement[2] === 'temp') {
                // from temp
                if (!tempIgnoreIndex.includes(tempIndex)) tempIgnoreIndex.push(tempIndex);
            } else {
                // from combine
                if (!combineIgnoreIndex.includes(targetIndex2)) combineIgnoreIndex.push(targetIndex2);
            }
        }

        // delete name from temp which length < 3
        if (tempElement[0].length === 1 || (tempElement[0].length < 3 && allKana.test(tempElement[0]))) {
            if (!tempIgnoreIndex.includes(tempIndex)) tempIgnoreIndex.push(tempIndex);
        }
    });

    // delete name from temp
    if (tempIgnoreIndex.length > 0) {
        tempIgnoreIndex.sort((a, b) => b - a);
        for (let index = 0; index < tempIgnoreIndex.length; index++) {
            const element = tempIgnoreIndex[index];
            temp.splice(element, 1);
        }

        // update temp
        fileModule.write(fileModule.getPath(fileModule.getUserDataPath('temp'), 'chTemp.json'), temp, 'json');
    }

    // delete name from combine
    if (combineIgnoreIndex.length > 0) {
        combineIgnoreIndex.sort((a, b) => b - a);
        for (let index = 0; index < combineIgnoreIndex.length; index++) {
            const element = combineIgnoreIndex[index];
            combine.splice(element, 1);
        }
    }

    // sub temp
    temp = temp.map((x) => [x[0], x[1]]);

    return combineArray(temp, combine);
}

// check array
function checkArray(array) {
    return Array.isArray(array) && array.length > 0;
}

// module exports
module.exports = {
    getTextPath,
    getTempTextPath,
    readText,
    readOverwriteEN,
    readOverwriteJP,
    readSubtitleEN,
    readSubtitleJP,
    readMain,
    combineArrayWithTemp,
};
