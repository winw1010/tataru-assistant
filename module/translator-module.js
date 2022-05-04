'use strict';

const { languageTable, engineList, baiduTable, caiyunTable, youdaoTable, googleTable, getTableValue } = require('./translator/language-table');
const baidu = require('./translator/baidu');
const caiyun = require('./translator/caiyun');
const youdao = require('./translator/youdao');
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
                const otherEngine = engineList[index];

                if (otherEngine !== engine) {
                    console.log(`Use ${otherEngine}.`);
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
            text = await baidu.translate(input.text, getTableValue(input.from, baiduTable), getTableValue(input.to, baiduTable));
            break;

        case 'Caiyun':
            text = await caiyun.translate(input.text, getTableValue(input.from, caiyunTable), getTableValue(input.to, caiyunTable));
            break;

        case 'Youdao':
            text = await youdao.translate(input.text, getTableValue(input.from, youdaoTable), getTableValue(input.to, youdaoTable));
            break;

        case 'Google':
            text = await google.translate(input.text, getTableValue(input.from, googleTable), getTableValue(input.to, googleTable));
            break;

        default:
            text = await baidu.translate(input.text, getTableValue(input.from, baiduTable), getTableValue(input.to, baiduTable));
    }

    return await zhConvert(text, input.to);
}

async function zhConvert(text, languageTo) {
    if (languageTo.match(new RegExp([languageTable.zht, languageTable.zhs].join('|'), 'gi'))) {
        const input = {
            text: text,
            from: languageTo.match(new RegExp(languageTable.zht, 'gi')) ? languageTable.zhs : languageTable.zht,
            to: languageTo
        };

        const response = await google.translate(input.text, getTableValue(input.from, googleTable), getTableValue(input.to, googleTable));

        return response !== '' ? response : text;
    } else {
        return text;
    }
}

exports.translate = translate;