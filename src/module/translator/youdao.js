'use strict';

// youdao function
const youdaoFunction = require('./youdao-function');

// request module
const requestModule = require('../system/request-module');

// RegExp
// const userIdRegExp = /(?<target>OUTFOX_SEARCH_USER_ID=[^;]+)/is;

// expire date
let expireDate = 0;

// cookie
let cookie = '';

// authentication
let authentication = {};

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

        // get keyword
        // youdaoFunction.getKeyword(option);

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
    cookie = `OUTFOX_SEARCH_USER_ID=${(2147483647 * Math.random()).toFixed(0)}@10.108.162.139; ` + `OUTFOX_SEARCH_USER_ID_NCOO=${2147483647 * Math.random()}`;
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
                        ...youdaoFunction.createParams('asdjnjfenknafdfsdfsd'),
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
            'sec-ch-ua': requestModule.getSCU(),
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
                ...{ i: option.text, from: option.from, to: option.to, dictResult: 'true', keyid: 'webfanyi' },
                ...youdaoFunction.createParams(authentication.secretKey),
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
            'sec-ch-ua': requestModule.getSCU(),
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': requestModule.getUserAgent(),
        }
    );

    if (response) {
        const jsonString = youdaoFunction.decodeData(response);
        const data = JSON.parse(jsonString);

        console.log('json string:', jsonString);

        if (data?.translateResult?.[0]) {
            // getKeyword(option);

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

// module exports
module.exports = { exec };
