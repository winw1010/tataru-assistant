'use strict';

// CryptoJS
const CryptoJS = require("crypto-js");

// uuidv4
//const { v4: uuidv4 } = require('uuid');

// request module
const { startRequest } = require('./request-module');

// user agent
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';

// RegExp
const JSESSIONID = /^.*(JSESSIONID=.*?);.*$/i;

// expire date
let expireDate = 0;

// cookie
let cookie = null;

// auth
let auth = null;

// exec
async function exec(option) {
    let result = '';

    try {
        // check expire date
        if (new Date().getTime() >= expireDate) {
            await initialize();
        }

        // get result
        result = await translate(cookie, auth, option) || '';
    } catch (error) {
        console.log(error);
    }

    // if result is blank => reset expire date
    if (!result || result === '') {
        expireDate = 0;
    }

    console.log({
        expiredDate: expireDate,
        cookie: cookie,
        auth: auth,
        result: result
    });

    return result;
}

// reset cookie
async function initialize() {
    // get cookie
    for (let index = 0; index < 3; index++) {
        cookie = await getCookie();
        if (cookie) {
            break;
        }
    }

    // get auth
    auth = getAuth();
}

// get cookie
async function getCookie() {
    const callback = function (response) {
        if (response.statusCode === 200 && response.headers['set-cookie']) {
            return response.headers['set-cookie'].join('; ').replace(JSESSIONID, '$1');
        }
    }

    const newCookie = await startRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'papago.naver.com'
        },
        callback: callback
    });

    if (newCookie) {
        // set expired date
        expireDate = new Date().getTime() + 3600000;
    }

    return newCookie;
}

// get auth
function getAuth() {
    return {
        deviceId: getDeviceId()
    }
}

// translate
async function translate(cookie, auth, option) {
    const ctime = new Date().getTime();
    const authorization = `PPG ${auth.deviceId}:${getSignature(auth.deviceId, ctime)}`

    const postData =
        "deviceId=" + auth.deviceId +
        "&locale=zh-TW" +
        "&dict=true" +
        "&dictDisplay=30" +
        "&honorific=false" +
        "&instant=false" +
        "&paging=true" +
        "&source=" + option.from +
        "&target=" + option.to +
        "&text=" + option.text;

    const callback = function (response, chunk) {
        console.log(chunk.toString());
        if (response.statusCode === 200) {
            const data = JSON.parse(chunk.toString());

            if (data.translatedText) {
                return data.translatedText;
            }
        }
    }

    return await startRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'papago.naver.com',
            path: '/apis/nsmt/translate'
        },
        headers: [
            ['Authorization', authorization],
            ['accept-language', 'zh-TW'],
            ['Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'],
            ['cookie', cookie + 'GA1.2.26076760.1658054418; NNB=5I6BOSAZ47JWE; papago_skin_locale=en; _ga=GA1.2.1557340530.1658054418; _ga_7VKFYR6RV1=GS1.1.1658061136.3.1.1658061774.42'],
            ['device-type', 'pc'],
            ['origin', 'https://papago.naver.com'],
            ['Referer', 'https://papago.naver.com/'],
            ['sec-fetch-site', 'same-origin'],
            ['timestamp', ctime],
            ['User-Agent', userAgent],
            ['x-apigw-partnerid', 'papago']
        ],
        data: encodeURI(postData),
        callback: callback
    });
}

// get device id
function getDeviceId() {
    var a = new Date().getTime();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
        var t = (a + 16 * Math.random()) % 16 | 0;
        return a = Math.floor(a / 16), ("x" === e ? t : 3 & t | 8).toString(16)
    })
}

// get hash
function getSignature(deviceId, timestamp) {
    return CryptoJS.HmacMD5(
        `${deviceId}\n${'https://papago.naver.com/apis/n2mt/translate'}\n${timestamp}`,
        'v1.6.9_0f9c783dcc'
    ).toString(CryptoJS.enc.Base64);
}

exports.exec = exec;