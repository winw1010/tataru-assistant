'use strict';

// baidu function
const { getSign } = require('./baidu-function');

// request module
const requestModule = require('../system/request-module');

// RegExp
const baiduIdRegExp = /(?<target>BAIDUID=.*?)(?=;|$)/is;
const tokenRegExp = /token:\s*'(?<target>.+?)',/is;
//const systimeRegExp = /systime:\s*?'(?<target>.*?)'/is;
const gtkRegExp = /window\.gtk\s*=\s*"(?<target>\d+\.\d+)";/is;
const appVersionRegExp = /"appVersion":"(?<target>.*?)"/is;

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
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const response = await requestModule.getCookie(
        {
            protocol: 'https:',
            hostname: 'fanyi.baidu.com',
            path: '/',
        },
        baiduIdRegExp
    );

    if (response) {
        cookie = response + `; Hm_lvt_64ecd82404c51e03dc91cb9e8c025574=${currentTime}; Hm_lpvt_64ecd82404c51e03dc91cb9e8c025574=${currentTime}`;
        expireDate = requestModule.getExpiryDate();
    } else {
        throw 'ERROR: setCookie';
    }
}

// set authentication
async function setAuthentication() {
    const response = await requestModule.get(
        {
            protocol: 'https:',
            hostname: 'fanyi.baidu.com',
            path: '/',
        },
        { Cookie: cookie }
    );

    const token = tokenRegExp.exec(response)?.groups?.target;
    const gtk = gtkRegExp.exec(response)?.groups?.target;
    const appVersion = appVersionRegExp.exec(response)?.groups?.target;

    if (token && gtk) {
        authentication.token = token;
        authentication.gtk = gtk;

        if (appVersion) {
            cookie += `; APPGUIDE_${appVersion.replace(/\./g, '_')}=1` + '; REALTIME_TRANS_SWITCH=1; FANYI_WORD_SWITCH=1; HISTORY_SWITCH=1; SOUND_SPD_SWITCH=1; SOUND_PREFER_SWITCH=1';
        }
    } else {
        throw 'ERROR: setAuthentication';
    }
}

// translate
async function translate(cookie, authentication, option) {
    const response = await requestModule.post(
        {
            protocol: 'https:',
            hostname: 'fanyi.baidu.com',
            path: `/v2transapi?from=${option.from}&to=${option.to}`,
        },
        encodeURI(
            requestModule.toParameters({
                from: option.from,
                to: option.to,
                query: option.text,
                transtype: 'realtime',
                simple_means_flag: 3,
                sign: getSign(option.text, authentication.gtk),
                token: authentication.token,
                domain: 'common',
                ts: new Date().getTime(),
            })
        ),
        {
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            Connection: 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Cookie: cookie,
            Origin: 'https://fanyi.baidu.com',
            Referer: 'https://fanyi.baidu.com/',
            'sec-ch-ua': requestModule.getSCU(),
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': requestModule.getUserAgent(),
            'X-Requested-With': 'XMLHttpRequest',
        }
    );

    if (response?.trans_result?.data) {
        let result = '';
        const resultArray = response.trans_result.data;

        for (let index = 0; index < resultArray.length; index++) {
            const element = resultArray[index];
            result += element.dst || '';
        }

        return result;
    } else {
        console.log('cookie:', cookie);
        console.log('authentication:', authentication);
        console.log('option:', option);
        throw 'ERROR: translate';
    }
}

// module exports
module.exports = { exec };
