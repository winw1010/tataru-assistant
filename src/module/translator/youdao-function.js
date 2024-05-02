'use strict';

// axios
// const axios = require('axios').default;
// axios.defaults.withCredentials = !0;

// crypto
const crypto = require('node:crypto');

// parameters
const r = 'fanyideskweb',
  i = 'webfanyi',
  s = 'client,mysticTime,product',
  l = '1.0.0',
  d = 'web',
  u = 'fanyi.web';

// decode
const decodeKey = 'ydsecret://query/key/B*RGygVywfNBwpmBaZg*WT7SIOUP2T0C9WHMZN39j^DAdaZhAnxvGcCY6VYFwnHl';
const decodeIv = 'ydsecret://query/iv/C@lZe2YzHtZ2CYgaXKSVfsb7Y4QWHjITPPZ0nQp87fBeJ!Iv6v^6fvi2WN@bYpJ4';

// create user id
function createUserID() {
  let userID = '';

  for (let index = 0; index < 10; index++) {
    let number = Math.floor(10 * Math.random());
    if (index === 0 && number === 0) {
      number = 1;
    }
    userID += number;
  }

  return userID;
}

// to MD5 string
function toMD5String(text) {
  return crypto.createHash('md5').update(text.toString()).digest('hex');
}

// to MD5 buffer
function toMD5Buffer(text) {
  return crypto.createHash('md5').update(text).digest();
}

// create sign
function createSign(currentTime, key) {
  return toMD5String(`client=${r}&mysticTime=${currentTime}&product=${i}&key=${key}`);
}

// create params
function createParams(key) {
  const t = new Date().getTime();
  return {
    sign: createSign(t, key),
    client: r,
    product: i,
    appVersion: l,
    vendor: d,
    pointParam: s,
    mysticTime: t,
    keyfrom: u,
  };
}

// decode data
function decodeData(responseString) {
  if (!responseString) return null;
  const a = Buffer.alloc(16, toMD5Buffer(decodeKey)), // decodeKey of app.********.js
    r = Buffer.alloc(16, toMD5Buffer(decodeIv)), // decodeIv of app.********.js
    i = crypto.createDecipheriv('aes-128-cbc', a, r);
  let s = i.update(responseString, 'base64', 'utf-8');
  return (s += i.final('utf-8')), s;
}

/*
// get keyword
function getKeyword(option) {
  const data = { text: option.text, lang: option.from, to: option.to };
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  axios
    .post('https://dict.youdao.com/keyword/key', formData)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
}
*/

// module exports
module.exports = {
  createUserID,
  createParams,
  decodeData,
  //getKeyword,
};
