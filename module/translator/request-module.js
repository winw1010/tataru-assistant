'use strict';

// net
const { net } = require('electron');

// start request
function createRequest(options) {
    return new Promise((resolve, reject) => {
        const request = net.request(options);

        request.on('response', (response) => {
            response.on('data', (chunk) => {
                if (response.statusCode === 200) {
                    request.abort();
                    resolve({
                        response: response,
                        chunk: chunk
                    });
                }
            });

            response.on('end', () => {
                request.abort();
                console.log('Response end');
                resolve(null);
            });
        });

        request.on('close', () => {
            console.log('Request close');
            resolve(null);
        });

        request.on('error', (error) => {
            console.log(error);
            reject(error);
        });

        request.end();
    });
}

exports.createRequest = createRequest;