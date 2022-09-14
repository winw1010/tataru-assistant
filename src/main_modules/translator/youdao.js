'use strict';

// CryptoJS
const CryptoJS = require('crypto-js');

// request module
const { makeRequest, requestCookie } = require('./request-module');

// user agent
const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';

// RegExp
const userIdRegExp = /(?<target>OUTFOX_SEARCH_USER_ID=.*?)(?=;|$)/i;
const fanyideskwebRegExp = /\("fanyideskweb".*?"(?<target>.*?)"\)/i;
// const ncooRegExp = /(?<target>\d+) \* Math\.random\(\)/i;
// sign: n.md5("fanyideskweb" + e + i + "Ygy_4c=r#e#4EX^NUGUc5")

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

        /*
        console.log({
            expiredDate: expireDate,
            cookie: cookie,
            authentication: authentication,
            response: response
        });
        */

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
    const response = await requestCookie(
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
    const callback = function (response, chunk) {
        const chunkString = chunk.toString();
        if (response.statusCode === 200 && fanyideskwebRegExp.test(chunkString)) {
            let fanyideskweb = fanyideskwebRegExp.exec(chunkString)?.groups?.target || 'Ygy_4c=r#e#4EX^NUGUc5';

            return {
                fanyideskweb,
            };
        }
    };

    authentication = (await makeRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'shared.ydstatic.com',
            path: '/fanyi/newweb/v1.1.10/scripts/newweb/fanyi.min.js',
        },
        callback: callback,
    })) || {
        fanyideskweb: 'Ygy_4c=r#e#4EX^NUGUc5',
    };
}

// translate
async function translate(cookie, authentication, option) {
    const currentTime = new Date().getTime();
    const currentTime2 = currentTime + 1;
    const salt = currentTime2.toString() + parseInt(10 * Math.random(), 10).toString();

    const postData =
        `i=${option.text}` +
        `&from=${option.from}` +
        `&to=${option.to}` +
        '&smartresult=dict' +
        '&client=fanyideskweb' +
        `&salt=${salt}` +
        `&sign=${CryptoJS.MD5('fanyideskweb' + option.text + salt + authentication.fanyideskweb).toString()}` +
        `&lts=${currentTime2}` +
        '&bv=f0819a82107e6150005e75ef5fddcc3b' + //CryptoJS.MD5(ua.replace('Mozilla/', '')).toString()
        '&doctype=json' +
        '&version=2.1' +
        '&keyfrom=fanyi.web' +
        '&action=FY_BY_REALTlME'; //FY_BY_CLICKBUTTION

    const callback = function (response, chunk) {
        if (response.statusCode === 200) {
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
        }
    };

    return await makeRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'fanyi.youdao.com',
            path: '/translate_o?smartresult=dict&smartresult=rule',
        },
        headers: [
            ['Accept', 'application/json, text/javascript, */*; q=0.01'],
            ['Accept-Encoding', 'gzip, deflate, br'],
            ['Accept-Language', 'zh-CN,zh;q=0.9'],
            ['Connection', 'keep-alive'],
            ['Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'],
            ['Cookie', cookie + `; ___rl__test__cookies=${currentTime}`],
            ['Origin', 'https://fanyi.youdao.com'],
            ['Referer', 'http://fanyi.youdao.com/'],
            ['sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'],
            ['sec-ch-ua-mobile', '?0'],
            ['sec-ch-ua-platform', '"Windows"'],
            ['Sec-Fetch-Dest', 'empty'],
            ['Sec-Fetch-Mode', 'cors'],
            ['Sec-Fetch-Site', 'same-origin'],
            ['User-Agent', userAgent],
            ['X-Requested-With', 'XMLHttpRequest'],
        ],
        data: encodeURI(postData),
        callback: callback,
    });
}

exports.exec = exec;
