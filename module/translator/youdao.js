'use strict';

// CryptoJS
const CryptoJS = require("crypto-js");

// request
const { axiosCreate, axiosGet } = require('../request-module');

// RegExp
const fanyideskwebRegExp = /"fanyideskweb"\s*?\+\s*?e\s*?\+\s*?i\s*?\+\s*?"(.*?)"/gi;

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const youdaoApi = axiosCreate({
            baseURL: 'https://fanyi.youdao.com',
            timeout: 5000,
        });

        const auth = await getAuthentication(youdaoApi);
        if (!auth) {
            throw 'Auth is null';
        }

        const ctime = new Date().getTime().toString();
        const salt = ctime + parseInt(10 * Math.random(), 10);
        const postData =
            "i=" + text +
            "&from=" + languageFrom +
            "&to=" + languageTo +
            "&smartresult=dict" +
            "&client=fanyideskweb" +
            "&salt=" + salt +
            "&sign=" + CryptoJS.MD5('fanyideskweb' + text + salt + auth.fanyideskweb).toString() +
            "&lts=" + ctime +
            "&bv=" + CryptoJS.MD5(navigator.appVersion).toString() +
            "&doctype=json" +
            "&version=2.1" +
            "&keyfrom=fanyi.web" +
            "&action=FY_BY_REALTlME"; //FY_BY_CLICKBUTTION

        console.log(postData);

        // get translate
        let response = await youdaoApi.post('/translate_o?smartresult=dict&smartresult=rule', encodeURI(postData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });

        console.log('Youdao:', response.data);
        return '';
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