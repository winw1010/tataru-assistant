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

// text type list
const textTypeList = {
  normal: 0,
  reversed: 1,
  allKatakana: 2,
};

// array
let jpArray = jpJson.getJpArray();
let chArray = jpJson.getChArray();

async function startFix(dialogData = {}) {
  try {
    // get translation
    const translation = dialogData.translation;

    // skip check
    if (translation.skip && fixFunction.skipCheck(dialogData, jpArray.ignore)) {
      throw '';
    }

    // name translation
    let translatedName = '';
    if (jpFunction.isChinese(dialogData.name, translation)) {
      translatedName = fixFunction.replaceText(
        dialogData.name,
        chArray.combine
      );
    } else {
      if (npcChannel.includes(dialogData.code)) {
        if (translation.fix) {
          translatedName = await nameFix(dialogData.name, translation);
        } else {
          translatedName = await translateModule.translate(
            dialogData.name,
            translation
          );
        }
      } else {
        translatedName = dialogData.name;
      }
    }

    if (dialogData.name !== '') {
      // sleep 1 second
      await fixFunction.sleep();
    }

    // text translation
    let translatedText = '';
    if (jpFunction.isChinese(dialogData.text, translation)) {
      translatedText = fixFunction.replaceText(
        dialogData.text,
        chArray.combine
      );
    } else {
      if (translation.fix) {
        translatedText = await textFix(
          dialogData.name,
          dialogData.text,
          translation
        );
      } else {
        translatedText = await translateModule.translate(
          dialogData.text,
          translation
        );
      }
    }

    // set audio text
    const textType = getTextType(dialogData.name, dialogData.text);
    if (textType === textTypeList.reversed) {
      // reverse kana
      dialogData.audioText = jpFunction.reverseKana(dialogData.text);
    } else if (textType === textTypeList.allKatakana) {
      // convert to hira
      dialogData.audioText = jpFunction.convertKana(dialogData.text, 'hira');
    }

    // set translated text
    dialogData.translatedName = translatedName;
    dialogData.translatedText = translatedText;
  } catch (error) {
    console.log(error);

    // set translated text
    dialogData.translatedName = 'Error';
    dialogData.translatedText = error;
  }

  return dialogData;
}

async function nameFix(name = '', translation = {}) {
  if (name === '') {
    return '';
  }

  // same check
  const target1 = fixFunction.sameAsArrayItem(name, chArray.combine);
  const target2 = fixFunction.sameAsArrayItem(name + '#', chArray.combine);
  const target3 = fixFunction.sameAsArrayItem(name + '##', chArray.combine);

  if (target1) {
    return target1[1];
  }

  if (target2) {
    return target2[1].replace(/#$/, '');
  }

  if (target3) {
    return target3[1].replace(/##$/, '');
  }

  const translatedName = translateName(
    name,
    getKatakanaName(name),
    translation
  );
  return translatedName;
}

async function textFix(name = '', text = '', translation = {}) {
  if (text === '') {
    return '';
  }

  let originalText = text;

  // force overwrite
  const target = fixFunction.sameAsArrayItem(text, chArray.overwrite);
  if (target) {
    return fixFunction.replaceText(target[1], chArray.combine);
  }

  // get text type
  const textType = getTextType(name, text);

  // subtitle
  text = fixFunction.replaceText(text, jpArray.subtitle);

  // reverse text
  if (textType === textTypeList.reversed) {
    text = jpFunction.reverseKana(text);
  }

  // special fix 1
  text = specialFix1(name, text);

  // jp1
  text = fixFunction.replaceText(text, jpArray.jp1);

  // combine
  const codeResult = jpFunction.replaceTextByCode(
    text,
    chArray.combine,
    textType
  );
  text = codeResult.text;

  // jp2
  text = fixFunction.replaceText(text, jpArray.jp2);

  // special fix 2
  text = specialFix2(name, text);

  // convert to hira
  if (textType === textTypeList.allKatakana) {
    text = jpFunction.convertKana(text, 'hira');
  }

  // mark fix
  text = fixFunction.markFix(text);

  // value fix before
  const valueResult = fixFunction.valueFixBefore(text);
  text = valueResult.text;

  // skip check
  if (!jpFunction.canSkipTranslation(text)) {
    // translate
    text = await translateModule.translate(text, translation, codeResult.table);
  }

  // value fix after
  text = fixFunction.valueFixAfter(text, valueResult.table);

  // mark fix
  text = fixFunction.markFix(text, true);

  // gender fix
  text = jpFunction.genderFix(originalText, text);

  // after translation
  text = fixFunction.replaceText(text, chArray.afterTranslation);

  // table
  text = fixFunction.replaceWord(text, codeResult.table);

  return text;
}

// get katakana name
function getKatakanaName(name = '') {
  if (/^([ァ-ヺー・＝]+)([^ァ-ヺー・＝]+)？*$/gi.test(name)) {
    // katakana + not katakana
    return name.replace(/^([ァ-ヺー・＝]+)([^ァ-ヺー・＝]+)？*$/gi, '$1');
  } else if (/^([^ァ-ヺー・＝]+)([ァ-ヺー・＝]+)？*$/gi.test(name)) {
    // not katakana + katakana
    return name.replace(/^([^ァ-ヺー・＝]+)([ァ-ヺー・＝]+)？*$/gi, '$2');
  } else if (/^([ァ-ヺー・＝]+)？*$/gi.test(name)) {
    // all katakana
    return name;
  } else {
    // other
    return '';
  }
}

// translate name
async function translateName(name = '', katakanaName = '', translation = {}) {
  // same check
  const sameKatakanaName1 = fixFunction.sameAsArrayItem(
    katakanaName,
    chArray.combine
  );
  const sameKatakanaName2 = fixFunction.sameAsArrayItem(
    katakanaName + '#',
    chArray.combine
  );

  // translate katakana name
  const translatedKatakanaName = sameKatakanaName1
    ? sameKatakanaName1[1]
    : sameKatakanaName2
    ? sameKatakanaName2[1]
    : createName(katakanaName);

  if (name === katakanaName) {
    // all katakana => use translatedKatakanaName

    // save name
    saveName(name, translatedKatakanaName);

    // return translatedKatakanaName
    return translatedKatakanaName;
  } else {
    // not all katakana => use standard

    // translated name
    let translatedName = '';

    // code
    const codeResult =
      katakanaName !== ''
        ? jpFunction.replaceTextByCode(
            name,
            jsonFunction.combineArray(chArray.combine, [
              [katakanaName, translatedKatakanaName],
            ])
          )
        : jpFunction.replaceTextByCode(name, chArray.combine);

    // translate name
    translatedName = codeResult.text;

    // skip check
    if (!jpFunction.canSkipTranslation(translatedName)) {
      // translate
      translatedName = await translateModule.translate(
        translatedName,
        translation,
        codeResult.table
      );
    }

    // after translation
    translatedName = fixFunction.replaceText(
      translatedName,
      chArray.afterTranslation
    );

    // mark fix
    translatedName = fixFunction.markFix(translatedName, true);

    // table
    translatedName = fixFunction.replaceText(translatedName, codeResult.table);

    // save name
    saveName(name, translatedName, katakanaName, translatedKatakanaName);

    return translatedName;
  }
}

// create name
function createName(katakanaName = '') {
  let tempName = fixFunction.replaceText(katakanaName, chArray.combine);
  tempName = tempName.replace(/^ルル/, '路路');
  tempName = tempName.replace(/^ル/, '路');
  tempName = tempName.replace(/^ア(?!イ|ウ|ン)/, '阿');

  return fixFunction.replaceText(tempName, chArray.chName);
}

// create east name
//function createEastName(katakanaName = '') {}

// save name
function saveName(
  name = '',
  translatedName = '',
  katakanaName = '',
  translatedKatakanaName = ''
) {
  if (name === translatedName) {
    return;
  }

  chArray.chTemp = jsonFunction.readTemp('chTemp.json', false);

  if (name.length > 0 && name.length < 3) {
    chArray.chTemp.push([name + '#', translatedName, 'temp']);
  } else if (name.length > 2) {
    chArray.chTemp.push([name, translatedName, 'temp']);
  }

  if (
    katakanaName.length > 0 &&
    !fixFunction.includesArrayItem(katakanaName, chArray.combine)
  ) {
    /*if (katakanaName.length < 3) {
            chArray.chTemp.push([katakanaName + '#', translatedKatakanaName, 'temp']);
        } else*/
    if (name.length > 2) {
      chArray.chTemp.push([katakanaName, translatedKatakanaName, 'temp']);
    }
  }

  // write
  chArray.combine = jsonFunction.combineArrayWithTemp(
    chArray.chTemp,
    chArray.player,
    chArray.main
  );
  jsonFunction.writeTemp('chTemp.json', chArray.chTemp);
}

// special fix 1
function specialFix1(name = '', text = '') {
  // special replace
  text = jpFunction.specialReplace(text, jpArray.special1);

  // タタル
  if (/タタル/gi.test(name)) {
    text = text.replace(/(?<=さ|ま|で)っす/gi, 'す');
    text = text.replace(/(?<=ま)っし/gi, 'し');
  }

  // ヒエン
  if (/ユウギリ|ゴウセツ|ヨツユ/gi.test(name)) {
    text = text.replace(/若(?!若|々|い|し|様)/gi, '若様');
  }

  // 水晶公
  if (fixFunction.includesArrayItem(name, jpArray.listCrystalium)) {
    text = text.replace(
      /(?<!水晶|貴)公(?!開|的|然|共|衆|民|園|安|界|家|営|印|暇|課|会|海|宴|害|刊|館|器|儀|議|企|義|案|益|演|稲)/gi,
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
  if (
    /コボルド|\d{1,3}.*?・.*?|(^[ァ-ヺ]{1}・[ァ-ヺ]{1}$)/gi.test(name) &&
    !name.includes('マメット')
  ) {
    text = text.replace(/ー/gi, '');
  }

  // マムージャ族 & 強化グリーンワート
  if (
    /マムージャ|[ァ-ヺ]{2}ージャジャ$|[ァ-ヺ]{2}ージャ$|強化グリーンワート/gi.test(
      name
    )
  ) {
    text = text.replace(/、/gi, '');
  }

  // バヌバヌ族
  if (/ブンド|ズンド|グンド|ヌバ|バヌ/gi.test(name)) {
    // 長老さま、長老さま！
    // ぬおおおおおん！まただ、まただ、浮島が食べられたね！
    text = text.replace(/(.{3,}?)、\1/gi, '$1');
  }

  // 異邦の詩人
  if (/異邦の詩人|異世界の詩人/gi.test(name)) {
    text = text.replace(/\u3000/gi, '、');
  }

  // ライアン
  if (/ライアン/gi.test(name)) {
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
  while (
    /([^ァ-ヺー・＝]|^)[ァ-ヺ][ァィゥェォャュョッ]?([^ァ-ヺー・＝]|$)/gi.test(
      text
    ) &&
    loopCount++ < 10
  ) {
    let t1 =
      /([^ァ-ヺー・＝]|^)[ァ-ヺ][ァィゥェォャュョッ]?([^ァ-ヺー・＝]|$)/gi.exec(
        text
      );

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
  } else if (allKataCheck(name, text)) {
    type = textTypeList.allKatakana;
  }

  return type;
}

// check katakana
function allKataCheck(name = '', text = '') {
  if (fixFunction.includesArrayItem(name, jpArray.listHira)) {
    return true;
  }

  //return /^[^ぁ-ゖ]+$/gi.test(text) && text.match(/[ァ-ヺ]/gi)?.length > 10;
  const kanji = text.match(/[\u3400-\u9FFF]/gi);
  if (kanji?.length > 0) {
    return /^[^ぁ-ゖ]+$/gi.test(text);
  } else {
    return /^[^ぁ-ゖ]+$/gi.test(text) && text.length > 15;
  }
}

// module exports
module.exports = {
  startFix,
};
