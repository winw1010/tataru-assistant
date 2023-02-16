'use strict';

// net
const { net } = require('electron');

// config module
const configModule = require('./config-module');

// restricted headers
const restrictedHeaders = [
    'Content-Length',
    'Host',
    'Trailer',
    'Te',
    'Upgrade',
    'Cookie2',
    'Keep-Alive',
    'Transfer-Encoding',
];

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
    const headersName = Object.getOwnPropertyNames(headers);
    for (let index = 0; index < headersName.length; index++) {
        const headerName = headersName[index];

        if (!restrictedHeaders.includes(headerName)) {
            if (headerName === 'Connection' && headers[headerName] === 'upgrade') {
                continue;
            } else {
                request.setHeader(headerName, headers[headerName]);
            }
        }
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
                // abort request
                request.abort();

                // set chunk string
                const chunkString = Buffer.concat(chunkArray).toString();

                // show chunk string
                if (method === 'POST') {
                    console.log('chunk string:', chunkString);
                }

                // resolve
                if (returnType === 'data') {
                    try {
                        resolve(JSON.parse(chunkString));
                    } catch (error) {
                        resolve(chunkString);
                    }
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

// get cookie
async function getCookie(options, targetRegExp = /(?<target>.*)/, headers = {}, timeout = 15000) {
    return new Promise((resolve) => {
        netRequest('GET', options, null, headers, timeout, 'response').then((response) => {
            console.log('headers', response?.headers);
            console.log('set-cookie', response?.headers?.['set-cookie']);
            resolve(targetRegExp.exec(response?.headers?.['set-cookie']?.join('; '))?.groups?.target);
        });
    });
}

// get expiry date
function getExpiryDate() {
    return new Date().getTime() + 21600000;
}

// get sec-ch-ua
function getSCU() {
    const scu = configModule.getConfig()?.system?.scu;
    return scu ? scu : '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"';
}

// get user agent
function getUserAgent() {
    const userAgent = configModule.getConfig()?.system?.userAgent;
    return userAgent
        ? userAgent
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
}

// to parameters
function toParameters(data = {}) {
    const dataNames = Object.getOwnPropertyNames(data);
    let parameters = [];

    for (let index = 0; index < dataNames.length; index++) {
        const dataName = dataNames[index];
        parameters.push(`${dataName}=${data[dataName]}`);
    }

    return parameters.join('&');
}

// module exports
module.exports = {
    get,
    post,
    getCookie,
    getExpiryDate,
    getSCU,
    getUserAgent,
    toParameters,
};
