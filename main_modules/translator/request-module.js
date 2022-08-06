'use strict';

// net
const { net } = require('electron');

// make request
async function makeRequest({ options, headers = [], data = null, callback = null, tryCountMax = 1 }) {
    try {
        let tryCount = 0;
        let result = null;

        do {
            tryCount++;

            // set timeout
            const requestTimeout = setTimeout(() => {
                console.log('Request timeout');
                return null;
            }, 10000);

            // get result
            result = await new Promise((resolve) => {
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
        } while (tryCount < tryCountMax && !result);

        // return result
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// request cookie
async function requestCookie(hostname = '', path = '/', targetRegExp = /(?<target>.)/, addon = '') {
    let cookie = null;
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
            tryCountMax: 3,
        })) || '';

    return { cookie, expireDate };
}

exports.makeRequest = makeRequest;
exports.requestCookie = requestCookie;
