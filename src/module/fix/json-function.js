'use strict';

// file module
const fileModule = require('../system/file-module');

// path list
const pathList = {
  ch: 'src/data/text/ch',
  en: 'src/data/text/en',
  jp: 'src/data/text/jp',
  main: 'src/data/text/main',
  nonAI: 'src/data/text/non-ai',
};

// get text path
function getTextPath(dir = '', ...args) {
  return fileModule.getRootPath(pathList[dir], ...args);
}

// get user text path
function getUserTextPath(...args) {
  return fileModule.getUserDataPath('text', ...args);
}

// read text
function readText(path = '', sort = true, map = false, srcIndex = 0, rplIndex = 1) {
  if (rplIndex === -1) {
    return [];
  }

  try {
    let array = [];
    let data = fileModule.read(path, 'json');

    if (Array.isArray(data)) {
      array = data;
    } else {
      fileModule.write(path, '[]');
      throw path + ' is not an array.';
    }

    // check length of array of main
    if (path.includes('\\data\\text\\main\\')) {
      for (let index = array.length - 1; index >= 0; index--) {
        const element = array[index];

        if (element.length !== 4) {
          console.log('\r\nIncorrect data:', element);
          console.log('Path:', path);
          array.splice(index, 1);
        }
      }
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
  return readMultiFolder(fileModule.getRootPath(pathList.main), srcIndex, rplIndex);
}

// read non AI
function readNonAI(srcIndex = 0, rplIndex = 1) {
  return readMultiText(fileModule.getRootPath(pathList.nonAI), srcIndex, rplIndex);
}

// read multi text
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

// read multi folder
function readMultiFolder(targetPath = '', srcIndex = 0, rplIndex = 1) {
  try {
    const folderList = fileModule.readdir(targetPath);
    let array = [];

    if (folderList.length > 0) {
      folderList.forEach((folderName) => {
        const folderPath = fileModule.getPath(targetPath, folderName);
        const fileList = fileModule.readdir(folderPath);

        if (fileList.length > 0) {
          fileList.forEach((filename) => {
            if (filename !== 'hidden.json') {
              const filePath = fileModule.getPath(folderPath, filename);
              array = array.concat(readText(filePath, false, true, srcIndex, rplIndex));
            }
          });
        }
      });
    }

    return sortArray(array);
  } catch (error) {
    console.log(error);
    return [];
  }
}

// read user array
function readUserArray(userArray = {}) {
  userArray.customSource = readUserText('custom-source.json', false);
  userArray.customTarget = readUserText('custom-target.json', false);
  userArray.customOverwrite = readUserText('custom-overwrite.json', false);
  userArray.playerName = readUserText('player-name.json', false);
  userArray.tempName = readUserText('temp-name.json', false);
}

// read user text
function readUserText(name = '', sort = true) {
  return readText(getUserTextPath(name), sort);
}

// write user text
function writeUserText(name = '', data = []) {
  fileModule.write(getUserTextPath(name), data, 'json');
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
      const element0 = element[0];
      const element1 = element[1];

      if (typeof element0 === 'undefined' || typeof element1 === 'undefined' || /(\/\/comment)|(^N\/A$)|(^$)/gi.test(element0) || /(\/\/comment)|(^N\/A$)/gi.test(element1)) {
        array.splice(index, 1);
      }
    }
  } else {
    // not 2d
    for (let index = array.length - 1; index >= 0; index--) {
      const text = array[index];
      if (typeof text === 'undefined' || /(\/\/comment)|(^N\/A$)|(^$)/gi.test(text)) {
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

// combine array with user
function combineArray2(customArray = [], ...args) {
  // arrays
  const otherArrays = combineArray(...args);
  const otherNames = otherArrays.map((x) => x[0]);
  let customArray2 = [].concat(customArray).map((x) => [x[0], x[1]]);

  // compare names
  for (let index = customArray2.length - 1; index >= 0; index--) {
    const customElement = customArray2[index];
    const customName = customElement[0] || '';
    const targetIndex = Math.max(otherNames.indexOf(customName.replace(/#/g, '')), otherNames.indexOf(customName + '#'), otherNames.indexOf(customName + '##'));

    // remove elements from other array
    if (targetIndex >= 0) {
      otherArrays.splice(targetIndex, 1);
      otherNames.splice(targetIndex, 1);
    }
  }

  return combineArray(customArray2, otherArrays);
}

// create RegExp array
function createRegExpArray(array = []) {
  let newArray = [];

  for (let index = 0; index < array.length; index++) {
    try {
      newArray.push([new RegExp(array[index][0], 'gi'), array[index][1]]);
    } catch (error) {
      //console.log(error);
    }
  }

  return newArray;
}

// save user custom
function saveUserCustom(name = '', customArray = []) {
  if (name === '') return;

  // file names
  const fileNames = ['custom-source.json', 'custom-target.json', 'custom-overwrite.json', 'player-name.json', 'temp-name.json'];

  // delete or replace item which has same source
  for (let index = 0; index < customArray.length; index++) {
    const element = customArray[index];

    for (let index = 0; index < fileNames.length; index++) {
      const fileName = fileNames[index];

      if (fileName === name) {
        editUserCustom(fileName, element[0], element);
      } else {
        editUserCustom(fileName, element[0]);
      }
    }
  }
}

// edit user custom
function editUserCustom(name = '', target = '', item = null) {
  if (name === '') return;

  const array = readUserText(name, false);
  let isNotFound = true;

  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index];

    if (target.replace(/#+$/g, '') === element[0].replace(/#+$/g, '')) {
      isNotFound = false;

      if (item) {
        array[index] = item;
      } else {
        array.splice(index, 1);
      }

      break;
    }
  }

  if (item && isNotFound) {
    array.push(item);
  }

  writeUserText(name, array);
}

// delete temp-name.json
function deleteTemp() {
  fileModule.unlink(getUserTextPath('temp-name.json'));
}

// check array
function checkArray(array = []) {
  return Array.isArray(array) && array.length > 0;
}

// module exports
module.exports = {
  getTextPath,
  readText,
  readOverwriteEN,
  readOverwriteJP,
  readSubtitleEN,
  readSubtitleJP,
  readMain,
  readNonAI,
  readUserArray,
  readUserText,
  writeUserText,
  sortArray,
  combineArray,
  combineArray2,
  createRegExpArray,
  saveUserCustom,
  editUserCustom,
  deleteTemp,
};
