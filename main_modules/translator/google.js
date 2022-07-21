'use strict';

// json fixer
const jsonFixer = require('json-fixer');

// request module
const { startRequest } = require('./request-module');

// google encoder
const { tokenEncoder } = require('./googleEncoder');

// user agent
const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';

// translate
async function exec(option) {
    let result = '';

    try {
        const path =
            `/translate_a/single?client=webapp&sl=${option.from}&tl=${option.to}&hl=${option.to}` +
            `&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=sos&dt=ss&dt=t&otf=2&ssel=0&tsel=0&kc=3` +
            `&tk=${tokenEncoder(option.text)}&q=${option.text}`;

        const callback = function (response, chunk) {
            try {
                if (response.statusCode === 200) {
                    let result = '';
                    const { data } = jsonFixer(chunk.toString());

                    if (data[0] && data[0] instanceof Array) {
                        for (let index = 0; index < data[0].length; index++) {
                            const element = data[0][index][0];

                            if (element) {
                                result += element;
                            }
                        }
                    }
                    return result;
                }
            } catch (error) {
                console.log(error);
            }
        };

        result = await startRequest({
            options: {
                method: 'GET',
                protocol: 'https:',
                hostname: 'translate.google.com',
                path: encodeURI(path),
            },
            headers: [
                [
                    'accept',
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                ],
                ['accept-encoding', 'gzip, deflate, br'],
                ['accept-language', 'en-US,en;q=0.5'],
                ['sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'],
                ['sec-ch-ua-mobile', '?0'],
                ['sec-ch-ua-platform', '"Windows"'],
                ['sec-fetch-dest', 'document'],
                ['sec-fetch-mode', 'navigate'],
                ['sec-fetch-site', 'none'],
                ['sec-fetch-user', '?1'],
                ['upgrade-insecure-requests', '1'],
                ['user-agent', userAgent],
            ],
            callback: callback,
        });
    } catch (error) {
        console.log(error);
    }

    return result;
}

exports.exec = exec;
