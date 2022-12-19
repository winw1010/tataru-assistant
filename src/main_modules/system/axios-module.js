'use strict';

const axios = require('axios').default;
axios.defaults.withCredentials = !0;
axios.defaults.timeout = 10000;

function get(url, config = {}) {
    return new Promise((resolve) => {
        axios
            .get(url, config)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                console.log(error);
                resolve(null);
            });
    });
}

function post(url, data, config = {}) {
    return new Promise((resolve) => {
        axios
            .post(url, data, config)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                console.log(error);
                resolve(null);
            });
    });
}

function getCookie(url, config = {}) {
    return new Promise((resolve) => {
        axios
            .get(url, config)
            .then((response) => {
                resolve(response.headers?.['set-cookie']);
            })
            .catch((error) => {
                console.log(error);
                resolve(null);
            });
    });
}

function getExpiryDate() {
    return new Date().getTime() + 21600000;
}

function getUserAgent() {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';
}

module.exports = {
    get,
    post,
    getCookie,
    getExpiryDate,
    getUserAgent,
};
