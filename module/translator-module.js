'use strict';

const { languageTable, baiduTable, caiyunTable, youdaoTable, googleTable } = require('./translator/language-table');
const baidu = require('./translator/baidu');
const caiyun = require('./translator/caiyun');
const youdao = require('./translator/youdao');
const google = require('./translator/google');

const enginelist = ['Baidu', 'Caiyun', 'Youdao', 'Google'];

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
            for (let index = 0; index < enginelist.length; index++) {
                const otherEngine = enginelist[index];

                console.log('Use ' + otherEngine + '.');

                if (otherEngine !== engine) {
                    response = await selectEngine(otherEngine, input);

                    if (response !== '') {
                        break;
                    }
                }
            }
        }
    }

    return response;
}

async function selectEngine(engine, input) {
    let text = '';

    switch (engine) {
        case 'Baidu':
            text = await baidu.translate(input.text, baiduTable[input.from], baiduTable[input.to]);
            break;

        case 'Caiyun':
            text = await caiyun.translate(input.text, caiyunTable[input.from], caiyunTable[input.to]);
            break;

        case 'Youdao':
            text = await youdao.translate(input.text, youdaoTable[input.from], youdaoTable[input.to]);
            break;

        case 'Google':
            text = await google.translate(input.text, googleTable[input.from], googleTable[input.to]);
            break;

        default:
            text = await baidu.translate(input.text, baiduTable[input.from], baiduTable[input.to]);
    }

    return await zhConvert(text, input.to);
}

async function zhConvert(text, languageTo) {
    if ([languageTable.zht, languageTable.zhs].includes(languageTo)) {
        const input = {
            text: text,
            from: languageTo === languageTable.zht ? languageTable.zhs : languageTable.zht,
            to: languageTo
        };

        const response = await google.translate(input.text, googleTable[input.from], googleTable[input.to]);

        return response !== '' ? response : text;
    } else {
        return text;
    }
}

exports.translate = translate;