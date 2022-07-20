'use strict';

// json fixer
const jsonFixer = require('json-fixer');

// request module
const { startRequest } = require('./request-module');

// translate
async function exec(option) {
    let result = '';

    try {
        const postData = {
            source: option.text,
            trans_type: `${option.from}2${option.to}`,
            replaced: true,
            detect: true,
            media: 'text',
            request_id: '5a096eec830f7876a48aac47',
        };

        const callback = function (response, chunk) {
            try {
                if (response.statusCode === 200) {
                    const { data } = jsonFixer(chunk.toString());
                    if (data.target) {
                        return data.target;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };

        result = await startRequest({
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
    } catch (error) {
        console.log(error);
    }

    return result;
}

exports.exec = exec;
