'use strict';

// google
const google = require('@hobbica98/google-translate-api');

// translate
async function exec(option) {
    try {
        const response = await google(option.text, { from: option.from, to: option.to });

        console.log('Google:', response);
        return response.text;
    } catch (error) {
        console.log('Google:', error);
        return '';
    }
}

exports.exec = exec;