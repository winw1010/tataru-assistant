'use strict';

// request
const { axiosCreate } = require('../request-module');

// get sign
const { getSign } = require('./baiduEncoder');

// create baidu api
function createBaiduApi() {
    return axiosCreate({
        baseURL: 'https://fanyi.baidu.com',
        timeout: 5000,
    });
}

// get authentication 
async function getAuthentication(baiduApi) {
    // get token and gtk
    const response = await baiduApi.get('/');
    let token = /token: '(.*?)'/gi.exec(response.data);
    let gtk = /gtk = "(.*?)"/gi.exec(response.data);

    if (token) {
        token = token[0].replace(/token: '(.*)'/gi, '$1');
    }

    if (gtk) {
        gtk = gtk[0].replace(/gtk = "(.*)"/gi, '$1');
    }

    return {
        token: token,
        gtk: gtk
    }
}

// translate
async function translate(text, languageFrom, languageTo) {
    const baiduApi = createBaiduApi();
    const auth = await getAuthentication(baiduApi);
    const data =
        "from=" + languageFrom +
        "&to=" + languageTo +
        "&query=" + text +
        "&transtype=realtime&simple_means_flag=3&sign=" + getSign(text, auth.gtk) +
        "&token=" + auth.token;

    try {
        const response = await baiduApi.post('/v2transapi', encodeURI(data), {
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

exports.translate = translate;