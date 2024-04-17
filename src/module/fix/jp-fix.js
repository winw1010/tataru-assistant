'use strict';

// function
const jpFunction = require('./jp-function');
const fixFunction = require('./fix-function');

// jp json
const jpJson = require('./jp-json');

// json function
const jsonFunction = require('./json-function');

// translate module
const translateModule = require('../system/translate-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// ai engine
const aiEngine = ['GPT', 'Cohere'];

// text type list
const textTypeList = {
  normal: 0,
  reversed: 1,
  allKatakana: 2,
};

// array
const jpArray = jpJson.getJpArray();
const chArray = jpJson.getChArray();
const userArray = jpJson.getUserArray();

/*
start
*/

// start
async function start(dialogData = {}) {
  const name = dialogData.name;
  const text = dialogData.text;
  const translation = dialogData.translation;

  let translatedName = '';
  let translatedText = '';
  let audioText = '';

  try {
    // skip check
    if (translation.skip && fixFunction.skipCheck(dialogData, jpArray.ignore)) {
      throw '';
    }

    // fix name
    if (translation.skipChinese && jpFunction.isChinese(name)) {
      translatedName = fixFunction.replaceText(name, chArray.combine);
    } else {
      if (npcChannel.includes(dialogData.code)) {
        translatedName = await fixName(dialogData);
      } else {
        translatedName = name;
      }
    }

    // fix text
    if (translation.skipChinese && jpFunction.isChinese(text)) {
      translatedText = fixFunction.replaceText(text, chArray.combine);
    } else {
      if (aiEngine.includes(translation.engine)) {
        translatedText = await fixText(dialogData);
      } else {
        translatedText = await fixTextAI(dialogData);
      }
    }

    // fix audio text
    const textType = getTextType(dialogData.name, dialogData.text);
    if (textType === textTypeList.reversed) {
      // reverse kana
      audioText = jpFunction.reverseKana(dialogData.text);
    } else if (textType === textTypeList.allKatakana) {
      // convert to hira
      audioText = jpFunction.convertKana(dialogData.text, 'hira');
    } else {
      audioText = text;
    }
  } catch (error) {
    console.log(error);
    translatedName = '';
    translatedText = error;
  }

  // set text
  dialogData.translatedName = translatedName;
  dialogData.translatedText = translatedText;
  dialogData.audioText = audioText;

  return dialogData;
}

/*
fix name
*/

// fix name
async function fixName(dialogData = {}) {
  const name = dialogData.name;
  const translation = dialogData.translation;

  let translatedName = '';
  let katakanaName = jpFunction.getKatakanaName(name);

  if (name === '') {
    return '';
  }

  // find same name
  const target =
    fixFunction.sameAsArrayItem(name, chArray.combine) ||
    fixFunction.sameAsArrayItem(name + '#', chArray.combine) ||
    fixFunction.sameAsArrayItem(name + '##', chArray.combine);

  // return if found
  if (target) {
    return target[1];
  }

  // check katakana name
  if (katakanaName.length > 0) {
    let translatedKatakanaName = '';
    const sameCheck =
      fixFunction.sameAsArrayItem(katakanaName, chArray.combine) ||
      fixFunction.sameAsArrayItem(katakanaName + '#', chArray.combine) ||
      fixFunction.sameAsArrayItem(katakanaName + '##', chArray.combine);

    // save translated katakanaName if not found
    if (!sameCheck) {
      translatedKatakanaName = createName(katakanaName);
      saveName(katakanaName, translatedKatakanaName);
    }
  }

  // get code result
  const codeResult = jpFunction.replaceTextByCode(name, chArray.combine);

  // translate name
  if (aiEngine.includes(translation.engine)) {
    // skip check
    if (jpFunction.needTranslation(name, codeResult.gptTable)) {
      // translate
      translatedName = await translateModule.aiTranslate(name, translation, codeResult.gptTable);
    }

    // table
    translatedName = fixFunction.replaceText(translatedName, codeResult.gptTable);
  } else {
    // skip check
    if (jpFunction.needTranslation(codeResult.text, codeResult.table)) {
      // translate
      translatedName = await translateModule.translate(codeResult.text, translation, codeResult.table);
    }

    // table
    translatedName = fixFunction.replaceWord(translatedName, codeResult.table);
  }

  // after translation
  translatedName = fixFunction.replaceText(translatedName, chArray.afterTranslation);

  // save translated name
  if (name !== katakanaName) {
    saveName(name, translatedName);
  }

  return translatedName;
}

// create name
function createName(katakanaName = '') {
  let name = fixFunction.replaceText(katakanaName, chArray.combine);
  name = name.replace(/^ルル/, '路路');
  name = name.replace(/^ル/, '路');
  name = name.replace(/^ア(?!イ|ウ|ン)/, '阿');
  return fixFunction.replaceText(name, chArray.chName);
}

// save name
function saveName(name = '', translatedName = '') {
  if (name === translatedName) {
    return;
  }

  if (name.length < 3) name += '#';

  // add to combine
  chArray.combine.push([name, translatedName]);
  chArray.combine = jsonFunction.sortArray(chArray.combine);

  // add to tempName
  userArray.tempName.push([name, translatedName]);
  jsonFunction.writeUserText('temp-name.json', userArray.tempName);
}

/*
fix text
*/

// fix text
async function fixText(dialogData = {}) {
  const name = dialogData.name;
  const text = dialogData.text;
  const translation = dialogData.translation;

  let text2 = text;
  let translatedText = '';

  if (text === '') {
    return '';
  }

  // force overwrite
  const target = fixFunction.sameAsArrayItem(text, chArray.overwrite);
  if (target) {
    return fixFunction.replaceText(target[1], chArray.combine);
  }

  // get text type
  const textType = getTextType(name, text);

  // subtitle
  text2 = fixFunction.replaceText(text2, jpArray.subtitle);

  // reverse text
  if (textType === textTypeList.reversed) {
    text2 = jpFunction.reverseKana(text2);
  }

  // special fix 1
  text2 = specialFix1(name, text2);

  // jp1
  text2 = fixFunction.replaceText(text2, jpArray.jp1);

  // combine
  const codeResult = jpFunction.replaceTextByCode(text2, chArray.combine, textType);
  text2 = codeResult.text;

  // jp2
  text2 = fixFunction.replaceText(text2, jpArray.jp2);

  // special fix 2
  text2 = specialFix2(name, text2);

  // convert to hira
  if (textType === textTypeList.allKatakana) {
    text2 = jpFunction.convertKana(text2, 'hira');
  }

  // mark fix
  text2 = fixFunction.markFix(text2);

  // value fix before
  const valueResult = fixFunction.valueFixBefore(text2);
  text2 = valueResult.text;

  // skip check
  if (jpFunction.needTranslation(text2, codeResult.table)) {
    // translate
    translatedText = await translateModule.translate(text2, translation, codeResult.table);
  }

  // value fix after
  translatedText = fixFunction.valueFixAfter(translatedText, valueResult.table);

  // mark fix
  translatedText = fixFunction.markFix(translatedText, true);

  // gender fix
  translatedText = jpFunction.genderFix(text, translatedText);

  // table
  translatedText = fixFunction.replaceWord(translatedText, codeResult.table);

  // after translation
  translatedText = fixFunction.replaceText(translatedText, chArray.afterTranslation);

  return translatedText;
}

// fix text ai
async function fixTextAI(dialogData = {}) {
  const name = dialogData.name;
  const text = dialogData.text;
  const translation = dialogData.translation;

  let text2 = text;
  let translatedText = text;

  if (text === '') {
    return '';
  }

  // get text type
  const textType = getTextType(name, text);

  // reverse text
  if (textType === textTypeList.reversed) {
    text2 = jpFunction.reverseKana(text2);
  }

  // special fix 1
  text2 = specialFix1(name, text2);

  // combine
  const codeResult = jpFunction.replaceTextByCode(text2, chArray.combine, textType);

  // skip check
  if (jpFunction.needTranslation(text2, codeResult.gptTable)) {
    // translate
    translatedText = await translateModule.aiTranslate(text2, translation, codeResult.gptTable);
  }

  // table
  translatedText = fixFunction.replaceWord(translatedText, codeResult.gptTable);

  // after translation
  translatedText = fixFunction.replaceText(translatedText, chArray.afterTranslation);

  return translatedText;
}

// special fix 1
function specialFix1(name = '', text = '') {
  // special replace
  text = jpFunction.specialReplace(text, jpArray.special1);

  // タタル
  if (/タタル/gi.test(name)) {
    text = text.replace(/(?<=さ|ま|で)っす/gi, 'す');
    text = text.replace(/(?<=ま)っした/gi, 'した');
  }

  // ヒエン
  if (/ユウギリ|ゴウセツ|ヨツユ/gi.test(name)) {
    text = text.replace(/若(?!若|々|い|し|様)/gi, '若様');
  }

  // 水晶公
  if (fixFunction.includesArrayItem(name, jpArray.listCrystalium)) {
    text = text.replace(
      /(?<![\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF])公(?![\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF])/gi,
      '水晶公'
    );
  }

  // 暗黒騎士
  if (/フレイ|シドゥルグ|リエル|^ミスト(の声)?$/gi.test(name)) {
    text = text.replace(/ミスト/gi, 'ミスト#');
  }

  return text;
}

// special fix 2
function specialFix2(name = '', text = '') {
  // special replace
  text = jpFunction.specialReplace(text, jpArray.special2);

  // コボルド族
  if (/コボルド|\d{1,3}.*?・.*?|(^[ァ-ヺ]{1}・[ァ-ヺ]{1}$)/gi.test(name) && !name.includes('マメット')) {
    text = text.replace(/ー/gi, '');
  }

  // マムージャ族 & 強化グリーンワート
  if (/マムージャ|[ァ-ヺ]{2}ージャジャ$|[ァ-ヺ]{2}ージャ$|強化グリーンワート/gi.test(name)) {
    text = text.replace(/、/gi, '');
  }

  // バヌバヌ族
  if (/ブンド|ズンド|グンド|ヌバ|バヌ/gi.test(name)) {
    // 長老さま、長老さま！
    // ぬおおおおおん！まただ、まただ、浮島が食べられたね！
    text = text.replace(/(.{3,}?)、\1/gi, '$1');
  }

  // 異邦の詩人
  if (/(異邦の詩人)|(異世界の詩人)/gi.test(name)) {
    text = text.replace(/\u3000/gi, '、');
  }

  // ライアン
  if (/^ライアン/gi.test(name)) {
    text = text.replace(/あーた/gi, '貴方');
  }

  let loopCount = 0;

  /*
    // あ、あ(or 漢字)
    // あ……あ(or 漢字)
    // あ…あ(or 漢字)
    loopCount = 0;
    const RegExpCommaWords1 = /^([…、]*)([ぁ-ゖァ-ヺ][ぁぃぅぇぉゃゅょっァィゥェォャュョッ]*)[…、]+(\2|[一-龠])/gi;
    const RegExpCommaWords2 = /([、。！？])([…、]*)([ぁ-ゖァ-ヺ][ぁぃぅぇぉゃゅょっァィゥェォャュョッ]*)[…、]+(\3|[一-龠])/gi;
    while (loopCount < 10) {
        const result1 = RegExpCommaWords1.test(text);
        const result2 = RegExpCommaWords2.test(text);
  
        if (result1) {
            text = text.replace(RegExpCommaWords1, '$1$3');
        }
  
        if (result2) {
            text = text.replace(RegExpCommaWords2, '$1$2$4');
        }
  
        if (!result1 && !result2) {
            break;
        }
  
        loopCount++;
    }
    */

  // あアあ => あああ
  loopCount = 0;
  while (/([^ァ-ヺー・＝]|^)[ァ-ヺ][ァィゥェォャュョッ]?([^ァ-ヺー・＝]|$)/gi.test(text) && loopCount++ < 10) {
    let t1 = /([^ァ-ヺー・＝]|^)[ァ-ヺ][ァィゥェォャュョッ]?([^ァ-ヺー・＝]|$)/gi.exec(text);

    if (t1 && t1.length > 0) {
      let element = t1[0];
      const t2 = jpFunction.convertKana(element, 'hira');
      text = text.replaceAll(element, t2);
    } else {
      break;
    }
  }

  return text;
}

// get text type
function getTextType(name = '', text = '') {
  let type = textTypeList.normal;

  if (fixFunction.includesArrayItem(name, jpArray.listReverse)) {
    type = textTypeList.reversed;
  } else if (isNoHiragana(name, text)) {
    type = textTypeList.allKatakana;
  }

  return type;
}

// check katakana
function isNoHiragana(name = '', text = '') {
  if (fixFunction.includesArrayItem(name, jpArray.listHira)) {
    return true;
  }

  const kanjiArray = text.match(/[\u3400-\u9FFF]/gi) || [];
  const noHiragana = /^[^ぁ-ゖ]+$/gi.test(text);
  if (kanjiArray.length > 0) {
    return noHiragana;
  } else {
    return noHiragana && text.length > 15;
  }
}

module.exports = {
  start,
};
