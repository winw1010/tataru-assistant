'use strict';

// google function
const { getToken } = require('./google-function');

// request module
const requestModule = require('../system/request-module');

// translate
async function exec(option) {
    try {
        const parameters =
            `client=webapp&sl=${option.from}&tl=${option.to}&hl=${option.to}` +
            `&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=sos&dt=ss&dt=t&otf=2&ssel=0&tsel=0&kc=3` +
            `&tk=${getToken(option.text)}&q=${option.text}`;

        const response = await requestModule.get(
            {
                protocol: 'https:',
                hostname: 'translate.google.com',
                path: '/translate_a/single?' + encodeURI(parameters),
            },
            {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.5',
                'sec-ch-ua': requestModule.getSCU(),
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': requestModule.getUserAgent(),
            }
        );

        if (response?.[0] && response[0] instanceof Array) {
            let result = '';

            for (let index = 0; index < response[0].length; index++) {
                result += response[0][index]?.[0] || '';
            }

            return result;
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
