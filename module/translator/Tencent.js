'use strict';

// 測試中

// request
const { axiosGet, axiosPost } = require('../request-module');

// get cookie 
async function getCookie() {
    let cookie = null;

    // get set-cookie
    try {
        let response = await axiosGet('https://fanyi.qq.com/api/translate');
        cookie = response.headers['set-cookie'][0];
    } catch (error) {
        cookie = error.response.headers['set-cookie'][0];
    }

    console.log('cookie:' + cookie);
    return cookie;
}

async function getAuth() {
    const cookie = await getCookie();

    try {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': cookie,
            'Origin': 'https://fanyi.qq.com/api/translate'
        }

        const response = await axiosPost('https://fanyi.qq.com/api/reauth12f', null, { headers: headers });
        return {
            cookie: cookie + `; qtv=${response.data.qtv}` + `; qtk=${response.data.qtk}`,
            qtv: response.data.qtv,
            qtk: response.data.qtk
        }
    } catch (error) {
        console.log(error);
    }
}

// translate
async function translate( /*text, languageFrom, languageTo*/ ) {
    const auth = await getAuth();
    console.log('auth:', auth);

    if (!auth) {
        return;
    }

    const postData = {
        source: 'en',
        target: 'zh',
        sourceText: 'Who are you?',
        qtv: auth.qtv,
        qtk: auth.qtk,
        ticket: '',
        randstr: '',
        sessionUuid: 'translate_uuid' + new Date().getTime()
    };

    try {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': auth.cookie,
            'Origin': 'https://fanyi.qq.com/api/translate'
        }

        const response = await axiosPost('https://fanyi.qq.com/api/translate', postData, { headers: headers });
        console.log('header:', response.headers);
        console.log('data:', response.data);
        //return response.data;
    } catch (error) {
        console.log('Tencent error:', error.toString());
        //return '';
    }
}

translate();

//exports.translate = translate;