'use strict';

// 測試中

// request
const { axiosCreate } = require('../../../../module/request-module');

async function getAuth(tencentApi) {
    try {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }

        const response = await tencentApi.post('/reauth12f', null, { headers: headers });
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
    try {
        const tencentApi = axiosCreate({
            baseURL: 'https://fanyi.qq.com/api',
            timeout: 5000,
        });

        const auth = await getAuth(tencentApi);
        if (!auth) {
            throw 'Auth is null';
        }

        const postData =
            "source=" + languageFrom +
            "&target=" + languageTo +
            "&sourceText=" + text +
            "&qtv=" + auth.qtv +
            "&qtk=" + auth.qtk +
            "&ticket=" +
            "&randstr=" +
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

        const response = await tencentApi.post('/translate', encodeURI(postData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });

        console.log('data:', response.data);
        return '';
    } catch (error) {
        console.log('Tencent error:', error.toString());
        return '';
    }
}

exports.translate = translate;
