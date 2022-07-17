'use strict';

// net
const { net } = require('electron');

// start request
function startRequest({ options, headers = [], data = null, callback = null }) {
    return new Promise((resolve, reject) => {
        try {
            const request = net.request(options);

            for (let index = 0; index < headers.length; index++) {
                const header = headers[index];
                request.setHeader(header[0], header[1]);
            }

            request.on('response', (response) => {
                response.on('data', (chunk) => {
                    if (callback) {
                        let result = null;
                        result = callback(response, chunk);

                        if (result) {
                            request.abort();
                            resolve(result);
                        }
                    } else {
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

            request.on('error', (error) => {
                console.log(error);
                reject(null);
            });

            if (data) {
                request.write(data);
            }

            request.end();
        } catch (error) {
            console.log(error);
            reject(null);
        }
    });
}

exports.startRequest = startRequest;