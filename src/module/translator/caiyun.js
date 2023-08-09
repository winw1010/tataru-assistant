'use strict';

// request module
const requestModule = require('../system/request-module');

// translate
async function exec(option) {
    try {
        const response = await requestModule.post(
            {
                protocol: 'https:',
                hostname: 'api.interpreter.caiyunai.com',
                path: '/v1/translator',
            },
            JSON.stringify({
                source: option.text,
                trans_type: `${option.from}2${option.to}`,
                replaced: true,
                detect: true,
                media: 'text',
                request_id: '5a096eec830f7876a48aac47',
            }),
            {
                'Content-Type': 'application/json',
                'x-authorization': 'token lqkr1tfixq1wa9kmj9po',
            }
        );

        if (response?.target) {
            return response.target;
        } else {
            console.log('option:', option);
            console.log('data:', response);
            throw 'ERROR: translate';
        }
    } catch (error) {
        console.log(error);
        return '';
    }
}

// module exports
module.exports = { exec };
