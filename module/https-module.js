'use strict';

// https
const https = require('https');

// https get
async function httpsGet(options) {
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
async function httpsPost(postData, options) {
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

exports.httpsGet = httpsGet;
exports.httpsPost = httpsPost;