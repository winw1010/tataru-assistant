'use strict';

// file module
const fileModule = require('../system/file-module');

// path list
const pathList = {
  ch: 'src/data/text/ch',
  en: 'src/data/text/en',
  jp: 'src/data/text/jp',
  main: 'src/data/text/main',
};

// kanji
const regKanji = /\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF/;

// get text path
function getTextPath(dir = '', ...args) {
  return fileModule.getRootPath(pathList[dir], ...args);
}

// get temp text path
function getTempTextPath(...args) {
  return fileModule.getUserDataPath('temp', ...args);
}

// read text
function readText(path = '', sort = true, map = false, srcIndex = 0, rplIndex = 1) {
  try {
    let array = [];
    let data = fileModule.read(path, 'json');

    if (Array.isArray(data)) {
      array = data;
    } else {
      console.log(path + ' is not an array.');
      fileModule.write(path, '[]');
      return array;
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
    return [];
  }
}

// read overwrite EN
function readOverwriteEN(rplIndex = 1) {
  return readMultiText(fileModule.getRootPath(pathList.ch, 'overwrite-en'), 0, rplIndex);
}

// read overwrite JP
function readOverwriteJP(rplIndex = 1) {
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
function readMain(srcIndex = 0, rplIndex = 1) {
  return readMultiText(fileModule.getRootPath(pathList.main), srcIndex, rplIndex);
}

// read multi texts
function readMultiText(filePath = '', srcIndex = 0, rplIndex = 1) {
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

    return sortArray(array);
  } catch (error) {
    console.log(error);
    return [];
  }
}

// read temp
function readTemp(name = '', sort = true) {
  return readText(getTempTextPath(name), sort);
}

// write temp
function writeTemp(name = '', data = []) {
  fileModule.write(getTempTextPath(name), data, 'json');
}

// map array
function mapArray(array = [], index0 = 0, index1 = 1) {
  if (!checkArray(array)) {
    return [];
  }

  array.forEach((value, index, array) => {
    array[index] = [value[index0], value[index1]];
  });

  return array;
}

// clear array
function clearArray(array = []) {
  if (!checkArray(array)) {
    return [];
  }

  if (Array.isArray(array[0])) {
    // 2d
    for (let index = array.length - 1; index >= 0; index--) {
      const element = array[index];

      if (/(\/\/comment)|(^N\/A$)|(^$)/gi.test(element[0]) || /(\/\/comment)|(^N\/A$)/gi.test(element[1])) {
        array.splice(index, 1);
      }
    }
  } else {
    // not 2d
    for (let index = array.length - 1; index >= 0; index--) {
      const element = array[index];
      if (/(\/\/comment)|(^N\/A$)|(^$)/gi.test(element)) {
        array.splice(index, 1);
      }
    }
  }

  return array;
}

// sort array
function sortArray(array = []) {
  if (!checkArray(array)) {
    return [];
  }

  if (Array.isArray(array[0])) {
    if (Array.isArray(array[0][0])) {
      // 3d
      return array.sort((a, b) => b[0][0].length - a[0][0].length);
    } else {
      // 2d
      return array.sort((a, b) => b[0].length - a[0].length);
    }
  } else {
    // 1d
    return array.sort((a, b) => b.length - a.length);
  }
}

// combine array
function combineArray(...args) {
  return sortArray([].concat(...args));
}

// combine array with temp
function combineArrayWithTemp(temp = [], ...args) {
  // array
  const combine = combineArray(...args);
  const combine0 = combine.map((x) => x[0]);
  let combineTemp = [].concat(temp);

  // search same name in temp and add its index to delete list
  for (let index = combineTemp.length - 1; index >= 0; index--) {
    const tempElement = combineTemp[index];
    const tempName = tempElement[0] || '';
    const tempType = tempElement[2] || '';
    const tempIndex = index;
    const targetIndex = Math.max(combine0.indexOf(tempName), combine0.indexOf(tempName + '#'));

    // delete element
    if (
      tempType === 'temp' ||
      (tempType !== '' && !regKanji.test(tempName) && tempName.length < 3 && !tempName.length.includes('#'))
    ) {
      // delete element from temp
      combineTemp.splice(tempIndex, 1);
    } else if (tempType === 'temp-npc') {
      // delete element from temp-npc
      if (targetIndex >= 0) {
        combineTemp.splice(tempIndex, 1);
      }
    } else {
      // delete element from combine
      if (targetIndex >= 0) {
        combine.splice(tempIndex, 1);
      }
    }
  }

  // sub combine temp
  combineTemp = combineTemp.map((x) => [x[0], x[1]]);

  return combineArray(combineTemp, combine);
}

// check array
function checkArray(array = []) {
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
  readTemp,
  writeTemp,
  sortArray,
  combineArray,
  combineArrayWithTemp,
};
