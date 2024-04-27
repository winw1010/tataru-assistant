'use strict';

// axios
const axios = require('axios').default;

// youdao function
const youdaoFunction = require('./youdao-function');

// request module
const requestModule = require('../system/request-module');

// RegExp
// const userIdRegExp = /(?<target>OUTFOX_SEARCH_USER_ID=[^;]+)/is;

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
    console.log(error);
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
  //OUTFOX_SEARCH_USER_ID=-1846428029@10.108.162.139; OUTFOX_SEARCH_USER_ID_NCOO=1596094722.4516084
  //OUTFOX_SEARCH_USER_ID=-2081303208@10.105.253.24; OUTFOX_SEARCH_USER_ID_NCOO=1836689713.990111
  authentication.cookie = `OUTFOX_SEARCH_USER_ID=-${youdaoFunction.createUserID()}@10.105.253.24; OUTFOX_SEARCH_USER_ID_NCOO=${
    2147483647 * Math.random()
  }`;
  authentication.expireDate = requestModule.getExpiryDate();
}

// set authentication
async function setAuthentication() {
  const response = await axios.get(
    'https://dict.youdao.com/webtranslate/key?' +
      encodeURI(
        requestModule.toParameters({
          ...{ keyid: 'webfanyi-key-getter' },
          ...youdaoFunction.createParams('asdjnjfenknafdfsdfsd'),
        })
      ),
    {
      timeout: 10000,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-TW,zh;q=0.9',
        Connection: 'keep-alive',
        Cookie: authentication.cookie,
        Origin: 'https://fanyi.youdao.com',
        Referer: 'https://fanyi.youdao.com/',
        'sec-ch-ua': requestModule.getSCU(),
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': requestModule.getUserAgent(),
      },
    }
  );

  if (response.data?.data?.secretKey) {
    authentication.secretKey = response.data.data.secretKey;
  } else {
    throw response.data;
  }
}

// translate
async function translate(option) {
  // check expire date
  if (new Date().getTime() >= authentication.expireDate) {
    await initialize();
  }

  const response = await axios.post(
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
      timeout: 10000,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-TW,zh;q=0.9',
        Connection: 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: authentication.cookie,
        Origin: 'https://fanyi.youdao.com',
        Referer: 'https://fanyi.youdao.com/',
        'sec-ch-ua': requestModule.getSCU(),
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': requestModule.getUserAgent(),
      },
    }
  );

  const data = JSON.parse(youdaoFunction.decodeData(response.data));

  if (data?.translateResult?.[0]) {
    // getKeyword(option);

    const resultArray = data.translateResult[0];
    let result = '';

    for (let index = 0; index < resultArray.length; index++) {
      result += resultArray?.[index]?.tgt || '';
    }

    return result;
  } else {
    throw response.data;
  }
}

// module exports
module.exports = { exec };
