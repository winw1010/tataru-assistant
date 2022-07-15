'use strict';

// 測試中

// request
const { axiosPost } = require('../request-module');

async function getAuth() {
    try {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://fanyi.qq.com/api/translate'
        }

        const response = await axiosPost('https://fanyi.qq.com/api/reauth12f', null, { headers: headers });
        return {
            qtv: response.data.qtv,
            qtk: response.data.qtk
        }
    } catch (error) {
        console.log(error);
    }
}

// translate
async function translate(text, languageFrom, languageTo) {
    const auth = await getAuth();
    if (!auth) {
        throw 'Auth is null';
    }

    const postData =
        "source=" + languageFrom +
        "&target=" + languageTo +
        "&sourceText=" + text +
        "&qtv=" + auth.qtv +
        "&qtk=" + auth.qtk +
        "&sessionUuid=" + 'translate_uuid' + new Date().getTime();

    /*
    const postData = {
        source: languageFrom,
        target: languageTo,
        sourceText: text,
        qtv: auth.qtv,
        qtk: auth.qtk,
        ticket: '',
        randstr: '',
        sessionUuid: 'translate_uuid' + new Date().getTime()
    };
    */

    try {
        const response = await axiosPost('https://fanyi.qq.com/api/translate', encodeURI(postData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://fanyi.qq.com/api/translate'
            }
        });

        console.log('data:', response.data);
        return '';
    } catch (error) {
        console.log('Tencent error:', error.toString());
        return '';
    }
}

translate();

//exports.translate = translate;