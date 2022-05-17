'use strict';

// baidu
const baidu = require("baidu-translate-api");

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const response = await baidu(text, { from: languageFrom, to: languageTo });

        console.log('Baidu:', response);
        return response.trans_result.dst;
    } catch (error) {
        console.log('Baidu:', error);
        return '';
    }
}

exports.translate = translate;