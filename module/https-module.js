'use strict';

// https
const https = require('https');

// http request
function httpsRequest(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            res.on('data', (chunk) => {
                if (res.statusCode == 200) {
                    resolve(chunk);
                } else {
                    reject(chunk);
                }
            });
        });

        req.on('error', (error) => {
            reject(error.message);
        });

        if (data) {
            req.write(data);
        }

        req.end();
    });
}

exports.httpsRequest = httpsRequest;