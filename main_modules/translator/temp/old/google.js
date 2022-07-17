'use strict';

// google
const google = require('@hobbica98/google-translate-api');

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const response = await google(text, { from: languageFrom, to: languageTo });

        console.log('Google:', response);
        return response.text;
    } catch (error) {
        console.log('Google:', error);
        return '';
    }
}

exports.translate = translate;