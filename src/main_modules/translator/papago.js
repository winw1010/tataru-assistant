'use strict';

// CryptoJS
const CryptoJS = require('crypto-js');

// axios module
const axiosModule = require('../system/axios-module');

// RegExp
const JSESSIONIDRegExp = /(?<target>JSESSIONID=.+?)(?=;|$)/is;
const mainJsRegExp = /src="\/(?<target>main\..+?\.chunk\.js)"/is;
const versionRegExp = /HmacMD5\(.+,"(?<target>.+)"\)\.toString\(.+?\.enc\.Base64\)/is;

// https://papago.naver.com/
// https://papago.naver.com/main.7fb83b159297990e1b87.chunk.js
// Authorization:"PPG "+t+":"+p.a.HmacMD5(t+"\n"+e.split("?")[0]+"\n"+n,"v1.7.2_9d7a38d925").toString(p.a.enc.Base64),Timestamp:n

// expire date
let expiryDate = 0;

// cookie
let cookie = '';

// authentication
let authentication = {};

// exec
async function exec(option) {
    try {
        let result = '';

        // check expire date
        if (new Date().getTime() >= expiryDate) {
            await initialize();
        }

        // get result
        result = await translate(cookie, authentication, option);

        return result;
    } catch (error) {
        console.log(error);
        expiryDate = 0;
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
    const response = JSESSIONIDRegExp.exec(await axiosModule.getCookie('https://papago.naver.com'))?.groups?.target;

    if (response) {
        cookie = response;
        expiryDate = axiosModule.getExpiryDate();
    } else {
        throw 'ERROR: setCookie';
    }
}

// set authentication
async function setAuthentication() {
    const response1 = mainJsRegExp.exec(await axiosModule.get('https://papago.naver.com'))?.groups?.target;

    if (response1) {
        const response2 = versionRegExp.exec(await axiosModule.get('https://papago.naver.com/' + response1))?.groups
            ?.target;

        if (response2) {
            authentication = {
                deviceId: generateDeviceId(),
                papagoVersion: response2,
            };
        } else {
            throw 'ERROR: setAuthentication';
        }
    } else {
        throw 'ERROR: setAuthentication';
    }
}

// translate
async function translate(cookie, authentication, option) {
    const currentTime = new Date().getTime();
    const authorization = `PPG ${authentication.deviceId}:${createSignature(authentication.deviceId, currentTime)}`;
    const postData = {
        deviceId: authentication.deviceId,
        locale: 'en-US',
        dict: 'true',
        dictDisplay: '30',
        honorific: 'false',
        instant: 'false',
        paging: 'false',
        source: option.from,
        target: option.to,
        text: option.text,
    };

    const response = (
        await axiosModule.post('https://papago.naver.com/apis/n2mt/translate', postData, {
            headers: {
                accept: 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US',
                authorization: authorization,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                cookie: cookie,
                origin: 'https://papago.naver.com',
                referer: 'https://papago.naver.com/',
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                timestamp: currentTime,
                'user-agent': axiosModule.getUserAgent(),
                'x-apigw-partnerid': 'papago',
            },
        })
    )?.translatedText;

    if (response) {
        return response;
    } else {
        throw 'ERROR: translate';
    }
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
function createSignature(deviceId, timestamp) {
    return CryptoJS.HmacMD5(
        `${deviceId}\n${'https://papago.naver.com/apis/n2mt/translate'}\n${timestamp}`,
        authentication.papagoVersion
    ).toString(CryptoJS.enc.Base64);
}

// module exports
module.exports = { exec };
