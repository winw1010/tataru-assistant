'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

const {
    languageTable,
    engineList,
    baiduTable,
    caiyunTable,
    youdaoTable,
    papagoTable,
    deeplTable,
    googleTable,
    getTableValue
} = require('./translator/language-table');

const baidu = require('./translator/baidu');
const caiyun = require('./translator/caiyun');
const youdao = require('./translator/youdao');
const papago = require('./translator/papago');
const deepl = require('./translator/deepl');
const google = require('./translator/google');

async function translate(text, engine, languageFrom, languageTo, autoChange = true) {
    // set input
    const input = {
        text: text,
        from: languageFrom,
        to: languageTo
    };

    let response = await selectEngine(engine, input);

    // auto change
    if (response === '') {
        console.log('Response is empty.');

        if (autoChange) {
            for (let index = 0; index < engineList.length; index++) {
                const element = engineList[index];

                if (element !== engine) {
                    console.log(`Use ${element}.`);
                    ipcRenderer.send('send-index', 'show-notification', `${engine}翻譯失敗，嘗試使用${element}重新翻譯`);

                    response = await selectEngine(element, input);

                    if (response !== '') {
                        break;
                    }
                }
            }
        }
    }

    return await zhConvert(response, languageTo);
}

async function selectEngine(engine, input) {
    let text = '';

    switch (engine) {
        case 'Baidu':
            text = await baidu.translate(input.text, getTableValue(input.from, baiduTable), getTableValue(input.to, baiduTable));
            break;

        case 'Caiyun':
            text = await caiyun.translate(input.text, getTableValue(input.from, caiyunTable), getTableValue(input.to, caiyunTable));
            break;

        case 'Youdao':
            text = await youdao.translate(input.text, getTableValue(input.from, youdaoTable), getTableValue(input.to, youdaoTable));
            break;

        case 'Papago':
            text = await papago.translate(input.text, getTableValue(input.from, papagoTable), getTableValue(input.to, papagoTable));
            break;

        case 'DeepL':
            text = await deepl.translate(input.text, getTableValue(input.from, deeplTable), getTableValue(input.to, deeplTable));
            break;

        case 'Google':
            text = await google.translate(input.text, getTableValue(input.from, googleTable), getTableValue(input.to, googleTable));
            break;

        default:
            text = await baidu.translate(input.text, getTableValue(input.from, baiduTable), getTableValue(input.to, baiduTable));
    }

    return text;
}

async function zhConvert(text, languageTo) {
    if (text !== '' && [languageTable.zht, languageTable.zhs].includes(languageTo)) {
        const input = {
            text: text,
            from: languageTo === languageTable.zht ? languageTable.zhs : languageTable.zht,
            to: languageTo
        };

        const response = await google.translate(input.text, getTableValue(input.from, googleTable), getTableValue(input.to, googleTable));

        return response !== '' ? response : text;
    } else {
        return text;
    }
}

exports.translate = translate;