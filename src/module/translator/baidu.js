'use strict';

// request module
const requestModule = require('../system/request-module');

// RegExp
const regBaiduId = /BAIDUID=(?<target>[^;]+)/is;

// authentication
let authentication = {
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
}

// set cookie
async function setCookie() {
  const response = await requestModule.get('https://fanyi.baidu.com/');
  const setCookie = response?.headers?.['set-cookie'];

  if (setCookie) {
    regBaiduId.lastIndex = 0;
    const value = regBaiduId.exec(setCookie.join('; '))?.groups?.target;

    authentication.cookie =
      'BAIDUID=' +
      value +
      '; BAIDUID_BFESS=' +
      value +
      +'; ab_sr=1.0.1_MmMzZTM2NzE5ZWFjNjM5MTgyNzBiYWZlMWNjOWY3NjFlM2M2NDM4MTdmOWZiNWVkZjUwYzAzZTlkNGMzZmNkNzAwNWEwOWMyOWI1ZDUwNThlZDdiN2MyMWYyOWI2NDEzOTYyYTRkNzhkZTE0NTQ1ODg0YzlhMWNiNjk5ODExOWI4NWZmMzU5NTE3ZTBkNzI5ZWZkNjliZTU5ZTUzODc2OA==; RT="z=1&dm=baidu.com&si=bab82135-beab-443d-bcbe-16e83d734b9f&ss=lvhs1t1u&sl=1&tt=34k&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=4an"';
    authentication.expireDate = requestModule.getExpiryDate();
  } else {
    throw 'set-cookie is undefined';
  }
}

// translate
async function translate(option) {
  // check expire date
  if (new Date().getTime() >= authentication.expireDate) {
    await initialize();
  }

  const currentTime = new Date().getTime();
  const response = await requestModule.post(
    'https://fanyi.baidu.com/ait/text/translate',
    JSON.stringify({
      query: option.text,
      from: option.from,
      to: option.to,
      reference: '',
      corpusIds: [],
      qcSettings: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
      needPhonetic: true,
      domain: 'common',
      milliTimestamp: currentTime,
    }),
    {
      Accept: 'text/event-stream',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      Connection: 'keep-alive',
      'Content-Type': 'application/json',
      Cookie: authentication.cookie,
      Origin: 'https://fanyi.baidu.com',
      //Referer: 'https://fanyi.baidu.com/',
      'Sec-Ch-Ua': requestModule.getSCU(),
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': requestModule.getUserAgent(),
    }
  );

  const responseArray = response?.data?.split('\n') || [];
  let list = [];
  let text = '';

  for (let index = 0; index < responseArray.length; index++) {
    const element = responseArray[index];
    if (/^data:/i.test(element)) {
      const data = JSON.parse(element.replace(/^data:/i, ''));

      if (data?.data?.list) {
        list = data.data.list;
        break;
      }
    }
  }

  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    text += element?.dst || '';
  }

  if (text.length > 0) {
    return text;
  } else {
    throw response?.data;
  }
}

// module exports
module.exports = { exec };
