'use strict';

// request module
const { startRequest, requestCookie } = require('./request-module');

// baidu encoder
const { signEncoder } = require('./baiduEncoder');

// user agent
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';

// RegExp
const baiduIdRegExp = /(?<target>BAIDUID=.*?)(?=;|$)/i;
const tokenRegExp = /token:\s*?'(?<target>.*?)'/i;
const gtkRegExp = /gtk\s*?=\s*?"(?<target>.*?)"/i;

// expire date
let expireDate = 0;

// cookie
let cookie = null;

// authentication
let authentication = null;

// exec
async function exec(option) {
    let response = '';

    try {
        // check expire date
        if (new Date().getTime() >= expireDate || !cookie || !authentication) {
            await initialize();
        }

        // get result
        response = await translate(cookie, authentication, option) || '';
    } catch (error) {
        console.log(error);
    }

    // if result is blank => reset expire date
    if (!response || response === '') {
        expireDate = 0;
    }

    /*
    console.log({
        expiredDate: expireDate,
        cookie: cookie,
        authentication: authentication,
        response: response
    });
    */

    return response;
}

// initialize
async function initialize() {
    // set cookie
    for (let index = 0; index < 3; index++) {
        await setCookie();
        if (cookie) {
            break;
        }
    }

    if (!cookie) {
        cookie = '';
    }

    // set authentication
    for (let index = 0; index < 3; index++) {
        await setAuthentication();
        if (authentication) {
            break;
        }
    }

    if (!authentication) {
        authentication = {
            token: '',
            gtk: ''
        };
    }
}

// set cookie
async function setCookie() {
    const response = await requestCookie('fanyi.baidu.com');
    expireDate = response.expireDate;
    cookie = baiduIdRegExp.exec(response.cookie).groups.target;
}

// set authentication
async function setAuthentication() {
    const callback = function (response, chunk) {
        const chunkString = chunk.toString();
        if (response.statusCode === 200 && tokenRegExp.test(chunkString) && gtkRegExp.test(chunkString)) {
            let token = tokenRegExp.exec(chunkString).groups.target || '';
            let gtk = gtkRegExp.exec(chunkString).groups.target || '320305.131321201';

            return {
                token,
                gtk
            };
        }
    }

    authentication = await startRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com'
        },
        headers: [
            ['Cookie', cookie]
        ],
        callback: callback
    });
}

// translate
async function translate(cookie, authentication, option) {
    const postData =
        'from=' + option.from +
        '&to=' + option.to +
        '&query=' + option.text +
        '&transtype=realtime' +
        '&simple_means_flag=3' +
        '&sign=' + signEncoder(option.text, authentication.gtk) +
        '&token=' + authentication.token;

    const callback = function (response, chunk) {
        if (response.statusCode === 200) {
            const data = JSON.parse(chunk.toString());

            if (data.trans_result) {
                let result = '';
                const resultArray = data.trans_result.data;

                for (let index = 0; index < resultArray.length; index++) {
                    const element = resultArray[index];
                    result += element.dst || '';
                }

                return result;
            }
        }
    }

    return await startRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com',
            path: `/v2transapi?from=${option.from}&to=${option.to}`
        },
        headers: [
            ['Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'],
            ['Cookie', cookie],
            ['User-Agent', userAgent]
        ],
        data: encodeURI(postData),
        callback: callback
    });
}

exports.exec = exec;