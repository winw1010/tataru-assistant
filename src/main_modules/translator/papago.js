'use strict';

// papago function
const papagoFunction = require('./papago-function');

// request module
const requestModule = require('../system/request-module');

// RegExp
const JSESSIONIDRegExp = /(?<target>JSESSIONID=.+?)(?=;|$)/is;
const mainJsRegExp = /src="\/(?<target>main\..+?\.chunk\.js)"/is;
const versionRegExp = /HmacMD5\(.+,"(?<target>.+)"\)\.toString\(.+?\.enc\.Base64\)/is;

// https://papago.naver.com/
// https://papago.naver.com/main.7fb83b159297990e1b87.chunk.js
// Authorization:"PPG "+t+":"+p.a.HmacMD5(t+"\n"+e.split("?")[0]+"\n"+n,"v1.7.2_9d7a38d925").toString(p.a.enc.Base64),Timestamp:n

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
        if (new Date().getTime() >= expireDate || !cookie || !authentication) {
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
    const response = await requestModule.getCookie(
        {
            protocol: 'https:',
            hostname: 'papago.naver.com',
            path: '/',
        },
        JSESSIONIDRegExp
    );

    if (response) {
        cookie = response;
        expireDate = requestModule.getExpiryDate();
    } else {
        throw 'ERROR: setCookie';
    }
}

// set authentication
async function setAuthentication() {
    const response1 = await requestModule.get({
        protocol: 'https:',
        hostname: 'papago.naver.com',
        path: '/',
    });

    const data1 = mainJsRegExp.exec(response1)?.groups?.target;

    if (data1) {
        const response2 = await requestModule.get({
            protocol: 'https:',
            hostname: 'papago.naver.com',
            path: '/' + data1,
        });

        const data2 = versionRegExp.exec(response2)?.groups?.target;

        if (data2) {
            authentication = {
                deviceId: papagoFunction.generateDeviceId(),
                papagoVersion: data2,
            };
        } else {
            throw 'ERROR: setAuthentication data2';
        }
    } else {
        throw 'ERROR: setAuthentication data1';
    }
}

// translate
async function translate(cookie, authentication, option) {
    const currentTime = new Date().getTime();
    const authorization = `PPG ${authentication.deviceId}:${papagoFunction.generateSignature(authentication, currentTime)}`;

    const response = await requestModule.post(
        {
            protocol: 'https:',
            hostname: 'papago.naver.com',
            path: '/apis/n2mt/translate',
        },
        encodeURI(
            requestModule.toParameters({
                deviceId: authentication.deviceId,
                locale: 'en-US',
                dict: 'true',
                dictDisplay: 30,
                honorific: false,
                instant: false,
                paging: false,
                source: option.from,
                target: option.to,
                text: option.text,
            })
        ),
        {
            accept: 'application/json',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US',
            authorization: authorization,
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            cookie: cookie,
            origin: 'https://papago.naver.com',
            referer: 'https://papago.naver.com/',
            'sec-ch-ua': requestModule.getSCU(),
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            timestamp: currentTime,
            'user-agent': requestModule.getUserAgent(),
            'x-apigw-partnerid': 'papago',
        }
    );

    if (response?.translatedText) {
        return response.translatedText;
    } else {
        console.log('cookie:', cookie);
        console.log('authentication:', authentication);
        console.log('option:', option);
        throw 'ERROR: translate';
    }
}

// module exports
module.exports = { exec };
