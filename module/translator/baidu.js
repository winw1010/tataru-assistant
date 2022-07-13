'use strict';

// baidu
const baidu = require('translate-baidu')

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const response = await baidu(text, { from: languageFrom, to: languageTo });

        console.log('Baidu:', response);
        return response.dst;
    } catch (error) {
        console.log('Baidu:', error);
        return '';
    }
}

exports.translate = translate;