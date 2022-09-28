'use strict';

// request module
const { makeRequest } = require('./request-module');

// translate
async function exec(option) {
    try {
        let result = '';

        const postData = {
            source: option.text,
            trans_type: `${option.from}2${option.to}`,
            replaced: true,
            detect: true,
            media: 'text',
            request_id: '5a096eec830f7876a48aac47',
        };

        const callback = function (response, chunk) {
            if (response.statusCode === 200) {
                const data = JSON.parse(chunk.toString());
                if (data.target) {
                    return data.target;
                }
            }
        };

        result = await makeRequest({
            options: {
                method: 'POST',
                protocol: 'https:',
                hostname: 'api.interpreter.caiyunai.com',
                path: '/v1/translator',
            },
            headers: [
                ['Content-Type', 'application/json'],
                ['x-authorization', 'token lqkr1tfixq1wa9kmj9po'],
            ],
            data: JSON.stringify(postData),
            callback: callback,
        });

        return result;
    } catch (error) {
        console.log(error);
        return '';
    }
}

// module exports
module.exports = { exec };
