'use strict';

// jp json
const jpJson = require('./jp-json');

// female words
const femaleWords = getFemaleWords();

// kana
const hiragana = getHiraganaString();
const katakana = getKatakanaString();

// reg
const regBrackets = /「|『|』|」/;
const regAllKatakana = /^[ァ-ヺー・＝]+$/;
const regKatakanaFront = /^[ァ-ヺー・＝].*[^ァ-ヺー・＝]$/;
const regKatakanaBack = /^[^ァ-ヺー・＝].*[ァ-ヺー・＝]$/;
const noKatakanaFront = '(?<![ァ-ヺ])';
const noKatakanaBack = '(?![ァ-ヺ])';

// jp text function
function replaceTextByCode(text = '', array = [], textType = 0) {
  if (text === '' || !Array.isArray(array) || !array.length > 0) {
    return {
      text: text,
      table: [],
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
    let temp = findTempArray(text, array);

    // find match words from temp array
    for (let index = 0; index < temp.length; index++) {
      const element = temp[index];
      const name = element[0];

      if (regBrackets.test(name)) {
        matchedWords.push(element);
      } else if (regAllKatakana.test(name)) {
        const matchReg = new RegExp(noKatakanaFront + name + noKatakanaBack, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      } else if (regKatakanaFront.test(name)) {
        const matchReg = new RegExp(noKatakanaFront + name, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      } else if (regKatakanaBack.test(name)) {
        const matchReg = new RegExp(name + noKatakanaBack, 'gi');
        if (matchReg.test(text)) {
          matchedWords.push(element);
        }
      } else {
        if (text.includes(name)) {
          matchedWords.push(element);
        }
      }
    }
  }

  const result = findTable(text, matchedWords);
  console.log('Result:', result);
  return result;
}

function findTempArray(text = '', array = []) {
  let temp = [];

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    const name = element[0];
    const translatedName = element[1];
    const hiraName = convertKana(element[0], 'hira');
    const hiraNameFix = hiraFix(hiraName);

    if (text.includes(name)) {
      temp.push([name, translatedName]);
    }

    if (text.includes(`「${name}」`)) {
      temp.push([`「${name}」`, `「${translatedName}」`]);
    }

    if (text.includes(`『${name}』`)) {
      temp.push([`『${name}』`, `『${translatedName}』`]);
    }

    if (name.length < 3 || !regAllKatakana.test(name)) {
      continue;
    }

    if (text.includes(`「${hiraName}」`)) {
      temp.push([`「${hiraName}」`, `「${translatedName}」`]);
    }

    if (text.includes(`『${hiraName}』`)) {
      temp.push([`『${hiraName}』`, `『${translatedName}』`]);
    }

    if (text.includes(`「${hiraNameFix}」`)) {
      temp.push([`「${hiraNameFix}」`, `「${translatedName}」`]);
    }

    if (text.includes(`『${hiraNameFix}』`)) {
      temp.push([`『${hiraNameFix}』`, `『${translatedName}』`]);
    }
  }

  return temp.sort((a, b) => b[0].length - a[0].length);
}

function findTable(text = '', matchedWords = []) {
  const titleArray = jpJson.getJpArray().title;
  const srcIndex = 0;
  const rplIndex = 1;
  let codeIndex = 0;
  let codeString = 'BCFGHJLMNPQRSTVWXYZ';
  let table = [];

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

  return {
    text: text,
    table: table,
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

  text = text.replace(/ゔぁ/gi, 'ば');
  text = text.replace(/ゔぃ/gi, 'び');
  text = text.replace(/ゔ/gi, 'ぶ');
  text = text.replace(/ゔぇ/gi, 'べ');
  text = text.replace(/ゔぉ/gi, 'ぼ');

  return text;
}

function canSkipTranslation(text = '') {
  return !/[ぁ-ゖァ-ヺ\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF]/gi.test(text);
}

function genderFix(originalText = '', translatedText = '') {
  const isFemale = new RegExp(femaleWords.join('|'), 'gi').test(originalText);

  if (!isFemale) {
    translatedText = translatedText.replaceAll('她', '他').replaceAll('小姐', '').replaceAll('女王', '王');
  }

  if (!originalText.includes('娘')) {
    translatedText = translatedText.replaceAll('女兒', '女孩');
  }

  return translatedText;
}

function isChinese(text = '', translation = {}) {
  return translation.skipChinese && /^[^ぁ-ゖァ-ヺ]+$/gi.test(text);
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
  canSkipTranslation,
  genderFix,
  isChinese,
};
