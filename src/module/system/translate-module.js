'use strict';

// engine module
const engineModule = require('./engine-module');

// translator
const baidu = require('../translator/baidu');
const youdao = require('../translator/youdao');
const caiyun = require('../translator/caiyun');
const papago = require('../translator/papago');
const deepl = require('../translator/deepl');
const google = require('../translator/google');
const zhConverter = require('../translator/zh-convert');

// translate
async function translate(text, translation, table = []) {
    if (text === '') {
        return '……';
    }

    try {
        // initialize
        let translatedText = '';
        let previousTranslatedText = '';
        let missingCode = [];
        let tryCount = 0;

        do {
            // sleep
            if (tryCount > 0) {
                console.log('Missing Code:', missingCode);
                await engineModule.sleep();
            }

            // fix code
            text = fixCode(text, missingCode);

            // translate
            translatedText = await translate2(text, translation);

            // check translated text
            if (translatedText === '') {
                if (previousTranslatedText === '') {
                    throw '無法取得翻譯文字';
                } else {
                    translatedText = previousTranslatedText;
                    break;
                }
            }

            // check code
            missingCode = checkCode(translatedText, table);

            // set previous translated text
            previousTranslatedText = translatedText;

            // add count
            tryCount++;
        } while (missingCode.length > 0 && tryCount < 3);

        return zhConvert(translatedText, translation.to);
    } catch (error) {
        return zhConvert('翻譯失敗: ' + error, translation.to);
    }
}

// translate 2
async function translate2(text, translation) {
    const autoChange = translation.autoChange;
    let engineList = engineModule.getEngineList(translation.engine);
    let translatedText = '';

    do {
        const engine = engineList.shift();
        const option = engineModule.getTranslateOption(engine, translation.from, translation.to, text);
        translatedText = await getTranslation(engine, option);
    } while (translatedText === '' && autoChange && engineList.length > 0);

    return translatedText;
}

// get translation
async function getTranslation(engine, option) {
    try {
        let result = '';

        switch (engine) {
            case 'Baidu':
                result = await baidu.exec(option);
                break;

            case 'Youdao':
                result = await youdao.exec(option);
                break;

            case 'Caiyun':
                result = await caiyun.exec(option);
                break;

            case 'Papago':
                result = await papago.exec(option);
                break;

            case 'DeepL':
                result = await deepl.exec(option);
                break;

            case 'Google':
                result = await google.exec(option);
                break;

            default:
                result = '';
                break;
        }

        return result || '';
    } catch (error) {
        console.log(error);
        return '';
    }
}

// zh convert
function zhConvert(text, languageTo) {
    if (text === '') {
        return text;
    }

    if (languageTo === engineModule.languageEnum.zht) {
        return zhConverter.exec({ text: text, tableName: 'zh2Hant' });
    } else if (languageTo === engineModule.languageEnum.zhs) {
        return zhConverter.exec({ text: text, tableName: 'zh2Hans' });
    } else {
        return text;
    }
}

// check code
function checkCode(text, table) {
    let missingCodes = [];

    for (let index = 0; index < table.length; index++) {
        const code = table[index][0];
        if (!text.includes(code.toUpperCase()) && !text.includes(code.toLowerCase())) {
            missingCodes.push(code);
        }
    }

    return missingCodes;
}

// fix code
function fixCode(text, missingCode) {
    if (missingCode.length > 0) {
        for (let index = 0; index < missingCode.length; index++) {
            const code = missingCode[index][0];
            const codeRegExp = new RegExp(`(${code}+)`, 'gi');

            text = text.replace(codeRegExp, '$1' + code);
        }
    }

    return text;
}

// module exports
module.exports = {
    translate,
    getTranslation,
    zhConvert,
};
