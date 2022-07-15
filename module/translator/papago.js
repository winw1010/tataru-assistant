'use strict';

// request
const { axiosCreate } = require('../request-module');

/*
// uuid v4
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
*/
translate();
// translate
async function translate(text, languageFrom, languageTo) {
    const deviceId = self.crypto.randomUUID();
    const papagoApi = axiosCreate({
        baseURL: 'https://papago.naver.com/apis',
        timeout: 5000,
    });

    const postData =
        "deviceId=" + deviceId +
        "&locale=ko" +
        "&dict=true" +
        "&dictDisplay=30" +
        "&honorific=false" +
        "&instant=false" +
        "&paging=true" +
        "&source=" + languageFrom +
        "&target=" + languageTo +
        "&text=" + text;

    try {
        const response = await papagoApi.post('/n2mt/translate', encodeURI(postData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            responseType: 'json'
        });
        console.log('Baidu:', response.data);
        return response.data;
    } catch (error) {
        console.log('Baidu:', error);
        return '';
    }
}

exports.translate = translate;

/*Testing*/
/*
// papago
const papagoTranslate = require('puppeteer-papago-scraping');

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const response = await papagoTranslate(text, languageTo, languageFrom);

        console.log('Papago:', response);
        return response;
    } catch (error) {
        console.log('Papago:', error);
        return '';
    }
}

exports.translate = translate;
*/