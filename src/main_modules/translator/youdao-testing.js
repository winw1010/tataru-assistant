'use strict';

// https://shared.ydstatic.com/api/fanyi-web-v1.3/assets/index.min.js
// https://shared.ydstatic.com/js/rlog/v1.js
// https://fanyi.youdao.com/js/chunk-vendors.4ea1c345.js
// https://fanyi.youdao.com/js/app.afd40d32.js

// CryptoJS
const CryptoJS = require('crypto-js');

// request module
const requestModule = require('../system/request-module');

// RegExp
const userIdRegExp = /(?<target>OUTFOX_SEARCH_USER_ID=.*?)(?=;|$)/is;
// const ncoo = 2147483647 * Math.random();

// expire date
let expireDate = 0;

// cookie
let cookie = null;

// authentication
let authentication = null;

// exec
async function exec(option) {
    try {
        let result = '';

        // check expire date
        if (new Date().getTime() >= expireDate || !cookie || !authentication) {
            await initialize();
        }

        // get result
        result = await translate(cookie, authentication, option);

        // if result is blank => reset expire date
        if (!result) {
            throw 'No Response';
        }

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
    const response = await requestModule.requestCookie(
        'fanyi.youdao.com',
        '/',
        userIdRegExp,
        `; OUTFOX_SEARCH_USER_ID_NCOO=${2147483647 * Math.random()}`
    );
    expireDate = response.expireDate;
    cookie = response.cookie;
}

// set authentication
async function setAuthentication() {
    authentication = {
        fanyideskweb: 'Ygy_4c=r#e#4EX^NUGUc5',
    };
}

//const CryptoJS = require('crypto-js');
function getSign(currentTime) {
    return CryptoJS.MD5(
        `client=${'fanyideskweb'}&mysticTime=${currentTime}&product=${'webfanyi'}&key=${'fsdsogkndfokasodnaso'}`
    ).toString();
}

// translate
async function translate(cookie, authentication, option) {
    const currentTime = new Date().getTime();

    const postData =
        `i=${option.text}` +
        `&from=${option.from}` +
        `&to=${option.to}` +
        '&domain=0' +
        '&dictResult=true' +
        `&keyid=webfanyi` +
        `&sign=${getSign(currentTime)}` +
        '&client=fanyideskweb' +
        `&product=webfanyi` +
        '&appVersion=1.0.0' +
        '&vendor=web' +
        '&pointParam=client,mysticTime,product' +
        `&mysticTime=${currentTime}` +
        '&keyfrom=fanyi.web';

    console.log(encodeURI(postData));

    const callback = function (response, chunk) {
        if (response.statusCode === 200) {
            console.log('chunk:', chunk.toString());
            /*
            const data = JSON.parse(chunk.toString());

            if (data.translateResult) {
                let result = '';
                const resultArray = data.translateResult[0];

                for (let index = 0; index < resultArray.length; index++) {
                    const element = resultArray[index];
                    result += element?.tgt || '';
                }

                return result;
            }
            */
        }
    };

    return await requestModule.makeRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'dict.youdao.com',
            path: '/webtranslate',
        },
        headers: [
            ['Accept', 'application/json, text/plain, */*'],
            ['Accept-Encoding', 'gzip, deflate, br'],
            ['Accept-Language', 'zh-CN,zh;q=0.9'],
            ['Connection', 'keep-alive'],
            ['Content-Type', 'application/x-www-form-urlencoded'],
            ['Cookie', 'UTFOX_SEARCH_USER_ID=391438737@10.108.162.138; OUTFOX_SEARCH_USER_ID_NCOO=1358857606.231445'],
            ['Origin', 'https://fanyi.youdao.com'],
            ['Referer', 'http://fanyi.youdao.com/'],
            ['sec-ch-ua', '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"'],
            ['sec-ch-ua-mobile', '?0'],
            ['sec-ch-ua-platform', '"Windows"'],
            ['Sec-Fetch-Dest', 'empty'],
            ['Sec-Fetch-Mode', 'cors'],
            ['Sec-Fetch-Site', 'same-site'],
            ['User-Agent', requestModule.userAgent],
        ],
        data: encodeURI(postData),
        callback: callback,
    });
}

// module exports
module.exports = { exec };
