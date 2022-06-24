'use strict';

// https
const https = require('https');

// http request
let uuu = new URL('https://www.google.com');
console.log(uuu);

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

// https get
function httpsGet(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.on('data', (data) => {
                if (res.statusCode == 200) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
        });

        req.on('error', (error) => {
            reject(error.message);
        });

        req.end();
    });
}

// https post
function httpsPost(postData, options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.on('data', (data) => {
                if (res.statusCode == 200) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
        });

        req.on('error', (error) => {
            reject(error.message);
        });

        req.write(postData);
        req.end();
    });
}

exports.httpsRequest = httpsRequest;
exports.httpsGet = httpsGet;
exports.httpsPost = httpsPost;