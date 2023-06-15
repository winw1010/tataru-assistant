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

    // initialize
    const maxCount = 3;
    let count = 0;
    let missingCode = [];
    let result = '';
    let previousResult = '';

    try {
        do {
            // sleep
            if (count > 0) {
                console.log('Missing Code:', missingCode);
                await engineModule.sleep();
            }

            // add count
            count++;

            // fix code
            text = fixCode(text, missingCode);

            // translate
            result = await translate2(text, translation);

            // check translated text
            if (result === '') {
                if (previousResult === '') {
                    result = '無法取得翻譯文字，請確認您的網路連線，或暫時使用其他翻譯引擎';
                } else {
                    result = previousResult;
                }
                break;
            }

            // check code
            missingCode = checkCode(result, table);

            // set previous translated text
            previousResult = result;
        } while (missingCode.length > 0 && count < maxCount);
    } catch (error) {
        console.log(error);
        result = error;
    }

    return zhConvert(result, translation.to);
}

// translate 2
async function translate2(text, translation) {
    const autoChange = translation.autoChange;
    let engineList = engineModule.getEngineList(translation.engine);
    let result = '';

    do {
        const engine = engineList.shift();
        const option = engineModule.getTranslateOption(engine, translation.from, translation.to, text);
        result = await getTranslation(engine, option);
    } while (result === '' && autoChange && engineList.length > 0);

    return result;
}

// get translation
async function getTranslation(engine, option) {
    let result = '';

    try {
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
                break;
        }
    } catch (error) {
        console.log(error);
    }

    return result || '';
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
            text = text.replaceAll(codeRegExp, '$1' + code);
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
