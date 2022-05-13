'use strict';

const { youdaoTranslator } = require('translators');

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const res = await youdaoTranslator(text, languageFrom, languageTo, {});

        console.log('Youdao:', res);
        return res;
    } catch (error) {
        console.log('Youdao:', error);
        return '';
    }
}

exports.translate = translate;