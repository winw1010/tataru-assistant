'use strict';

const { ipcRenderer } = require('electron');
const { languageEnum, AvailableEngineList, getOption } = require('./engine-module');

async function translate(text, translation, table = []) {
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
        translatedText = ipcRenderer.sendSync('get-translation', engine, option);
        console.log(engine + ':', translatedText);

        // add count
        retryCount++;

        // retry
        if (translatedText === '') {
            console.log('Response is empty.');

            // auto change
            if (autoChange) {
                for (let index = 0; index < AvailableEngineList.length; index++) {
                    const nextEngine = AvailableEngineList[index];

                    // find new engine
                    if (nextEngine !== engine) {
                        console.log(`Use ${nextEngine}.`);

                        // set new engine
                        engine = nextEngine;

                        // set new option
                        option = getOption(engine, translation.from, translation.to, option.text);

                        // retranslate
                        translatedText = ipcRenderer.sendSync('get-translation', engine, option);
                        console.log(engine + ':', translatedText);

                        if (translatedText !== '') {
                            break;
                        }
                    }
                }
            } else {
                for (let index = 0; index < 2; index++) {
                    // retranslate
                    translatedText = ipcRenderer.sendSync('get-translation', engine, option);
                    console.log(engine + ':', translatedText);

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

    return await zhtConvert(translatedText, translation.to);
}

async function zhtConvert(text, languageTo) {
    if (languageTo === languageEnum.zht && text !== '') {
        const option = {
            from: 'zh-CN',
            to: 'zh-TW',
            text: text,
        };
        const response = ipcRenderer.sendSync('get-translation', 'Google', option);
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
