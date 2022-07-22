'use strict';

// net
const { net } = require('electron');

// start request
async function startRequest({ options, headers = [], data = null, callback = null }) {
    try {
        const result = await new Promise((resolve) => {
            const request = net.request(options);

            for (let index = 0; index < headers.length; index++) {
                const header = headers[index];
                request.setHeader(header[0], header[1]);
            }

            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    try {
                        if (callback) {
                            const result = callback(response, chunk);

                            if (result) {
                                request.abort();
                                resolve(result);
                            }
                        } else {
                            request.abort();
                            resolve({
                                response: response,
                                chunk: chunk,
                            });
                        }
                    } catch (error) {
                        console.log(error);
                    }
                });

                response.on('end', () => {
                    console.log('Response end');
                    request.abort();
                    resolve(null);
                });
            });

            if (data) {
                request.write(data);
            }

            request.end();
        });

        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// request cookie
async function requestCookie(hostname = '', path = '/', targetRegExp = /(?<target>.)/, addon = '') {
    let cookie = null;
    let expireDate = 0;

    const callback = function (response) {
        try {
            if (response.statusCode === 200 && response.headers['set-cookie']) {
                let newCookie = '';

                if (Array.isArray(response.headers['set-cookie'])) {
                    newCookie = response.headers['set-cookie'].join('; ');
                } else {
                    newCookie = response.headers['set-cookie'];
                }

                if (targetRegExp.test(newCookie)) {
                    return targetRegExp.exec(newCookie).groups.target + addon;
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    cookie = await startRequest({
        options: {
            method: 'GET',
            protocol: 'https:',
            hostname: hostname,
            path: path,
        },
        callback: callback,
    });

    // set expire date
    if (cookie) {
        const cookies = cookie.split(';');
        for (let index = 0; index < cookies.length; index++) {
            const property = cookies[index];
            if (/expires=/i.test(property)) {
                expireDate = new Date(property.split('=')[1].trim()).getTime();
                break;
            }
        }
    }

    return { cookie, expireDate };
}

exports.startRequest = startRequest;
exports.requestCookie = requestCookie;
