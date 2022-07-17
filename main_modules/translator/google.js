'use strict';

// google
const google = require('@hobbica98/google-translate-api');

// translate
async function exec(option) {
    let result = '';

    try {
        const response = await google(option.text, { from: option.from, to: option.to });
        result = response.text;
    } catch (error) {
        console.log(error);
    }

    return result;
}

exports.exec = exec;