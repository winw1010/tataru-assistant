'use strict';

// net
const { net } = require('electron');

// get sign
const { getSign } = require('./baiduEncoder');

// RegExp
const tokenRegExp = /token: '(.*?)'/i;
const gtkRegExp = /gtk = "(.*?)"/i;

// exec
async function exec(option) {
    try {
        let cookie = null;
        let auth = null;
        let result = '';

        cookie = await getCookie();
        console.log('cookie', cookie);

        cookie && (auth = await getAuth(cookie));
        console.log('auth', auth);

        cookie && auth && (result = await translate(cookie, auth, option));
        console.log('result', result);

        return result;
    } catch (error) {
        console.log(error);
        return '';
    }
}

// get cookie
function getCookie() {
    return new Promise((resolve, reject) => {
        const request = net.request({
            method: 'GET',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com'
        });

        request.on('response', (response) => {
            response.on('data', () => {
                if (response.statusCode === 200 && response.headers['set-cookie']) {
                    request.abort();
                    resolve(response.headers['set-cookie'].join('; '));
                }
            });

            response.on('end', () => {
                resolve(null);
            })
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.end();
    });
}

// get auth
function getAuth(cookie = '') {
    return new Promise((resolve, reject) => {
        const request = net.request({
            method: 'GET',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com'
        });

        request.setHeader('cookie', cookie);

        request.on('response', (response) => {
            response.on('data', (chunk) => {
                const chunkString = chunk.toString();
                if (response.statusCode === 200 && tokenRegExp.test(chunkString) && gtkRegExp.test(chunkString)) {
                    request.abort();
                    let token = tokenRegExp.exec(chunkString) || '';
                    let gtk = gtkRegExp.exec(chunkString) || '320305.131321201';

                    if (token instanceof Array) {
                        token = token[1];
                    }

                    if (gtk instanceof Array) {
                        gtk = gtk[1];
                    }

                    resolve({
                        token: token,
                        gtk: gtk
                    });
                }
            });

            response.on('end', () => {
                resolve(null);
            })
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.end();
    });
}

// translate
function translate(cookie, auth, option) {
    return new Promise((resolve, reject) => {
        const postData =
            'from=' + option.from +
            '&to=' + option.to +
            '&query=' + option.text +
            '&transtype=realtime&simple_means_flag=3&sign=' + getSign(option.text, auth.gtk) +
            '&token=' + auth.token;

        const request = net.request({
            method: 'POST',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com',
            path: '/v2transapi'
        });

        request.setHeader('cookie', cookie);
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setHeader('responseType', 'json');

        request.on('response', (response) => {
            response.on('data', (chunk) => {
                if (response.statusCode === 200) {
                    request.abort();
                    const data = JSON.parse(chunk.toString());
                    if (data.trans_result) {
                        resolve(data.trans_result.data[0].dst);
                    } else {
                        reject(data);
                    }
                }
            });

            response.on('end', () => {
                resolve('');
            })
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.write(encodeURI(postData));

        request.end();
    });
}

exports.exec = exec;