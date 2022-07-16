'use strict';

const { ipcRenderer } = require('electron');
const { languageEnum, engineList, getOption } = require('./translator/engine-module');
//const baidu = require('./translator/baidu');
const caiyun = require('./translator/caiyun');
const youdao = require('./translator/youdao');
const google = require('./translator/google');

async function translate(text, translation, table = []) {
    const engine = translation.engine;
    const autoChange = translation.autoChange;

    // set option
    let option = getOption(engine, translation.from, translation.to, text);

    let translatedText = '';
    let retryCount = 0;
    let missingCodes = [];

    do {
        option.text = fixCode(option.text, missingCodes);
        translatedText = await executeEngine(engine, option);
        retryCount++;

        // auto change
        if (translatedText === '') {
            console.log('Response is empty.');

            if (autoChange) {
                for (let index = 0; index < engineList.length; index++) {
                    const nextEngine = engineList[index];

                    if (nextEngine !== engine) {
                        console.log(`Use ${nextEngine}.`);
                        //ipcRenderer.send('send-index', 'show-notification', `翻譯失敗，切換至${nextEngine}`);

                        option = getOption(nextEngine, translation.from, translation.to, text);
                        translatedText = await executeEngine(nextEngine, option);
                        if (translatedText !== '') {
                            break;
                        }
                    }
                }
            }
        }

        missingCodes = missingCodeCheck(translatedText, table);
    } while (missingCodes.length > 0 && retryCount < 3);

    return await zhtConvert(translatedText, translation.to);
}

async function executeEngine(engine, option) {
    let translatedText = '';

    switch (engine) {
        case 'Baidu':
            //translatedText = await baidu.translate(option.text, option.from, option.to);
            translatedText = ipcRenderer.sendSync('translate', engine, option);
            console.log(engine + ':', translatedText);
            break;

        case 'Caiyun':
            translatedText = await caiyun.translate(option.text, option.from, option.to);
            break;

        case 'Youdao':
            translatedText = await youdao.translate(option.text, option.from, option.to);
            break;

        case 'Google':
            translatedText = await google.translate(option.text, option.from, option.to);
            break;

        default:
            //translatedText = await baidu.translate(option.text, option.from, option.to);
            translatedText = ipcRenderer.sendSync('translate', 'Baidu', option);
            console.log(engine + ':', translatedText);
    }

    return translatedText;
}

async function zhtConvert(text, languageTo) {
    if (languageTo === languageEnum.zht && text !== '') {
        const response = await google.translate(text, 'zh-CN', 'zh-TW');
        return response !== '' ? response : text;
    } else {
        return text;
    }
}

function missingCodeCheck(text, table) {
    let missingCodes = [];

    if (table.length > 0) {
        for (let index = 0; index < table.length; index++) {
            const code = table[index][0];
            if (!new RegExp(code, 'gi').test(text)) {
                missingCodes.push(code);
            }
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

exports.translate = translate;