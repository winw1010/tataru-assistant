'use strict';

// https
const https = require('https');

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

// https post
async function httpsPost(postData, options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.on('data', (data) => {
                if (res.statusCode == 200) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
        });

        req.on('error', (error) => {
            reject(error.message);
        });

        req.write(postData);
        req.end();
    });
}

exports.translate = translate;