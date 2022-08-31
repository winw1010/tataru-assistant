'use strict';

const { languageEnum, AvailableEngineList, getOption } = require('./engine-module');

const baidu = require('./translator/baidu');
const youdao = require('./translator/youdao');
const caiyun = require('./translator/caiyun');
const papago = require('./translator/papago');
const deepl = require('./translator/deepl');
const google = require('./translator/google');
const googleTTS = require('./translator/google-tts');
const zhConvert = require('./translator/zh-convert');

async function translate(text, translation, table = []) {
    if (text === '') {
        return '……';
    }

    const autoChange = translation.autoChange;

    // set engine
    let engine = translation.engine;

    // set option
    let option = getOption(engine, translation.from, translation.to, text);

    // initialize
    let translatedText = '';
    let retryCount = 0;
    let missingCodes = [];

    do {
        // fix text
        option.text = fixCode(option.text, missingCodes);

        // translate
        translatedText = await getTranslation(engine, option);

        // add count
        retryCount++;

        // retry
        if (translatedText === '') {
            console.log('Response is empty.');

            if (autoChange) {
                // change another engine
                for (let index = 0; index < AvailableEngineList.length; index++) {
                    const newEngine = AvailableEngineList[index];

                    // find new engine
                    if (newEngine !== engine) {
                        console.log(`Use ${newEngine}.`);

                        // set new engine
                        engine = newEngine;

                        // set new option
                        option = getOption(engine, translation.from, translation.to, option.text);

                        // retranslate
                        translatedText = await getTranslation(engine, option);

                        if (translatedText !== '') {
                            break;
                        }
                    }
                }
            } else {
                // use same engine
                for (let index = 0; index < 2; index++) {
                    // sleep 1 second
                    await sleep(1000);

                    // retranslate
                    translatedText = await getTranslation(engine, option);

                    if (translatedText !== '') {
                        break;
                    }
                }
            }
        }

        // text check
        if (translatedText === '') {
            translatedText = '翻譯失敗，請稍後再試';
            break;
        }

        // missing code check
        missingCodes = missingCodeCheck(translatedText, table);
    } while (missingCodes.length > 0 && retryCount < 3);

    return zhtConvert(translatedText, translation.to);
}

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

            case 'GoogleTTS':
                result = googleTTS.getAudioUrl(option);
                break;

            case 'zhConvert':
                result = zhConvert.exec(option);
                break;

            default:
                result = 'Engine is not available!';
                break;
        }

        return result || '';
    } catch (error) {
        console.log(error);
        return '';
    }
}

function zhtConvert(text, languageTo) {
    if (languageTo === languageEnum.zht) {
        return zhConvert.exec({ text: text, tableName: 'zh2Hant' });
    } else if (languageTo === languageEnum.zhs) {
        return zhConvert.exec({ text: text, tableName: 'zh2Hans' });
    } else {
        return text;
    }
}

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

function sleep(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
    translate,
    getTranslation,
};
