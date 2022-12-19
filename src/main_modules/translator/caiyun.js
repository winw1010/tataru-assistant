'use strict';

// axios module
const axiosModule = require('../system/axios-module');

// translate
async function exec(option) {
    try {
        const postData = {
            source: option.text,
            trans_type: `${option.from}2${option.to}`,
            replaced: true,
            detect: true,
            media: 'text',
            request_id: '5a096eec830f7876a48aac47',
        };

        const response = (
            await axiosModule.post('https://api.interpreter.caiyunai.com/v1/translator', postData, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-authorization': 'token lqkr1tfixq1wa9kmj9po',
                },
            })
        )?.target;

        if (response) {
            return response;
        } else {
            throw 'ERROR: exec';
        }
    } catch (error) {
        console.log(error);
        return '';
    }
}

// module exports
module.exports = { exec };
