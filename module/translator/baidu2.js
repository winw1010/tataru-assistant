'use strict';

// net
const { net } = require('electron');

// baidu encoder
//const { getSign } = require('./baiduEncoder');
const { getSign } = require('./baiduEncoder2');

// RegExp
const tokenRegExp = /token: '(.*?)'/i;
const gtkRegExp = /gtk = "(.*?)"/i;

// expire date
let expireDate = 0;

// cookie
let cookie = null;

// auth
let auth = null;

// exec
async function exec(option) {
    let result = '';
    try {
        // check expire date
        if (new Date().getTime() >= expireDate || !cookie || !auth) {
            // get cookie and auth
            for (let index = 0; index < 3; index++) {
                cookie = await getCookie();
                if (cookie) {
                    for (let index = 0; index < 3; index++) {
                        auth = await getAuth(cookie);
                        if (auth) {
                            break;
                        }
                    }

                    break;
                }
            }
        }

        // get result
        result = await translate(cookie, auth, option) || '';
    } catch (error) {
        console.log(error);
    }

    console.log({
        expiredDate: expireDate,
        cookie: cookie,
        auth: auth,
        result: result
    });

    if (!result || result === '') {
        // reset expire date
        expireDate = 0;
    }

    return result;
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
                    const newCookie = response.headers['set-cookie'].join('; ');

                    // set expired date
                    const newCookieArray = newCookie.split(';');
                    for (let index = 0; index < newCookieArray.length; index++) {
                        const property = newCookieArray[index];
                        if (/expires=/i.test(property)) {
                            expireDate = new Date(property.split('=')[1].trim()).getTime();
                            break;
                        }
                    }

                    resolve(newCookie);
                }
            });

            response.on('end', () => {
                resolve(null);
            })
        });

        request.on('error', (error) => {
            console.log(error);
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
            console.log(error);
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
                resolve(null);
            })
        });

        request.on('error', (error) => {
            console.log(error);
            reject(error);
        });

        request.write(encodeURI(postData));
        request.end();
    });
}

exports.exec = exec;