'use strict';

// net
const { net } = require('electron');

// start request
function startRequest(options, callback = null, headers = [], data = null) {
    return new Promise((resolve, reject) => {
        const request = net.request(options);

        for (let index = 0; index < headers.length; index++) {
            const header = headers[index];
            request.setHeader(header[0], header[1]);
        }

        request.on('response', (response) => {
            response.on('data', (chunk) => {
                if (response.statusCode === 200) {
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
            reject(error);
        });

        if (data) {
            request.write(data);
        }

        request.end();
    });
}

exports.startRequest = startRequest;