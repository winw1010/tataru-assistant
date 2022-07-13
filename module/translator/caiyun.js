'use strict';

// post
const { httpsRequest } = require('../https-module');

// start
async function translate(text, languageFrom, languageTo) {
    try {
        const url = 'https://api.interpreter.caiyunai.com/v1/translator';

        const options = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-authorization': 'token lqkr1tfixq1wa9kmj9po'
            },
            timeout: 10000
        };

        const postData = JSON.stringify({
            source: text,
            trans_type: `${languageFrom}2${languageTo}`,
            replaced: true,
            detect: true,
            media: 'text',
            request_id: '5a096eec830f7876a48aac47'
        });

        const response = await httpsRequest(url, options, postData);

        console.log('Caiyun:', JSON.parse(response).target);
        return JSON.parse(response).target;
    } catch (error) {
        console.log('Caiyun:', error);
        return '';
    }
}

exports.translate = translate;