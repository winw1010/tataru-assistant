'use strict';

// CryptoJS
const CryptoJS = require("crypto-js");

// request
const { axiosGet } = require('../request-module');

// RegExp
const fanyideskwebRegExp = /"fanyideskweb"\s*?\+\s*?e\s*?\+\s*?i\s*?\+\s*?"(.*?)"/gi;

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const auth = await getAuthentication();
        if (!auth) {
            throw 'Auth is null';
        }

        const ctime = new Date().getTime();
        const salt = ctime.toString() + parseInt(10 * Math.random(), 10).toString();

        const postData =
            "i=" + text +
            "&from=" + languageFrom +
            "&to=" + languageTo +
            "&smartresult=dict" +
            "&client=fanyideskweb" +
            "&salt=" + salt +
            "&sign=" + CryptoJS.MD5('fanyideskweb' + text + salt + auth.fanyideskweb).toString() +
            "&lts=" + ctime +
            "&bv=" + 'f0819a82107e6150005e75ef5fddcc3b' + //CryptoJS.MD5(ua).toString() +
            "&doctype=json" +
            "&version=2.1" +
            "&keyfrom=fanyi.web" +
            "&action=FY_BY_REALTlME"; //FY_BY_CLICKBUTTION

        /*
        const postData = JSON.stringify({
            i: text,
            from: languageFrom,
            to: languageTo,
            smartresult: 'dict',
            client: 'fanyideskweb',
            salt: salt,
            sign: CryptoJS.MD5('fanyideskweb' + text + salt + auth.fanyideskweb).toString(),
            lts: ctime.toString(),
            bv: 'f0819a82107e6150005e75ef5fddcc3b',
            doctype: 'json',
            version: '2.1',
            keyfrom: 'fanyi.web',
            action: 'FY_BY_REALTlME',
        });
        */

        /*
        await httpsRequest('https://fanyi.youdao.com', { method: 'GET', timeout: 10000 });

        const response = await httpsRequest('https://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': 'http://fanyi.youdao.com/',
                //'cookie': document.cookie + '; ___rl__test__cookies=' + (ctime - 1).toString()
            },
            timeout: 10000
        }, encodeURI(postData));

        console.log('Youdao:', response.toString());
        */

        /*
        // get translate
        const response = await youdaoApi.post('/translate_o?smartresult=dict&smartresult=rule', encodeURI(postData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });
        */

        return postData;
    } catch (error) {
        console.log('Youdao:', error);
        return '';
    }
}

// get authentication 
async function getAuthentication() {
    try {
        // get token and gtk
        const response = await axiosGet('https://shared.ydstatic.com/fanyi/newweb/v1.1.10/scripts/newweb/fanyi.min.js');
        let fanyideskweb = fanyideskwebRegExp.exec(response.data);

        if (fanyideskweb) {
            fanyideskweb = fanyideskweb[0].replace(fanyideskwebRegExp, '$1');
        }

        return {
            fanyideskweb: fanyideskweb
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

getAuthentication()

exports.translate = translate;