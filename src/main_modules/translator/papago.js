'use strict';

// CryptoJS
const CryptoJS = require('crypto-js');

// request module
const { makeRequest, requestCookie } = require('../system/request-module');

// user agent
const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

// RegExp
const JSESSIONIDRegExp = /(?<target>JSESSIONID=.+?)(?=;|$)/is;
const mainJsRegExp = /src="\/(?<target>main\..+?\.js)"/is;
const versionRegExp = /HmacMD5\(.+,"(?<target>.+)"\)\.toString\(.+?\.enc\.Base64\)/is;

// https://papago.naver.com/
// https://papago.naver.com/main.7fb83b159297990e1b87.chunk.js
// Authorization:"PPG "+t+":"+p.a.HmacMD5(t+"\n"+e.split("?")[0]+"\n"+n,"v1.7.2_9d7a38d925").toString(p.a.enc.Base64),Timestamp:n

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
    const response = await requestCookie('papago.naver.com', '/', JSESSIONIDRegExp, '');

    expireDate = response.expireDate;
    cookie = response.cookie;
}

// set authentication
async function setAuthentication() {
    const callback1 = function (response, chunk) {
        if (response.statusCode === 200) {
            const data = mainJsRegExp.exec(chunk.toString())?.groups?.target;

            if (data) {
                return data;
            }
        }
    };

    const response1 = await makeRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'papago.naver.com',
            path: '/',
        },
        callback: callback1,
    });

    if (response1) {
        const callback2 = function (response, chunk) {
            if (response.statusCode === 200) {
                const data = versionRegExp.exec(chunk.toString())?.groups?.target;

                if (data) {
                    return data;
                }
            }
        };

        const response2 = await makeRequest({
            options: {
                method: 'GET',
                protocol: 'https:',
                hostname: 'papago.naver.com',
                path: '/' + response1,
            },
            callback: callback2,
        });

        if (response2) {
            authentication = {
                deviceId: generateDeviceId(),
                papagoVersion: response2,
            };
        }
    }

    if (!authentication) {
        authentication = {
            deviceId: generateDeviceId(),
            papagoVersion: 'v1.7.2_9d7a38d925',
        };
    }
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

// module exports
module.exports = { exec };
