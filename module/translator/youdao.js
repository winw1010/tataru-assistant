'use strict';

const { youdaoTranslator } = require('translators');

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const response = await youdaoTranslator(text, languageFrom, languageTo, {});

        console.log('Youdao:', response);
        return response;
    } catch (error) {
        console.log('Youdao:', error);
        return '';
    }
}

exports.translate = translate;