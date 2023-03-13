'use strict';

// CryptoJS
const CryptoJS = require('crypto-js');

// get device id
function generateDeviceId() {
    var a = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (e) {
        var t = (a + 16 * Math.random()) % 16 | 0;
        return (a = Math.floor(a / 16)), ('x' === e ? t : (3 & t) | 8).toString(16);
    });
}

// get hash
function generateSignature(authentication, timestamp) {
    return CryptoJS.HmacMD5(
        `${authentication.deviceId}\n${'https://papago.naver.com/apis/n2mt/translate'}\n${timestamp}`,
        authentication.papagoVersion
    ).toString(CryptoJS.enc.Base64);
}

// module exports
module.exports = {
    generateDeviceId,
    generateSignature,
};
