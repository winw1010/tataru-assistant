'use strict';

// request module
const { startRequest } = require('./request-module');

// baidu encoder
const { signEncoder } = require('./baiduEncoder');

// RegExp
const tokenRegExp = /token:\s*?'(.*?)'/i;
const gtkRegExp = /gtk\s*?=\s*?"(.*?)"/i;

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

    /*
    console.log({
        expiredDate: expireDate,
        cookie: cookie,
        auth: auth,
        result: result
    });
    */

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
    if (cookie) {
        for (let index = 0; index < 3; index++) {
            auth = await getAuth(cookie);
            if (auth) {
                break;
            }
        }
    }
}

// get cookie
async function getCookie() {
    const callback = function (response) {
        if (response.statusCode === 200 && response.headers['set-cookie']) {
            return response.headers['set-cookie'].join('; ');
        }
    }

    const newCookie = await startRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com'
        },
        callback: callback
    });

    if (newCookie) {
        // set expired date
        const newCookieArray = newCookie.split(';');
        for (let index = 0; index < newCookieArray.length; index++) {
            const property = newCookieArray[index];
            if (/expires=/i.test(property)) {
                expireDate = new Date(property.split('=')[1].trim()).getTime();
                break;
            }
        }
    }

    return newCookie;
}

// get auth
async function getAuth(cookie = '') {
    const callback = function (response, chunk) {
        const chunkString = chunk.toString();
        if (response.statusCode === 200 && tokenRegExp.test(chunkString) && gtkRegExp.test(chunkString)) {
            let token = tokenRegExp.exec(chunkString) || '';
            let gtk = gtkRegExp.exec(chunkString) || '320305.131321201';

            if (token instanceof Array) {
                token = token[1];
            }

            if (gtk instanceof Array) {
                gtk = gtk[1];
            }

            return {
                token: token,
                gtk: gtk
            };
        }
    }

    return await startRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com'
        },
        headers: [
            ['cookie', cookie]
        ],
        callback: callback
    });
}

// translate
async function translate(cookie, auth, option) {
    const postData =
        'from=' + option.from +
        '&to=' + option.to +
        '&query=' + option.text +
        '&transtype=realtime' +
        '&simple_means_flag=3' +
        '&sign=' + signEncoder(option.text, auth.gtk) +
        '&token=' + auth.token;

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
            } else {
                return null;
            }
        }
    }

    return await startRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com',
            path: '/v2transapi'
        },
        headers: [
            ['cookie', cookie],
            ['Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'],
            ['responseType', 'json']
        ],
        data: encodeURI(postData),
        callback: callback
    });
}

exports.exec = exec;