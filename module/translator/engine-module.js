'use strict';

const languageEnum = {
    auto: 'Auto',
    ja: 'Japanese',
    en: 'English',
    zht: 'Traditional-Chinese',
    zhs: 'Simplified-Chinese'
}

// for main.json
const languageIndex = {
    'Japanese': 0,
    'English': 1,
    'Traditional-Chinese': 2,
    'Simplified-Chinese': 3
}

const engineList = [
    'Baidu',
    'Caiyun',
    'Google',
    //'Papago',
    //'DeepL',
    //'Youdao'
];

const engineTable = {
    'Baidu': {
        'Auto': 'auto',
        'Japanese': 'jp',
        'English': 'en',
        'Traditional-Chinese': 'zh',
        'Simplified-Chinese': 'zh'
    },
    'Caiyun': {
        'Auto': 'auto',
        'Japanese': 'ja',
        'English': 'en',
        'Traditional-Chinese': 'zh',
        'Simplified-Chinese': 'zh'
    },
    'Youdao': {
        'Auto': 'auto',
        'Japanese': 'ja',
        'English': 'en',
        'Traditional-Chinese': 'zh-CHS',
        'Simplified-Chinese': 'zh-CHS'
    },
    'Papago': {
        'Auto': 'detect',
        'Japanese': 'ja',
        'English': 'en',
        'Traditional-Chinese': 'zh-CN',
        'Simplified-Chinese': 'zh-CN'
    },
    'DeepL': {
        'Auto': 'auto',
        'Japanese': 'ja',
        'English': 'en',
        'Traditional-Chinese': 'zh',
        'Simplified-Chinese': 'zh'
    },
    'Google': {
        'Auto': 'auto',
        'Japanese': 'ja',
        'English': 'en',
        'Traditional-Chinese': 'zh-CN',
        'Simplified-Chinese': 'zh-CN'
    }
}

function getOption(engine, from, to, text) {
    const table = engineTable[engine];

    return {
        from: table[from],
        to: table[to],
        text: text
    };
}

function getLanguageCode(language, engine) {
    const table = engineTable[engine];
    return table[language];
}

exports.engineList = engineList;
exports.languageEnum = languageEnum;
exports.languageIndex = languageIndex;
exports.getOption = getOption;
exports.getLanguageCode = getLanguageCode;