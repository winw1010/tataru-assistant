const { net } = require('electron');

// get sign
const { getSign } = require('./baiduEncoder');

// RegExp
const tokenRegExp = /token: '(.*?)'/gi;
const gtkRegExp = /gtk = "(.*?)"/gi;

async function exec(option) {
    try {
        let cookie = null;
        let auth = null;
        let result = null;

        cookie = await getCookie();
        cookie && (auth = await getAuth(cookie));
        auth && (result = await translate(cookie, auth, option));

        return result;
    } catch (error) {
        console.log(error);
    }
}

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
                if (response.statusCode === 200 && chunkString.includes('token') && chunkString.includes('gtk')) {
                    let token = tokenRegExp.exec(chunkString);
                    let gtk = gtkRegExp.exec(chunkString);

                    if (token) {
                        token = token[0].replace(tokenRegExp, '$1');
                    }

                    if (gtk) {
                        gtk = gtk[0].replace(gtkRegExp, '$1');
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

function translate(cookie, auth, option) {
    return new Promise((resolve, reject) => {
        const postData =
            'from=' + option.from +
            '&to=' + option.to +
            '&query=' + option.source +
            '&transtype=realtime&simple_means_flag=3&sign=' + getSign('こんにちは！', auth.gtk) +
            '&token=' + auth.token;

        const request = net.request({
            method: 'POST',
            protocol: 'https:',
            hostname: 'fanyi.baidu.com',
            path: '/v2transapi'
        });

        request.setHeader('cookie', cookie);
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        request.on('response', (response) => {
            response.on('data', (chunk) => {
                if (response.statusCode === 200) {
                    resolve(JSON.parse(chunk.toString()));
                }
            });

            response.on('end', () => {
                resolve(null);
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