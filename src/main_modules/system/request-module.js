'use strict';

// net
const { net } = require('electron');

// get
function get(options, headers = {}, timeout = 15000) {
    return netRequest('GET', options, null, headers, timeout, 'data');
}

// post
function post(options, data = null, headers = {}, timeout = 15000) {
    return netRequest('POST', options, data, headers, timeout, 'data');
}

// net request
function netRequest(method, options, data, headers, timeout, returnType = 'data') {
    // set request
    options.method = method;
    const request = net.request(options);

    // set headers
    const headersNames = Object.getOwnPropertyNames(headers);
    for (let index = 0; index < headersNames.length; index++) {
        const headersName = headersNames[index];
        request.setHeader(headersName, headers[headersName]);
    }

    // return promise
    return new Promise((resolve) => {
        // set timeout
        const requestTimeout = setTimeout(() => {
            console.log('Request timeout');
            return null;
        }, timeout);

        // on response
        request.on('response', (response) => {
            // clear timeout
            clearTimeout(requestTimeout);

            // set chunk array
            let chunkArray = [];

            // on response end
            response.on('end', () => {
                request.abort();
                if (returnType === 'data') {
                    resolve(Buffer.concat(chunkArray).toString());
                } else {
                    resolve(response);
                }
            });

            // on response data
            response.on('data', (chunk) => {
                if (response.statusCode === 200) {
                    chunkArray.push(chunk);
                }
            });

            // on response error
            response.on('error', () => {
                console.log(response.statusCode + ': ' + response.statusMessage);
                resolve(null);
            });
        });

        // on request error
        request.on('error', (error) => {
            console.log(error);
            resolve(null);
        });

        // write data
        if (data) {
            request.write(data);
        }

        // end request
        request.end();
    });
}

// make request
async function makeRequest({ options, headers = [], data = null, callback = null }) {
    try {
        // set timeout
        const requestTimeout = setTimeout(() => {
            console.log('Request timeout');
            return null;
        }, 15000);

        // get result
        let result = await new Promise((resolve) => {
            const request = net.request(options);

            for (let index = 0; index < headers.length; index++) {
                const header = headers[index];
                request.setHeader(header[0], header[1]);
            }

            request.on('response', (response) => {
                let chunkArray = [];

                response.on('data', (chunk) => {
                    if (response.statusCode === 200 && chunk.length > 0) {
                        chunkArray.push(chunk);
                    }
                });

                response.on('end', () => {
                    // clear timeout
                    clearTimeout(requestTimeout);

                    try {
                        request.abort();
                    } catch (error) {
                        console.log(error);
                    }

                    try {
                        const chunk = Buffer.concat(chunkArray);

                        if (callback) {
                            const result = callback(response, chunk);
                            console.log(result);

                            if (result) {
                                resolve(result);
                            } else {
                                resolve(null);
                            }
                        } else {
                            resolve({
                                response: response,
                                chunk: chunk,
                            });
                        }
                    } catch (error) {
                        console.log(error);
                        resolve(null);
                    }
                });

                response.on('error', () => {
                    console.log(response.statusCode + ': ' + response.statusMessage);
                    resolve(null);
                });
            });

            request.on('error', (error) => {
                console.log(error.name + ': ' + error.message);
                resolve(null);
            });

            if (data) {
                request.write(data);
            }

            request.end();
        });

        // clear timeout
        clearTimeout(requestTimeout);

        // return result
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// get cookie
async function getCookie(hostname = '', path = '/', targetRegExp = /(?<target>.)/, addon = '') {
    let cookie = '';
    let expireDate = new Date().getTime() + 21600000;

    const callback = function (response) {
        if (response.statusCode === 200 && response.headers['set-cookie']) {
            let newCookie = '';

            if (Array.isArray(response.headers['set-cookie'])) {
                newCookie = response.headers['set-cookie'].join('; ');
            } else {
                newCookie = response.headers['set-cookie'];
            }

            if (targetRegExp.exec(newCookie)?.groups?.target) {
                return targetRegExp.exec(newCookie).groups.target + addon;
            }
        }
    };

    cookie =
        (await makeRequest({
            options: {
                method: 'GET',
                protocol: 'https:',
                hostname: hostname,
                path: path,
            },
            callback: callback,
        })) || '';

    return { cookie, expireDate };
}

async function getCookie2(options, headers = {}, timeout = 15000) {
    return new Promise((resolve) => {
        netRequest('GET', options, null, headers, timeout, 'response').then((response) => {
            resolve(response?.headers?.['set-cookie']?.join('; '));
        });
    });
}

// get expiry date
function getExpiryDate() {
    return new Date().getTime() + 21600000;
}

// get user agent
function getUserAgent() {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
}

// module exports
module.exports = {
    get,
    post,
    makeRequest,
    getCookie,
    getCookie2,
    getExpiryDate,
    getUserAgent,
};
