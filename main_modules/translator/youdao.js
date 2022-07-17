'use strict';

// CryptoJS
const CryptoJS = require("crypto-js");

// request module
const { startRequest } = require('./request-module');

// user agent
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';

// RegExp
const userID = /^.*(OUTFOX_SEARCH_USER_ID=.*?);.*$/i;
const fanyideskwebRegExp = /"fanyideskweb"\s*?\+\s*?e\s*?\+\s*?i\s*?\+\s*?"(.*?)"/i;
//const ncooRegExp = /^.*?(\d+) \* Math\.random\(\).*$/i;

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
    for (let index = 0; index < 3; index++) {
        auth = await getAuth();
        if (auth) {
            break;
        }
    }
}

// get cookie
async function getCookie() {
    const callback = function (response) {
        if (response.statusCode === 200 && response.headers['set-cookie']) {
            let newCookie = response.headers['set-cookie'].join('; ').replace(userID, '$1');
            newCookie += `; OUTFOX_SEARCH_USER_ID_NCOO=${2147483647 * Math.random()}`
            return newCookie;
        }
    }

    const newCookie = await startRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'fanyi.youdao.com'
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
async function getAuth() {
    const callback = function (response, chunk) {
        const chunkString = chunk.toString();
        if (response.statusCode === 200 && fanyideskwebRegExp.test(chunkString)) {
            let fanyideskweb = fanyideskwebRegExp.exec(chunkString) || '';

            if (fanyideskweb instanceof Array) {
                fanyideskweb = fanyideskweb[1];
            }

            return {
                fanyideskweb: fanyideskweb
            };
        }
    }

    return await startRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: 'shared.ydstatic.com',
            path: '/fanyi/newweb/v1.1.10/scripts/newweb/fanyi.min.js'
        },
        callback: callback
    });
}

// translate
async function translate(cookie, auth, option) {
    const ctime = new Date().getTime();
    const ctime2 = ctime + 1;
    const salt = ctime2.toString() + parseInt(10 * Math.random(), 10).toString();

    const postData =
        "i=" + option.text +
        "&from=" + option.languageFrom +
        "&to=" + option.languageTo +
        "&smartresult=dict" +
        "&client=fanyideskweb" +
        "&salt=" + salt +
        "&sign=" + CryptoJS.MD5('fanyideskweb' + option.text + salt + (auth.fanyideskweb) || 'Ygy_4c=r#e#4EX^NUGUc5').toString() +
        "&lts=" + ctime2 +
        "&bv=f0819a82107e6150005e75ef5fddcc3b" + //CryptoJS.MD5(ua.replace('Mozilla/', '')).toString()
        "&doctype=json" +
        "&version=2.1" +
        "&keyfrom=fanyi.web" +
        "&action=FY_BY_REALTlME"; //FY_BY_CLICKBUTTION

    const callback = function (response, chunk) {
        if (response.statusCode === 200) {
            const data = JSON.parse(chunk.toString());

            if (data.translateResult) {
                let result = '';
                const resultArray = data.translateResult[0];

                for (let index = 0; index < resultArray.length; index++) {
                    const element = resultArray[index];
                    result += element.tgt || '';
                }

                return result;
            }
        }
    }

    return await startRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'fanyi.youdao.com',
            path: '/translate_o?smartresult=dict&smartresult=rule'
        },
        headers: [
            ['Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'],
            ['cookie', cookie + `; ___rl__test__cookies=${ctime}`],
            ['Referer', 'http://fanyi.youdao.com/'],
            ['User-Agent', userAgent]
        ],
        data: encodeURI(postData),
        callback: callback
    });
}

exports.exec = exec;