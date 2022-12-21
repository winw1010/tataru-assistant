'use strict';

// crypto
const crypto = require('node:crypto');

// request module
const requestModule = require('../system/request-module');

// RegExp
// const userIdRegExp = /(?<target>OUTFOX_SEARCH_USER_ID=.*?)(?=;|$)/is;

// expire date
let expireDate = 0;

// cookie
let cookie = '';

// authentication
let authentication = {};

// parameters
const r = 'fanyideskweb',
    i = 'webfanyi',
    s = 'client,mysticTime,product',
    l = '1.0.0',
    d = 'web',
    u = 'fanyi.web';

// exec
async function exec(option) {
    try {
        let result = '';

        // check expire date
        if (new Date().getTime() >= expireDate) {
            await initialize();
        }

        // get result
        result = await translate(cookie, authentication, option);

        return result;
    } catch (error) {
        console.log(error);
        expireDate = 0;
        return '';
    }
}

// initialize
async function initialize() {
    // set cookie
    await setCookie();

    // set authentication
    await setAuthentication();
}

// set cookie
async function setCookie() {
    //cookie = 'OUTFOX_SEARCH_USER_ID=-1846428029@10.108.162.139; OUTFOX_SEARCH_USER_ID_NCOO=1596094722.4516084';
    cookie =
        `OUTFOX_SEARCH_USER_ID=${(2147483647 * Math.random()).toFixed(0)}@10.108.162.139; ` +
        `OUTFOX_SEARCH_USER_ID_NCOO=${2147483647 * Math.random()}`;
    expireDate = requestModule.getExpiryDate();
}

// set authentication
async function setAuthentication() {
    const response = await requestModule.get(
        {
            protocol: 'https:',
            hostname: 'dict.youdao.com',
            path:
                '/webtranslate/key?' +
                encodeURI(
                    requestModule.toParameters({
                        ...{ keyid: 'webfanyi-key-getter' },
                        ...createParams('asdjnjfenknafdfsdfsd'),
                    })
                ),
        },
        {
            Accept: 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-TW,zh;q=0.9',
            Connection: 'keep-alive',
            Cookie: cookie,
            Origin: 'https://fanyi.youdao.com',
            Referer: 'https://fanyi.youdao.com/',
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': requestModule.getUserAgent(),
        }
    );

    if (response?.data?.secretKey) {
        authentication.secretKey = response.data.secretKey;
    } else {
        throw 'ERROR: setAuthentication';
    }
}

// translate
async function translate(cookie, authentication, option) {
    const response = await requestModule.post(
        {
            protocol: 'https:',
            hostname: 'dict.youdao.com',
            path: '/webtranslate',
        },
        encodeURI(
            requestModule.toParameters({
                ...{ i: option.text, from: option.from, to: option.to, ...{}, dictResult: !0, keyid: 'webfanyi' },
                ...createParams(authentication.secretKey),
            })
        ),
        {
            Accept: 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-TW,zh;q=0.9',
            Connection: 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: cookie,
            Origin: 'https://fanyi.youdao.com',
            Referer: 'https://fanyi.youdao.com/',
            'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': requestModule.getUserAgent(),
        }
    );

    if (response) {
        const jsonString = decodeData(
            response,
            'ydsecret://query/key/B*RGygVywfNBwpmBaZg*WT7SIOUP2T0C9WHMZN39j^DAdaZhAnxvGcCY6VYFwnHl',
            'ydsecret://query/iv/C@lZe2YzHtZ2CYgaXKSVfsb7Y4QWHjITPPZ0nQp87fBeJ!Iv6v^6fvi2WN@bYpJ4'
        );

        console.log('json string:', jsonString);

        const data = JSON.parse(jsonString);

        if (data?.translateResult?.[0]) {
            //getKeyword(option);

            const resultArray = data.translateResult[0];
            let result = '';

            for (let index = 0; index < resultArray.length; index++) {
                result += resultArray?.[index]?.tgt || '';
            }

            return result;
        } else {
            console.log('cookie:', cookie);
            console.log('authentication:', authentication);
            console.log('option:', option);
            throw 'ERROR: translate';
        }
    } else {
        console.log('cookie:', cookie);
        console.log('authentication:', authentication);
        console.log('option:', option);
        throw 'ERROR: translate';
    }
}

// get keyword
// function getKeyword(option) {
//     requestModule.post(
//         {
//             protocol: 'https:',
//             hostname: 'dict.youdao.com',
//             path: '/keyword/key',
//         },
//         encodeURI(
//             requestModule.toParameters({
//                 text: option.text,
//                 lang: option.from === 'zh-CHS' ? 'zh' : option.from,
//                 to: option.to === 'zh-CHS' ? 'zh' : option.to,
//             })
//         ),
//         {
//             Accept: 'application/json, text/plain, */*',
//             'Accept-Encoding': 'gzip, deflate, br',
//             'Accept-Language': 'zh-TW,zh;q=0.9',
//             Connection: 'keep-alive',
//             'Content-Type': 'multipart/form-data',
//             Cookie: cookie,
//             Origin: 'https://fanyi.youdao.com',
//             Referer: 'https://fanyi.youdao.com/',
//             'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
//             'sec-ch-ua-mobile': '?0',
//             'sec-ch-ua-platform': '"Windows"',
//             'Sec-Fetch-Dest': 'empty',
//             'Sec-Fetch-Mode': 'cors',
//             'Sec-Fetch-Site': 'same-site',
//             'User-Agent': requestModule.getUserAgent(),
//         }
//     );
// }

// to MD5 string
function toMD5String(text) {
    return crypto.createHash('md5').update(text.toString()).digest('hex');
}

// to MD5 buffer
function toMD5Buffer(text) {
    return crypto.createHash('md5').update(text).digest();
}

// create sign
function createSign(currentTime, key) {
    return toMD5String(`client=${r}&mysticTime=${currentTime}&product=${i}&key=${key}`);
}

// create params
function createParams(key) {
    const t = new Date().getTime();
    return {
        sign: createSign(t, key),
        client: r,
        product: i,
        appVersion: l,
        vendor: d,
        pointParam: s,
        mysticTime: t,
        keyfrom: u,
    };
}

// decode data
function decodeData(responseString, decodeKey, decodeIv) {
    if (!responseString) return null;
    const a = Buffer.alloc(16, toMD5Buffer(decodeKey)), // decodeKey of app.********.js
        r = Buffer.alloc(16, toMD5Buffer(decodeIv)), // decodeIv of app.********.js
        i = crypto.createDecipheriv('aes-128-cbc', a, r);
    let s = i.update(responseString, 'base64', 'utf-8');
    return (s += i.final('utf-8')), s;
}

// module exports
module.exports = { exec };
