'use strict';

// 測試中

// request
const { axiosGet, axiosPost } = require('../request-module');

// get sign
const { getSign } = require('./baiduEncoder');

// get authentication 
async function getAuthentication() {
    // get set-cookie
    let response = await axiosGet('https://fanyi.baidu.com/');
    const cookie = response.headers['set-cookie'][0];

    // get token and gtk
    response = await axiosGet('https://fanyi.baidu.com/', { headers: { 'cookie': cookie } });
    let token = /token: '(.*)'/gi.exec(response.data);
    let gtk = /gtk = "(.*)"/gi.exec(response.data);

    if (token) {
        token = token[0].replace(/token: '(.*)'/gi, '$1');
    }

    if (gtk) {
        gtk = gtk[0].replace(/gtk = "(.*)"/gi, '$1');
    }

    return {
        cookie: cookie,
        token: token,
        gtk: gtk
    }
}

// translate
async function translate(text, languageFrom, languageTo) {
    const auth = await getAuthentication();

    const postData = JSON.stringify({
        from: languageFrom,
        to: languageTo,
        query: text,
        transtype: 'translang', // 'realtime'
        simple_means_flag: '3',
        sign: getSign(text),
        token: auth.token,
        domain: 'common'
    });

    try {
        const headers = {
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': auth.cookie,
            'Referer': 'https://fanyi.baidu.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        }
        const response = await axiosPost('https://fanyi.baidu.com/v2transapi?from=jp&to=zh', postData, { headers: headers });
        console.log('Baidu:', response.data);
        //return response.data.target;
    } catch (error) {
        console.log('Baidu:', error);
        //return '';
    }
}

exports.translate = translate;