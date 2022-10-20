'use strict';

// package module
const packageModule = require('../package-module');

// engine module
const { languageEnum, engineList, getOption } = packageModule.engineModule;

// translator
const baidu = packageModule.baidu;
const youdao = packageModule.youdao;
const caiyun = packageModule.caiyun;
const papago = packageModule.papago;
const deepl = packageModule.deepl;
const google = packageModule.google;
const zhConverter = packageModule.zhConvert;

// translate
async function translate(text, translation, table = []) {
    if (text === '') {
        return '……';
    }

    try {
        // initialize
        const autoChange = translation.autoChange;
        let engine = translation.engine;
        let option = getOption(engine, translation.from, translation.to, text);
        let engines = engineList;
        let translatedText = '';
        let previousTranslatedText = '';
        let tryCount = 0;
        let missingCodes = [];

        do {
            // sleep
            if (tryCount > 0) {
                console.log('Missing Codes:', missingCodes);
                await sleep();
            }

            // fix code
            option.text = fixCode(option.text, missingCodes);

            // translate
            translatedText = await getTranslation(engine, option);

            // retry
            if (translatedText === '' && autoChange) {
                // remove current engine
                engines.splice(engines.indexOf(engine), 1);

                // change engine
                for (let index = 0; index < engines.length; index++) {
                    const newEngine = engines[index];
                    console.log(`Try ${newEngine}`);

                    // set new engine
                    engine = newEngine;

                    // set new option
                    option = getOption(engine, translation.from, translation.to, option.text);

                    // try new engine
                    translatedText = await getTranslation(engine, option);

                    if (translatedText !== '') {
                        break;
                    }
                }
            }

            // check response
            if (translatedText === '') {
                if (previousTranslatedText === '') {
                    throw '無法取得翻譯文字，請更換翻譯引擎';
                } else {
                    translatedText = previousTranslatedText;
                    break;
                }
            } else {
                previousTranslatedText = translatedText;
            }

            // missing code check
            missingCodes = missingCodeCheck(translatedText, table);

            // add count
            tryCount++;
        } while (missingCodes.length > 0 && tryCount < 3);

        return zhConvert(translatedText, translation.to);
    } catch (error) {
        return zhConvert('翻譯失敗: ' + error, translation.to);
    }
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
    if (languageTo === languageEnum.zht) {
        return zhConverter.exec({ text: text, tableName: 'zh2Hant' });
    } else if (languageTo === languageEnum.zhs) {
        return zhConverter.exec({ text: text, tableName: 'zh2Hans' });
    } else {
        return text;
    }
}

// missing code check
function missingCodeCheck(text, table) {
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
function fixCode(text, missingCodes) {
    if (missingCodes.length > 0) {
        for (let index = 0; index < missingCodes.length; index++) {
            const code = missingCodes[index][0];
            const codeRegExp = new RegExp(`(${code}+)`, 'gi');

            text = text.replace(codeRegExp, '$1' + code);
        }
    }

    return text;
}

// sleep
function sleep(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// module exports
module.exports = {
    translate,
    getTranslation,
    zhConvert,
};
