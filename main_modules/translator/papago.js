'use strict';

// https://papago.naver.com/main.326c5bbc1f1b8e106d89.chunk.js
// return{Authorization:"PPG "+t+":"+p.a.HmacMD5(t+"\n"+e.split("?")[0]+"\n"+n,"v1.6.9_0f9c783dcc").toString(p.a.enc.Base64),Timestamp:n}

// CryptoJS
const CryptoJS = require("crypto-js");

// request module
const { startRequest } = require('./request-module');

// user agent
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';

// RegExp
//const papagoVersion = /.*"(v\d{1,3}?\.\d{1,3}?\.\d{1,3}?_.*?)".*/i;
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
        "&dict=false" +
        "&dictDisplay=30" +
        "&honorific=false" +
        "&instant=true" +
        "&paging=false" +
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

    // login
    await startRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'static.nid.naver.com',
            path: '/getLoginStatus?callback=showGNB&charset=utf-8&svc=papago&template=gnb_utf8&one_naver=0'
        },
        headers: [
            ['accept', '*/*'],
            ['accept-encoding', 'gzip, deflate, br'],
            ['accept-language', 'zh-TW,zh;q=0.9'],
            ['cookie', '_ga_7VKFYR6RV1=GS1.1.1658102987.1.0.1658102987.60; _ga=GA1.2.330371943.1658102988; _gid=GA1.2.1939960718.1658102988; NNB=5V6KUSGQUTKGE'],
            ['referer', 'https://papago.naver.com/'],
            ['sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'],
            ['sec-ch-ua-mobile', '?0'],
            ['sec-ch-ua-platform', '"Windows"'],
            ['sec-fetch-dest', 'script'],
            ['sec-fetch-mode', 'no-cors'],
            ['sec-fetch-site', 'same-site'],
            ['user-agent', userAgent]
        ]
    });

    return await startRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'papago.naver.com',
            path: '/apis/nsmt/translate'
        },
        headers: [
            ['accept', 'application/json'],
            ['accept-encoding', 'gzip, deflate, br'],
            ['accept-language', 'zh-TW'],
            ['authorization', authorization],
            ['content-type', 'application/x-www-form-urlencoded; charset=UTF-8'],
            ['cookie', cookie + '; papago_skin_locale=en' + '; _ga_7VKFYR6RV1=GS1.1.1658102987.1.0.1658102987.60; _ga=GA1.2.330371943.1658102988; _gid=GA1.2.1939960718.1658102988; NNB=5V6KUSGQUTKGE'],
            ['device-type', 'pc'],
            ['origin', 'https://papago.naver.com'],
            ['originPass', 'papago.naver.com'],
            ['referer', 'https://papago.naver.com/'],
            ['sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'],
            ['sec-ch-ua-mobile', '?0'],
            ['sec-ch-ua-platform', '"Windows"'],
            ['sec-fetch-dest', 'empty'],
            ['sec-fetch-mode', 'cors'],
            ['sec-fetch-site', 'same-origin'],
            ['timestamp', ctime],
            ['user-agent', userAgent],
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