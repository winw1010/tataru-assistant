'use strict';

// baidu encoder
const { signEncoder } = require('./baidu-encoder');

// axios module
const axiosModule = require('../system/axios-module');

// RegExp
const baiduIdRegExp = /(?<target>BAIDUID=.*?)(?=;|$)/is;
const tokenRegExp = /token:\s*?'(?<target>.*?)'/is;
const gtkRegExp = /gtk\s*?=\s*?"(?<target>.*?)"/is;
const appVersionRegExp = /"appVersion":"(?<target>.*?)"/is;

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
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const response = baiduIdRegExp.exec(await axiosModule.getCookie('https://fanyi.baidu.com'))?.groups?.target;

    if (response) {
        cookie =
            response +
            `; Hm_lvt_64ecd82404c51e03dc91cb9e8c025574=${currentTime}; Hm_lpvt_64ecd82404c51e03dc91cb9e8c025574=${currentTime}`;
        expiryDate = axiosModule.getExpiryDate();
    } else {
        throw 'ERROR: setCookie';
    }
}

// set authentication
async function setAuthentication() {
    const response = await axiosModule.get('https://fanyi.baidu.com', { headers: { Cookie: cookie } });
    const token = tokenRegExp.exec(response)?.groups?.target;
    const gtk = gtkRegExp.exec(response)?.groups?.target;
    const appVersion = appVersionRegExp.exec(response)?.groups?.target;

    if (token && gtk) {
        authentication.token = token;
        authentication.gtk = gtk;

        if (appVersion) {
            cookie +=
                `; APPGUIDE_${appVersion.replace(/\./g, '_')}=1` +
                '; REALTIME_TRANS_SWITCH=1; FANYI_WORD_SWITCH=1; HISTORY_SWITCH=1; SOUND_SPD_SWITCH=1; SOUND_PREFER_SWITCH=1';
        }
    } else {
        throw 'ERROR: setAuthentication';
    }
}

// translate
async function translate(cookie, authentication, option) {
    const postData = {
        from: option.from,
        to: option.to,
        query: option.text,
        transtype: 'realtime',
        simple_means_flag: '3',
        sign: signEncoder(option.text, authentication.gtk),
        token: authentication.token,
    };

    const response = (
        await axiosModule.post(`https://fanyi.baidu.com/v2transapi?from=${option.from}&to=${option.to}`, postData, {
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                Connection: 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                Cookie: cookie,
                Origin: 'https://fanyi.baidu.com',
                Referer: 'https://fanyi.baidu.com/',
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': axiosModule.getUserAgent(),
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
    )?.trans_result?.data;

    if (response) {
        let finalResponse = '';

        for (let index = 0; index < response.length; index++) {
            const element = response[index];
            finalResponse += element.dst || '';
        }

        return finalResponse;
    } else {
        throw 'ERROR: translate';
    }
}

// module exports
module.exports = { exec };
