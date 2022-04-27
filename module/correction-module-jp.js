'use strict';

// language table
const { languageTable, languageIndex } = require('./translator/language-table');

// correction function
const cfjp = require('./correction-function-jp');
const cf = require('./correction-function');

// dialog module
const { appendBlankDialog, updateDialog } = require('./dialog-module');

// queue
let queueItems = [];
let queueInterval = null;

// document
let chArray = {
    // force replace
    overwrite: [],

    // char name
    chName: [],

    // after
    afterTranslation: [],

    // replace
    main: [],

    // player
    player: [],

    // temp
    chTemp: [],

    // combine
    combine: [],
}

let jpArray = {
    // exception
    exception: [],

    // jp => jp
    subtitle: [],
    jp1: [],
    jp2: [],

    // temp
    jpTemp: [],

    // jp char
    kana: [],

    // jp list
    listHira: [],
    listCrystalium: [],
};

function loadJSON(language) {
    // clear queue interval
    try {
        clearInterval(queueInterval);
        queueInterval = null;
    } catch (error) {
        console.log(error);
    }

    const sub0 = languageIndex[languageTable.ja];
    const sub1 = languageIndex[language];
    const ch = sub1 === 2 ? 'text/cht' : 'text/chs';
    const jp = 'text/jp';

    // ch array
    chArray.overwrite = cf.combineArrayWithTemp(cf.readJSON('text_temp', 'overwriteTemp.json'), cf.readJSONOverwrite(ch));

    chArray.chName = cf.readJSON(ch, 'chName.json');
    chArray.afterTranslation = cf.readJSON(ch, 'afterTranslation.json');

    chArray.main = cf.readJSONMain(sub0, sub1);
    chArray.player = cf.readJSON('text_temp', 'player.json');
    chArray.chTemp = cf.readJSON('text_temp', 'chTemp.json');

    // combine
    chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // jp array
    jpArray.exception = cf.readJSON(jp, 'exception.json');
    jpArray.subtitle = cf.readJSONSubtitle();
    jpArray.jp1 = cf.readJSON(jp, 'jp1.json');
    jpArray.jp2 = cf.combineArrayWithTemp(cf.readJSON('text_temp', 'jpTemp.json'), cf.readJSON(jp, 'jp2.json'));

    jpArray.kana = cf.readJSON(jp, 'kana.json');
    jpArray.listHira = cf.readJSON(jp, 'listHira.json');
    jpArray.listCrystalium = cf.readJSON(jp, 'listCrystalium.json');

    // start/restart queue interval
    queueInterval = setInterval(() => {
        try {
            if (queueItems.length > 0) {
                const item = queueItems.splice(0, 1)[0];
                start(item.dialogData, item.translation, item.tryCount);
            }
        } catch (error) {
            console.log(error);
        }
    }, 1000);
}

function addToQueue(dialogData, translation, tryCount = 0) {
    queueItems.push({
        dialogData: dialogData,
        translation: translation,
        tryCount: tryCount
    });
}

async function start(dialogData, translation, tryCount) {
    // exception check
    if (translation.skip && cf.exceptionCheck(dialogData.code, dialogData.name, dialogData.text, jpArray.exception)) {
        return;
    }

    // check try count
    if (tryCount > 5) {
        updateDialog(dialogData.id, '', '翻譯失敗，請改用其他翻譯引擎', dialogData, translation);
        return;
    } else {
        tryCount++;
    }

    // append blank dialog
    appendBlankDialog(dialogData.id, dialogData.code);

    // player name
    if (dialogData.playerName !== '' && dialogData.playerName.includes(' ')) {
        if (!chArray.player.length > 0 || chArray.player[0][0] !== dialogData.playerName) {
            const firstName = dialogData.playerName.split(' ')[0];
            const lastName = dialogData.playerName.split(' ')[1];

            chArray.player = [
                [dialogData.playerName, dialogData.playerName],
                [firstName, firstName],
                [lastName, lastName]
            ];

            // combine
            chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

            // write
            cf.writeJSON('text_temp', 'player.json', chArray.player);
        }
    }

    // name translation
    let translatedName = '';
    if (translation.fix) {
        translatedName = await nameTranslation(dialogData.name, translation);
    } else {
        translatedName = await cf.translate(dialogData.name, translation);
    }

    // text translation
    let translatedText = '';
    if (translation.fix) {
        translatedText = await textTranslation(dialogData.name, dialogData.text, translation);
    } else {
        translatedText = await cf.translate(dialogData.text, translation);
    }

    if (dialogData.text !== '' && translatedText === '') {
        addToQueue(dialogData, translation, tryCount);
        return;
    }

    // update dialog
    updateDialog(dialogData.id, translatedName, translatedText, dialogData, translation);
}

async function nameTranslation(name, translation) {
    if (name === '') {
        return '';
    }

    // same check
    if (cf.sameAsArrayItem(name, chArray.combine)) {
        return cfjp.replaceText(name, chArray.combine);
    } else if (cf.sameAsArrayItem(name + '*', chArray.combine)) {
        // 2 word name
        return cfjp.replaceText(name + '*', chArray.combine);
    } else {
        let outputName = '';

        if (isAllKataText('', name)) {
            // all kata => use chName
            outputName = cfjp.replaceText(name, chArray.chName);
        } else {
            // not all kata => use standard
            // code
            const result = cfjp.replaceTextByCode(name, chArray.combine);

            // translate name
            outputName = result.text;
            outputName = await cf.translate(outputName, translation);

            // clear code
            outputName = cf.clearCode(outputName, result.table);

            // table
            outputName = cfjp.replaceText(outputName, result.table);
        }

        // save to temp
        chArray.chTemp = cf.readJSONPure('text_temp', 'chTemp.json');

        if (outputName.length < 3) {
            chArray.chTemp.push([name + '*', outputName, 'npc']);
        } else {
            chArray.chTemp.push([name, outputName, 'npc']);
        }

        // combine
        chArray.combine = cf.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

        // write
        cf.writeJSON('text_temp', 'chTemp.json', chArray.chTemp);

        return outputName;
    }
}

async function textTranslation(name, text, translation) {
    if (text === '') {
        return;
    }

    // original text
    const originalText = text;

    // force overwrite
    if (cf.sameAsArrayItem(text, chArray.overwrite)) {
        return cfjp.replaceText(text, chArray.overwrite);
    } else {
        // check kata
        const allKata = isAllKataText(name, text);

        // subtitle
        text = cfjp.replaceText(text, jpArray.subtitle);

        // special fix
        text = specialTextFix(name, text);

        // jp1
        text = cfjp.replaceText(text, jpArray.jp1);

        // combine
        const result = cfjp.replaceTextByCode(text, chArray.combine);
        text = result.text;

        // jp2
        text = cfjp.replaceText(text, jpArray.jp2);

        // to hira
        if (allKata) {
            text = cfjp.replaceText(text, jpArray.kana, 1, 0);
        }

        // should translate check
        if (cfjp.shouldTranslate(text)) {
            // translate
            text = await cf.translate(text, translation);
        }

        // caiyun fix
        text = cf.caiyunFix(text);

        // clear code
        text = cf.clearCode(text, result.table);

        // table
        text = cfjp.replaceText(text, result.table);

        // gender fix
        text = cfjp.genderFix(originalText, text);

        // after translation
        text = cfjp.replaceText(text, chArray.afterTranslation);

        return text;
    }
}

/*
// sound text fix
function soundTextFix(text) {
    const sound = {
        'ア': ['ば', 'バ'],
        'オ': ['ご', 'ゴ'],
        'ハ': ['ファ', 'フォ', 'フォッ', 'カ', 'カッ'],
        'フ': ['ク', 'ヒ', 'ヒョ', 'ヒョッ'],
        'ヘ': ['ヘッ'],
        '': ['ぬ', 'ム']
    };

    const soundNames = Object.getOwnPropertyNames(sound);
    for (let index = 0; index < soundNames.length; index++) {
        const replacement = soundNames[index];
        const search = sound[replacement];

        search.forEach((value) => {
            let sountText = value + value + value;

            while (text.includes(sountText)) {
                text = text.replaceAll(sountText, replacement);
                sountText = sountText + value;
            }
        });
    }

    return text;
}
*/

// special text fix
function specialTextFix(name, text) {
    // remove ()
    if (text.includes('（') && text.includes('）')) {
        let temp = text.split('（');

        for (let index = 0; index < temp.length; index++) {
            if (temp[index].includes('）')) {
                temp[index] = temp[index].slice(temp[index].indexOf('）') + 1);
            }
        }

        text = temp.join('');
    }

    // コボルド族
    if (cf.includesArrayItem(name, ['コボルド', 'ガ・ブ']) ||
        cf.includesArrayItem(name, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) &&
        name.includes('・') &&
        !name.includes('マメット')) {
        text = text.replaceAll('ー', '');
    }

    // マムージャ族
    if (cf.includesArrayItem(name, ['ージャ' /*, '強化グリーンワート'*/ ])) {
        text = text.replaceAll('、', '');
    }

    // バヌバヌ族
    if (cf.includesArrayItem(name, ['ヌバ', 'バヌ', 'ズンド', 'ブンド', 'グンド'])) {
        if (text.includes('、')) {
            let splitedtext = text.split('、');

            // 長老さま、長老さま！
            // =>「長老さま」, 「長老さま！」
            if (splitedtext[1].includes(splitedtext[0])) {
                splitedtext[0] = '';
            }

            // ぬおおおおおん！まただ、まただ、浮島が食べられたね！
            // =>「ぬおおおおおん！まただ」, 「まただ」, 「浮島が食べられたね！」
            for (let index = 1; index < splitedtext.length; index++) {
                if (splitedtext[index - 1].includes(splitedtext[index])) {
                    splitedtext[index] = '';
                }
            }

            text = splitedtext.join('、').replaceAll('、、', '、');

            if (text[0] === '、') {
                text = text.slice(1);
            }
        }
    }

    // 核修正
    if (text.includes('核')) {
        text = text
            .replaceAll('核', '核心')
            .replaceAll('核心心', '核心')
            .replaceAll('中核心', '核心')
            .replaceAll('心核心', '核心');
    }

    // 水晶公判斷
    if (cf.includesArrayItem(name, jpArray.listCrystalium)) {
        const exception = ['公開', '公的', '公然', '公共', '公園', '公家', '公営', '公宴', '公案', '公益', '公演', '公稲'];

        if (!cf.includesArrayItem(text, exception)) {
            text = text
                .replaceAll('貴公', '貴方')
                .replaceAll('公', '水晶公')
                .replaceAll('水晶水晶', '水晶');
        }
    }

    // 若判斷
    if (cf.includesArrayItem(name, ['ユウギリ', 'ゴウセツ'])) {
        text = text.replaceAll('若', '主人');
    }

    // 暗黒騎士
    if (cf.includesArrayItem(name, ['フレイ', 'シドゥルグ', 'リエル'])) {
        text = text.replaceAll('ミスト', 'ミスト*');
    }

    return text;
}

// kata check
/*
function isAllKataName(text) {
    let hiraString = cf.arrayString(jpArray.kana, 1) + 'ー・？';
    for (let index = 0; index < hiraString.length; index++) {
        text = text.replaceAll(hiraString[index], '');
    }

    return text === '';
}
*/

function isAllKataText(name, text) {
    if (cf.includesArrayItem(name, jpArray.listHira)) {
        return true;
    }

    let hiraString = cf.arrayString(jpArray.kana, 0);
    for (let index = 0; index < text.length; index++) {
        if (hiraString.includes(text[index])) {
            return false;
        }
    }

    return true;
}

exports.loadJSON_JP = loadJSON;
exports.addToQueue_JP = addToQueue;