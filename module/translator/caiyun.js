'use strict';

// post
const { httpsPost } = require('../https-module');

// start
async function translate(text, languageFrom, languageTo) {
    try {
        const postData = JSON.stringify({
            source: text,
            trans_type: `${languageFrom}2${languageTo}`,
            replaced: true,
            detect: true,
            media: 'text',
            request_id: '5a096eec830f7876a48aac47'
        });

        const options = {
            hostname: 'api.interpreter.caiyunai.com',
            path: '/v1/translator',
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-authorization': 'token lqkr1tfixq1wa9kmj9po'
            },
            timeout: 10000
        };

        const response = await httpsPost(postData, options);

        console.log('Caiyun:', response);
        return JSON.parse(response).target;
    } catch (error) {
        console.log('Caiyun:', error);
        return '';
    }
}

exports.translate = translate;