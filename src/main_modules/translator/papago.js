'use strict';

// https://papago.naver.com/main.326c5bbc1f1b8e106d89.chunk.js
// return{Authorization:"PPG "+t+":"+p.a.HmacMD5(t+"\n"+e.split("?")[0]+"\n"+n,"v1.6.9_0f9c783dcc").toString(p.a.enc.Base64),Timestamp:n}

// CryptoJS
const CryptoJS = require('crypto-js');

// request module
const { makeRequest, requestCookie } = require('./request-module');

// user agent
const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';

// RegExp
const JSESSIONIDRegExp = /(?<target>JSESSIONID=.*?)(?=;|$)/i;
const papagoVersionRegExp = /"(?<target>v\d+?\.\d+?\.\d+?_.+?)"/i;

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
    const response = await requestCookie('papago.naver.com', '/', JSESSIONIDRegExp, '');

    expireDate = response.expireDate;
    cookie = response.cookie;
}

// set authentication
async function setAuthentication() {
    const callback = function (response, chunk) {
        const chunkString = chunk.toString();

        if (response.statusCode === 200 && papagoVersionRegExp.test(chunkString)) {
            return {
                deviceId: generateDeviceId(),
                papagoVersion: papagoVersionRegExp.exec(chunkString)?.groups?.target || 'v1.6.9_0f9c783dcc',
            };
        }
    };

    authentication = (await makeRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'papago.naver.com',
            path: '/main.326c5bbc1f1b8e106d89.chunk.js',
        },
        headers: [
            ['sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'],
            ['sec-ch-ua-mobile', '?0'],
            ['sec-ch-ua-platform', '"Windows"'],
            ['Upgrade-Insecure-Requests', '1'],
            ['user-agent', userAgent],
        ],
        callback: callback,
    })) || {
        deviceId: generateDeviceId(),
        papagoVersion: 'v1.6.9_0f9c783dcc',
    };
}

// translate
async function translate(cookie, authentication, option) {
    const currentTime = new Date().getTime();
    const authorization = `PPG ${authentication.deviceId}:${generateSignature(authentication.deviceId, currentTime)}`;

    const postData =
        `deviceId=${authentication.deviceId}` +
        '&locale=en-US' +
        '&dict=true' +
        '&dictDisplay=30' +
        '&honorific=false' +
        '&instant=false' +
        '&paging=false' +
        `&source=${option.from}` +
        `&target=${option.to}` +
        `&text=${option.text}`;

    const callback = function (response, chunk) {
        if (response.statusCode === 200) {
            const data = JSON.parse(chunk.toString());

            if (data.translatedText) {
                return data.translatedText;
            }
        }
    };

    return await makeRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'papago.naver.com',
            path: '/apis/n2mt/translate',
        },
        headers: [
            ['accept', 'application/json'],
            ['accept-encoding', 'gzip, deflate, br'],
            ['accept-language', 'en-US'],
            ['authorization', authorization],
            ['content-type', 'application/x-www-form-urlencoded; charset=UTF-8'],
            ['cookie', cookie],
            ['origin', 'https://papago.naver.com'],
            ['referer', 'https://papago.naver.com/'],
            ['sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'],
            ['sec-ch-ua-mobile', '?0'],
            ['sec-ch-ua-platform', '"Windows"'],
            ['sec-fetch-dest', 'empty'],
            ['sec-fetch-mode', 'cors'],
            ['sec-fetch-site', 'same-origin'],
            ['timestamp', currentTime],
            ['user-agent', userAgent],
            ['x-apigw-partnerid', 'papago'],
        ],
        data: encodeURI(postData),
        callback: callback,
    });
}

// get device id
function generateDeviceId() {
    var a = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (e) {
        var t = (a + 16 * Math.random()) % 16 | 0;
        return (a = Math.floor(a / 16)), ('x' === e ? t : (3 & t) | 8).toString(16);
    });
}

// get hash
function generateSignature(deviceId, timestamp) {
    return CryptoJS.HmacMD5(
        `${deviceId}\n${'https://papago.naver.com/apis/n2mt/translate'}\n${timestamp}`,
        authentication.papagoVersion
    ).toString(CryptoJS.enc.Base64);
}

exports.exec = exec;
