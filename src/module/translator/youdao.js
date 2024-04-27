'use strict';

// youdao function
const youdaoFunction = require('./youdao-function');

// request module
const requestModule = require('../system/request-module');

// RegExp
const regOUTFOX_SEARCH_USER_ID = /(?<target>OUTFOX_SEARCH_USER_ID=[^;]+)/is;

// authentication
let authentication = {
  secretKey: '',
  cookie: '',
  expireDate: 0,
};

// exec
async function exec(option) {
  try {
    let result = await translate(option);
    return result;
  } catch (error) {
    authentication.expireDate = 0;
    throw error;
  }
}

// initialize
async function initialize() {
  // set cookie
  await setCookie();

  // set authentication
  await setAuthentication();
}

// set cookie
async function setCookie() {
  const response = await requestModule.get('https://fanyi.youdao.com/');
  const setCookie = response?.headers?.['set-cookie'];

  if (setCookie) {
    regOUTFOX_SEARCH_USER_ID.lastIndex = 0;
    const value = regOUTFOX_SEARCH_USER_ID.exec(setCookie.join('; '))?.groups?.target;

    authentication.cookie = value + `; OUTFOX_SEARCH_USER_ID_NCOO=${2147483647 * Math.random()}`;
    authentication.expireDate = requestModule.getExpiryDate();
  } else {
    throw 'set-cookie is undefined';
  }
}

// set authentication
async function setAuthentication() {
  const response = await requestModule.get(
    'https://dict.youdao.com/webtranslate/key?' +
      encodeURI(
        requestModule.toParameters({
          ...{ keyid: 'webfanyi-key-getter' },
          ...youdaoFunction.createParams('asdjnjfenknafdfsdfsd'),
        })
      ),
    {
      Accept: 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'zh-TW,zh;q=0.9',
      Connection: 'keep-alive',
      Cookie: authentication.cookie,
      Origin: 'https://fanyi.youdao.com',
      Referer: 'https://fanyi.youdao.com/',
      'Sec-Ch-Ua': requestModule.getSCU(),
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': requestModule.getUserAgent(),
    }
  );

  if (response?.data?.data?.secretKey) {
    authentication.secretKey = response.data.data.secretKey;
  } else {
    throw response?.data;
  }
}

// translate
async function translate(option) {
  // check expire date
  if (new Date().getTime() >= authentication.expireDate) {
    await initialize();
  }

  const response = await requestModule.post(
    'https://dict.youdao.com/webtranslate',
    encodeURI(
      requestModule.toParameters({
        ...{
          i: option.text,
          from: option.from,
          to: option.to,
          dictResult: 'true',
          keyid: 'webfanyi',
        },
        ...youdaoFunction.createParams(authentication.secretKey),
      })
    ),
    {
      Accept: 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'zh-TW,zh;q=0.9',
      Connection: 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: authentication.cookie,
      Origin: 'https://fanyi.youdao.com',
      Referer: 'https://fanyi.youdao.com/',
      'Sec-Ch-Ua': requestModule.getSCU(),
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': requestModule.getUserAgent(),
    }
  );

  const data = JSON.parse(youdaoFunction.decodeData(response?.data));

  if (data?.translateResult?.[0]) {
    const resultArray = data.translateResult[0];
    let result = '';

    for (let index = 0; index < resultArray.length; index++) {
      result += resultArray?.[index]?.tgt || '';
    }

    return result;
  } else {
    throw response?.data;
  }
}

// module exports
module.exports = { exec };
