'use strict';

// jp json
const jpJson = require('./jp-json');

// config module
const configModule = require('../system/config-module');

// female words
const femaleWords = getFemaleWords();

// kana
const hiragana = getHiraganaString();
const katakana = getKatakanaString();

// reg
const regBrackets = /「|『|』|」/;

// Hiragana: ぁ-ゖ
// Katakana: ァ-ヺ
// Name: ー・＝
// Kanji: 一-龯
// Kanji: 一-龯
// Chinese: \u3400-\u9FFF

// katakana name
const regKatakanaName = /^[ 一-龯]*[ァ-ヺー・＝]+[ 一-龯？]*$/;
const regAllKatakanaName = /^[ァ-ヺー・＝]+$/;

// katakana front and back
const regKatakanaFB = /^[ァ-ヺ].*[ァ-ヺー]$/;
const regKatakanaF = /^[ァ-ヺ]/;
const regKatakanaB = /[ァ-ヺー]$/;

// no katakana
const katakanaWithoutSmall =
  'アイウエオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモヤユヨラリルレロワヰヱヲンヴ'; // remove ァィゥェォッャュョヮヵヶ
const regNoKatakanaF = `(?<![${getKatakanaString()}ー])`;
const regNoKatakanaB = `(?![${katakanaWithoutSmall}ー])`;

// kanji front and back
const regKanjiFB = /^[一-龯].*[一-龯]$/;
const regKanjiFB2 = /^[一-龯]$/;
const regKanjiF = /^[一-龯]/;
const regKanjiB = /[一-龯]$/;

// no kanji
const regNoKanjiF = '(?<![一-龯])';
const regNoKanjiB = '(?![一-龯])';

// kana
const regKana = /[ぁ-ゖァ-ヺー]/gi;

// jp text function
function replaceTextByCode(text = '', array = [], textType = 0, isTargetChinese = true) {
  if (text === '' || !Array.isArray(array) || !array.length > 0) {
    return {
      text: text,
      table: [],
      aiTable: [],
    };
  }

  const matchedWords = [];

  // determine text type
  if (textType === 2) {
    // find matched words
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      const name = element[0];
      const translatedName = element[1];

      if (text.includes(`「${name}」`)) {
        matchedWords.push([`「${name}」`, `「${translatedName}」`]);
      }

      if (text.includes(`『${name}』`)) {
        matchedWords.push([`『${name}』`, `『${translatedName}』`]);
      }

      if (name.length < 3) {
        continue;
      }

      if (text.includes(name)) {
        matchedWords.push(element);
      }
    }
  } else {
    // find temp array
    const temp = findTempArray(text, array);

    // find match words from temp array
    for (let index = 0; index < temp.length; index++) {
      const element = temp[index];
      const name = element[0];

      regBrackets.lastIndex = 0;
      regKatakanaFB.lastIndex = 0;
      regKatakanaF.lastIndex = 0;
      regKatakanaB.lastIndex = 0;

      // brackets
      if (regBrackets.test(name)) {
        matchedWords.push(element);
      }
      // katakana
      else if (regKatakanaFB.test(name)) {
        const matchReg = new RegExp(regNoKatakanaF + name + regNoKatakanaB, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      } else if (regKatakanaF.test(name)) {
        const matchReg = new RegExp(regNoKatakanaF + name, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      } else if (regKatakanaB.test(name)) {
        const matchReg = new RegExp(name + regNoKatakanaB, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      }
      // kanji
      else if (regKanjiFB.test(name) || regKanjiFB2.test(name)) {
        const matchReg = new RegExp(regNoKanjiF + name + regNoKanjiB, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      } else if (regKanjiF.test(name)) {
        const matchReg = new RegExp(regNoKanjiF + name, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      } else if (regKanjiB.test(name)) {
        const matchReg = new RegExp(name + regNoKanjiB, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      }
      // else
      else {
        if (text.includes(name)) {
          matchedWords.push(element);
        }
      }
    }
  }

  const result = isTargetChinese ? findTable(text, matchedWords) : findTableOther(text, matchedWords);
  console.log('Result:', result);
  return result;
}

function findTempArray(text = '', array = []) {
  let temp = [];

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    const name = element[0];
    const translatedName = element[1];
    const hiraName1 = convertKana(element[0], 'hira');
    const hiraName2 = hiraFix(hiraName1);

    regAllKatakanaName.lastIndex = 0;

    if (text.includes(name)) {
      temp.push([name, translatedName]);
    }

    if (text.includes(`「${name}」`)) {
      temp.push([`「${name}」`, `「${translatedName}」`]);
    }

    if (text.includes(`『${name}』`)) {
      temp.push([`『${name}』`, `『${translatedName}』`]);
    }

    if (name.length < 3 || !regAllKatakanaName.test(name)) {
      continue;
    }

    // hira name 1
    /*
    //NG くれない
    if (text.includes(hiraName1) && hiraName1.length > 3) {
      temp.push([hiraName1, translatedName]);
    }
    */

    if (text.includes(`「${hiraName1}」`)) {
      temp.push([`「${hiraName1}」`, `「${translatedName}」`]);
    }

    if (text.includes(`『${hiraName1}』`)) {
      temp.push([`『${hiraName1}』`, `『${translatedName}』`]);
    }

    // hira name 2
    /*
    if (text.includes(hiraName2) && hiraName2.length > 3) {
      temp.push([hiraName2, translatedName]);
    }
    */

    if (text.includes(`「${hiraName2}」`)) {
      temp.push([`「${hiraName2}」`, `「${translatedName}」`]);
    }

    if (text.includes(`『${hiraName2}』`)) {
      temp.push([`『${hiraName2}』`, `『${translatedName}』`]);
    }
  }

  return temp.sort((a, b) => b[0].length - a[0].length);
}

function findTable(text = '', matchedWords = []) {
  const titleArray = jpJson.getJpArray().title;
  const srcIndex = 0;
  const rplIndex = 1;
  let codeIndex = 0;
  let codeString = 'BCFGJLMNPRSTVWXYZ';
  let table = [];
  let aiTable = [];

  // clear code
  const characters = text.match(/[a-z]/gi);
  if (characters) {
    for (let index = 0; index < characters.length; index++) {
      codeString = codeString.replace(characters[index].toUpperCase(), '');
    }
  }

  console.log('Remain Codes:', codeString);

  // search and replace
  for (let eleIndex = 0; eleIndex < matchedWords.length && codeIndex < codeString.length; eleIndex++) {
    const element = matchedWords[eleIndex];

    for (let fixIndex = 0; fixIndex < titleArray.length; fixIndex++) {
      try {
        const title = titleArray[fixIndex];
        const sorceName = title[0][1] === 0 ? title[0][0] + element[srcIndex] : element[srcIndex] + title[0][0];
        const replaceName = title[1][1] === 0 ? title[1][0] + element[rplIndex] : element[rplIndex] + title[1][0];

        if (title[2]) {
          const exceptionName = title[2][1] === 0 ? title[2][0] + element[srcIndex] : element[srcIndex] + title[2][0];
          if (text.includes(sorceName) && !text.includes(exceptionName)) {
            text = text.replaceAll(sorceName, codeString[codeIndex]);
            table.push([codeString[codeIndex], replaceName]);
            aiTable.push([sorceName, replaceName]);
            codeIndex++;
          }
        } else {
          if (text.includes(sorceName)) {
            text = text.replaceAll(sorceName, codeString[codeIndex]);
            table.push([codeString[codeIndex], replaceName]);
            aiTable.push([sorceName, replaceName]);
            codeIndex++;
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  const middleArray = ['Traditional-Chinese', 'Simplified-Chinese'].includes(configModule.getConfig().translation.to)
    ? [
        ['の', '的'], // AのB
        ['：', '：'], // A：B
        ['', ''], // AB
      ]
    : [];

  for (let index = 0; index < middleArray.length && codeIndex < codeString.length; index++) {
    const element = middleArray[index];
    const result = mergeCode(text, table, codeIndex, codeString, element[0], element[1]);
    text = result.text;
    codeIndex = result.codeIndex;
  }

  return {
    text,
    table,
    aiTable,
  };
}

function findTableOther(text = '', matchedWords = []) {
  const srcIndex = 0;
  const rplIndex = 1;
  let codeIndex = 0;
  let codeString = 'BCFGJLMNPRSTVWXYZ';
  let table = [];
  let aiTable = [];

  // clear code
  const characters = text.match(/[a-z]/gi);
  if (characters) {
    for (let index = 0; index < characters.length; index++) {
      codeString = codeString.replace(characters[index].toUpperCase(), '');
    }
  }

  console.log('Remain Codes:', codeString);

  // search and replace
  for (let eleIndex = 0; eleIndex < matchedWords.length && codeIndex < codeString.length; eleIndex++) {
    try {
      const element = matchedWords[eleIndex];
      const sorceName = element[srcIndex];
      const replaceName = element[rplIndex];

      if (text.includes(sorceName)) {
        text = text.replaceAll(sorceName, codeString[codeIndex]);
        table.push([codeString[codeIndex], replaceName]);
        aiTable.push([sorceName, replaceName]);
        codeIndex++;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return {
    text,
    table,
    aiTable,
  };
}

/*
function replaceTextByCode(text = '', array = [], textType = 0) {
  if (text === '' || !Array.isArray(array) || !array.length > 0) {
    return {
      text: text,
      table: [],
    };
  }

  if (textType !== 2) {
    // miqo'te tribes
    // text = text.replace(/(?<![ァ-ヺー・＝])[ァ-ヺ]族(?![ァ-ヺー・＝#])/gi, '$&#');

    // 2 words name
    text = text.replace(/(?<![ァ-ヺー・＝])[ァ-ヺー]{2}(?![ァ-ヺー・＝#])/gi, '$&#');
  }

  // set parameters
  const nameFixArray = jpJson.getJpArray().title;
  const srcIndex = 0;
  const rplIndex = 1;
  let codeIndex = 0;
  let codeString = 'BCFGHJLMNPQRSTVWXYZ';
  let tempText = text;
  let tempTable = [];
  let table = [];

  // create temp table
  for (let index = 0; index < array.length; index++) {
    const element = array[index];

    // hira name
    if (element[srcIndex].length > 2) {
      const hiraElement = convertKana(element[srcIndex], 'hira');
      const hiraElement2 = hiraFix(hiraElement);

      if (tempText.includes('「' + hiraElement + '」')) {
        tempTable.push(['「' + hiraElement + '」', '「' + element[rplIndex] + '」']);
        tempText = tempText.replaceAll('「' + hiraElement + '」', '*');
      }

      if (tempText.includes('『' + hiraElement + '』')) {
        tempTable.push(['『' + hiraElement + '』', '『' + element[rplIndex] + '』']);
        tempText = tempText.replaceAll('『' + hiraElement + '』', '*');
      }

      if (tempText.includes('「' + hiraElement2 + '」')) {
        tempTable.push(['「' + hiraElement2 + '」', '「' + element[rplIndex] + '」']);
        tempText = tempText.replaceAll('「' + hiraElement2 + '」', '*');
      }

      if (tempText.includes('『' + hiraElement2 + '』')) {
        tempTable.push(['『' + hiraElement2 + '』', '『' + element[rplIndex] + '』']);
        tempText = tempText.replaceAll('『' + hiraElement2 + '』', '*');
      }
    }

    // brackets
    if (tempText.includes('「' + element[srcIndex] + '」')) {
      tempTable.push(['「' + element[srcIndex] + '」', '「' + element[rplIndex] + '」']);
      tempText = tempText.replaceAll('「' + element[srcIndex] + '」', '*');
    }

    if (tempText.includes('『' + element[srcIndex] + '』')) {
      tempTable.push(['『' + element[srcIndex] + '』', '『' + element[rplIndex] + '』']);
      tempText = tempText.replaceAll('『' + element[srcIndex] + '』', '*');
    }

    // normal
    if (tempText.includes(element[srcIndex])) {
      tempTable.push([element[srcIndex], element[rplIndex]]);
      tempText = tempText.replaceAll(element[srcIndex], '*');
    }
  }

  // sort temp table
  tempTable = tempTable.sort((a, b) => b[0].length - a[0].length);

  // reset temp text
  tempText = text;

  // clear code
  const characters = tempText.match(/[a-z]/gi);
  if (characters) {
    for (let index = 0; index < characters.length; index++) {
      codeString = codeString.replaceAll(characters[index].toUpperCase(), '');
    }
  }

  // search and replace
  for (let eleIndex = 0; eleIndex < tempTable.length && codeIndex < codeString.length; eleIndex++) {
    const element = tempTable[eleIndex];

    for (let fixIndex = 0; fixIndex < nameFixArray.length; fixIndex++) {
      try {
        const nameFix = nameFixArray[fixIndex];
        const sorceName = nameFix[0][1] === 0 ? nameFix[0][0] + element[srcIndex] : element[srcIndex] + nameFix[0][0];
        const replaceName = nameFix[1][1] === 0 ? nameFix[1][0] + element[rplIndex] : element[rplIndex] + nameFix[1][0];

        if (nameFix[2]) {
          const exceptionName =
            nameFix[2][1] === 0 ? nameFix[2][0] + element[srcIndex] : element[srcIndex] + nameFix[2][0];
          if (text.includes(sorceName) && !text.includes(exceptionName)) {
            text = text.replaceAll(sorceName, codeString[codeIndex]);
            table.push([codeString[codeIndex], replaceName]);
            codeIndex++;
          }
        } else {
          if (text.includes(sorceName)) {
            text = text.replaceAll(sorceName, codeString[codeIndex]);
            table.push([codeString[codeIndex], replaceName]);
            codeIndex++;
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  // remove #
  text = text.replaceAll('#', '');

  const result = {
    text: text,
    table: table,
  };

  console.log('tempTable:', tempTable);
  console.log('codeString:', codeString);
  console.log('result:', result);

  return result;
}
*/

function specialReplace(text = '', array = []) {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    text = text.replace(element[0], element[1]);
    element[0].lastIndex = 0;
  }
  return text;
}

function mergeCode(text = '', table = [], codeIndex = 0, codeString = '', middle1 = '', middle2 = '') {
  for (let index1 = 0; index1 < table.length && codeIndex < codeString.length; index1++) {
    const element1 = table[index1];

    for (let index2 = 0; index2 < table.length && codeIndex < codeString.length; index2++) {
      const element2 = table[index2];
      const name1 = element1[0] + middle1 + element2[0];
      const name2 = element1[1] + middle2 + element2[1];

      if (text.includes(name1)) {
        text = text.replaceAll(name1, codeString[codeIndex]);
        table.push([codeString[codeIndex], name2]);
        codeIndex++;
      }
    }
  }

  return { text, codeIndex };
}

function convertKana(text = '', type = '') {
  switch (type) {
    case 'hira':
      for (let index = 0; index < katakana.length; index++) {
        text = text.replaceAll(katakana[index], hiragana[index]);
      }
      break;

    case 'kata':
      for (let index = 0; index < hiragana.length; index++) {
        text = text.replaceAll(hiragana[index], katakana[index]);
      }
      break;

    default:
      break;
  }

  return text;
}

function reverseKana(text = '') {
  let newString = '';
  for (let index = 0; index < text.length; index++) {
    const word = text[index];

    if (/[ぁ-ゖ]/.test(word)) {
      newString += convertKana(word, 'kata');
    } else if (/[ァ-ヺ]/.test(word)) {
      newString += convertKana(word, 'hira');
    } else {
      newString += word;
    }
  }

  return newString;
}

function hiraFix(text = '') {
  text = text.replace(/([あかさたなはまらがざだばぱやわ])ー/gi, '$1あ');
  text = text.replace(/([いきしちにひみりぎじぢびぴ])ー/gi, '$1い');
  text = text.replace(/([うくすつぬふむるぐずづぶぷゆ])ー/gi, '$1う');
  text = text.replace(/([えけせてねへめれげぜでべぺ])ー/gi, '$1え');
  text = text.replace(/([おこそとのほもろごぞどぼぽよを])ー/gi, '$1お');

  text = text.replaceAll('ゔぁ', 'ば');
  text = text.replaceAll('ゔぃ', 'び');
  text = text.replaceAll('ゔぇ', 'べ');
  text = text.replaceAll('ゔぉ', 'ぼ');
  text = text.replaceAll('ゔ', 'ぶ');

  return text;
}

function needTranslation(text = '', table = []) {
  for (let index = 0; index < table.length; index++) {
    const element = table[index];
    text = text.replaceAll(element[0], '');
  }

  return /[ぁ-ゖァ-ヺ\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF]/gi.test(text);
}

function genderFix(originalText = '', translatedText = '') {
  const isFemale = new RegExp(femaleWords.join('|'), 'gi').test(originalText);

  if (!isFemale) {
    translatedText = translatedText.replaceAll('她', '他').replaceAll('小姐', '').replaceAll('女王', '王');
  }

  /*
  if (!originalText.includes('娘')) {
    translatedText = translatedText.replaceAll('女兒', '女孩');
  }
  */

  return translatedText;
}

function isKatakanaName(name = '') {
  regKatakanaName.lastIndex = 0;
  return regKatakanaName.test(name);
}

function getKatakanaName(name = '') {
  if (isKatakanaName(name)) {
    return /[ァ-ヺー・＝]+/.exec(name)[0];
  } else {
    // other
    return '';
  }
}

function isChinese(text = '') {
  regKana.lastIndex = 0;
  return !regKana.test(text);
}

function getFemaleWords() {
  return ['女', '娘', '嬢', '母', 'マザー', 'ピクシー', 'ティターニア', 'クイーン'];
}

function getHiraganaString() {
  return 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ';
}

function getKatakanaString() {
  return 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ';
}

// module exports
module.exports = {
  replaceTextByCode,
  specialReplace,
  convertKana,
  reverseKana,
  needTranslation,
  genderFix,
  isKatakanaName,
  getKatakanaName,
  isChinese,
};
