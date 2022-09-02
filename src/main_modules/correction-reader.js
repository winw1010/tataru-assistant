'use strict';

// file module
const fm = require('./file-module');

// read json
function readJSON(path = '', name = '', needSub = false, sub0 = 0, sub1 = 1) {
    try {
        const dir = './src/json';
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
        const fileList = readdirSync('./src/json/text/main');
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
        const fileList = readdirSync(`./src/json/${ch}/${directory}`);
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
        const fileList = readdirSync('./src/json/text/jp/subtitle');
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
        const dir = './src/json';
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
        const dir = './src/json';
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
