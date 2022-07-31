'use strict';

const { ipcRenderer } = require('electron');
const { languageEnum, AvailableEngineList, getOption } = require('./engine-module');

async function translate(text, translation, table = []) {
    if (text === '') {
        return '';
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
        translatedText = getTranslation(engine, option);

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
                        translatedText = getTranslation(engine, option);

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
                    translatedText = getTranslation(engine, option);

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

function getTranslation(engine, option) {
    let translatedText = ipcRenderer.sendSync('get-translation', engine, option);
    console.log(engine + ':', translatedText);

    return translatedText;
}

function zhtConvert(text, languageTo) {
    if (languageTo === languageEnum.zht) {
        return getTranslation('zhConvert', { text: text, tableName: 'zh2Hant' });
    } else if (languageTo === languageEnum.zhs) {
        return getTranslation('zhConvert', { text: text, tableName: 'zh2Hans' });
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

exports.translate = translate;
