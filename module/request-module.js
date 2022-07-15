'use strict';

// axios
const axios = require('axios').default;
axios.defaults.withCredentials = true;

// create
function axiosCreate(...args) {
    return axios.create(...args);
}

// get
function axiosGet(...args) {
    return axios.get(...args);
}

// post
function axiosPost(...args) {
    return axios.post(...args);
}

exports.axiosCreate = axiosCreate;
exports.axiosGet = axiosGet;
exports.axiosPost = axiosPost;

/*
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
*/