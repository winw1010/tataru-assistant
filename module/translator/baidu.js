'use strict';

// request
const { axiosCreate } = require('../request-module');

// get sign
const { getSign } = require('./baiduEncoder');

// RegExp
const tokenRegExp = /token:\s*?'(.*?)'/gi;
const gtkRegExp = /gtk\s*?=\s*?"(.*?)"/gi;

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const baiduApi = axiosCreate({
            baseURL: 'https://fanyi.baidu.com',
            timeout: 5000,
        });

        const auth = await getAuthentication(baiduApi);
        if (!auth) {
            throw 'Auth is null';
        }

        const postData =
            "from=" + languageFrom +
            "&to=" + languageTo +
            "&query=" + text +
            "&transtype=realtime&simple_means_flag=3&sign=" + getSign(text, auth.gtk) +
            "&token=" + auth.token;

        const response = await baiduApi.post('/v2transapi', encodeURI(postData), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            responseType: 'json'
        });
        console.log('Baidu:', response.data.trans_result.data[0]);
        return response.data.trans_result.data[0].dst;
    } catch (error) {
        console.log('Baidu:', error);
        return '';
    }
}

// get authentication 
async function getAuthentication(baiduApi) {
    try {
        // get token and gtk
        const response = await baiduApi.get('/');
        let token = tokenRegExp.exec(response.data);
        let gtk = gtkRegExp.exec(response.data);

        if (token) {
            token = token[0].replace(tokenRegExp, '$1');
        }

        if (gtk) {
            gtk = gtk[0].replace(gtkRegExp, '$1');
        }

        return {
            token: token,
            gtk: gtk
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.translate = translate;