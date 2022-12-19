'use strict';

// google encoder
const { tokenEncoder } = require('./google-encoder');

// axios module
const axiosModule = require('../system/axios-module');

// translate
async function exec(option) {
    try {
        const path =
            `/translate_a/single?client=webapp&sl=${option.from}&tl=${option.to}&hl=${option.to}` +
            `&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=sos&dt=ss&dt=t&otf=2&ssel=0&tsel=0&kc=3` +
            `&tk=${tokenEncoder(option.text)}&q=${option.text}`;

        const response = (
            await axiosModule.get('https://translate.google.com' + encodeURI(path), {
                headers: {
                    accept:
                        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'en-US,en;q=0.5',
                    'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'none',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    'user-agent': axiosModule.getUserAgent(),
                },
            })
        )[0];

        if (response) {
            let result = '';

            for (let index = 0; index < response.length; index++) {
                result += response[index][0] || '';
            }

            return result;
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
