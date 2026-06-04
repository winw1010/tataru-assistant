'use strict';

// request module
const requestModule = require('../system/request-module');

// RegExp
// const regBaiduId = /BAIDUID=(?<target>[^;]+)/is;

// authentication
const acsToken =
  'P1_1780473606368_1780508691418_0BI2ThWrw+mrHTIsG17EoQeaekH6o53Ne2WfrdHhsMRVFeJw6STpKq/hWycWF0iDuDrB1WCI3mPiPLRgwJywzKiizgc8Z67hEGn1yrQJ9pLHAHhpUuOfBEnBWUI+AGoMPA4Ikjm8jGF/MRWeVexx/1u/h7k/oqJj3KZiKdwXFsqQXnKk1gsUF6eEDKAugbLHaFWQ4zdgSsiMZCwjcSpnHzmuXQTbWJ6S6IzhHCT1pK+tGuOwIqMqVuoMueU0C1NZrgczhthJAm1ftxKnhdf4xAB4OtWws7WhiPmjjKTY9jVDPJdobHkcOs1lffEzekGXOqSBBWYSOC6519D++MLwHK+NetI2aGOtiCw/ZXAgL5fRZfB355vB3IgC5GrOdFH7r+8Fm9JYD7HZvYTThiVm9kEMTf46JegQkyWns1PpbNFBi6EzCZmthmyoRVCIzKimpsdiJ2TCjVhH8apQt+52MBHje1qhLcDd89iilNp3jIIEsNxrc9t8rxUq6PhbpKtV';
const cookie =
  'BAIDUID=89E68CC747CF802C757EBD1411D96DB1:FG=1; BAIDUID_BFESS=89E68CC747CF802C757EBD1411D96DB1:FG=1; AIT_PERSONAL_VERSION=1; AIT_ENTERPRISE_VERSION=1; ab_sr=1.0.1_MjRmZGMzOTIxMTI2MDYxNTMxNzYzNjViYjM2N2Y5MDhiNDU1OTc4OWVjMTc5ZWIwZGQ0MTU3YzVjYThkZWJjMzQzOGM1Mzk2ZGI3OGU0ZjliMjQ2NWU4ZDNiZTMzZWFjYmFlZGQ2ZjRlMmM1OGQ5NDcxNjA2ZDdmMWQxOWI0OTcxYjIzYTJhODU2MGNhNjE1NTgzZGM2YjVhZmY0M2RkMDUyYTY2ZjI2MzcwOTVmZTYxNDFkNDM3NjhiZDFhMGIz; RT="z=1&dm=baidu.com&si=5ff76d83-e229-45ec-95af-905228ec8695&ss=mpybdk7r&sl=6&tt=414&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=1iwme"';

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

/*
// initialize
async function initialize() {
  // set cookie
  await setCookie();
}

// set cookie
async function setCookie() {
  const cookie = await requestModule.getCookie('https://fanyi.baidu.com/', [regBaiduId]);
  authentication.cookie =
    'BAIDUID=' +
    cookie[0] +
    '; BAIDUID_BFESS=' +
    cookie[0] +
    +'; ab_sr=1.0.1_MmMzZTM2NzE5ZWFjNjM5MTgyNzBiYWZlMWNjOWY3NjFlM2M2NDM4MTdmOWZiNWVkZjUwYzAzZTlkNGMzZmNkNzAwNWEwOWMyOWI1ZDUwNThlZDdiN2MyMWYyOWI2NDEzOTYyYTRkNzhkZTE0NTQ1ODg0YzlhMWNiNjk5ODExOWI4NWZmMzU5NTE3ZTBkNzI5ZWZkNjliZTU5ZTUzODc2OA==; RT="z=1&dm=baidu.com&si=bab82135-beab-443d-bcbe-16e83d734b9f&ss=lvhs1t1u&sl=1&tt=34k&bcn=https%3A%2F%2Ffclog.baidu.com%2Flog%2Fweirwood%3Ftype%3Dperf&ld=4an"';
  authentication.expireDate = requestModule.getExpiryDate();
}
*/

// translate
async function translate(option) {
  /*
  // check expire date
  if (new Date().getTime() >= authentication.expireDate) {
    await initialize();
  }
  */

  // // sug
  // await requestModule.post('https://fanyi.baidu.com/sug', `kw=${encodeURI(option.text)}`, {
  //   Accept: '*/*',
  //   'Accept-Encoding': 'gzip, deflate, br, zstd',
  //   'Accept-Language': 'zh-TW,zh;q=0.9',
  //   Connection: 'keep-alive',
  //   'Content-Type': 'application/x-www-form-urlencoded',
  //   Cookie: cookie,
  //   Host: 'fanyi.baidu.com',
  //   Origin: 'https://fanyi.baidu.com',
  //   Referer: 'https://fanyi.baidu.com/mtpe-individual/transText',
  //   'Sec-Fetch-Dest': 'empty',
  //   'Sec-Fetch-Mode': 'cors',
  //   'Sec-Fetch-Site': 'same-origin',
  //   'User-Agent': requestModule.getUserAgent(),
  //   'sec-ch-ua': requestModule.getSCU(),
  //   'sec-ch-ua-mobile': '?0',
  //   'sec-ch-ua-platform': '"Windows"',
  // });

  // // usage
  // await requestModule.post(
  //   'https://fanyi.baidu.com/ait/bingads/usage',
  //   '{"conversion_type":"text","reason_by":{"ec":"10001","ea":"10003","extra":"{"k1":"中文(简体)_日语","k2":"AI精翻非深度思考","k3":"实时发起翻译","k4":["启用个性指令-无内容","启用联网搜索术语"]}"}}',
  //   {
  //     Accept: '*/*',
  //     'Accept-Encoding': 'gzip, deflate, br, zstd',
  //     'Accept-Language': 'zh-TW,zh;q=0.9',
  //     Connection: 'keep-alive',
  //     'Content-Type': 'application/json',
  //     Cookie: cookie,
  //     Origin: 'https://fanyi.baidu.com',
  //     Referer: 'https://fanyi.baidu.com/mtpe-individual/transText',
  //     'sec-ch-ua': requestModule.getSCU(),
  //     'sec-ch-ua-mobile': '?0',
  //     'sec-ch-ua-platform': '"Windows"',
  //     'Sec-Fetch-Dest': 'empty',
  //     'Sec-Fetch-Mode': 'cors',
  //     'Sec-Fetch-Site': 'same-origin',
  //     'User-Agent': requestModule.getUserAgent(),
  //   },
  // );

  const currentTime = new Date().getTime();
  const response = await requestModule.post(
    'https://fanyi.baidu.com/ait/text/translate',
    JSON.stringify({
      needNewlineCombine: false,
      disableCache: false,
      isAi: false,
      sseStartTime: currentTime - 1,
      query: option.text,
      from: option.from,
      to: option.to,
      corpusIds: [],
      needPhonetic: true,
      domain: 'common',
      detectLang: '',
      isIncognitoAI: false,
      milliTimestamp: currentTime,
    }),
    {
      Accept: 'text/event-stream',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'zh-TW,zh;q=0.9',
      'Acs-token': acsToken,
      Connection: 'keep-alive',
      'Content-Type': 'application/json',
      Cookie: cookie,
      Origin: 'https://fanyi.baidu.com',
      Referer:
        'https://fanyi.baidu.com/mtpe-individual/transText?' +
        requestModule.toParameters({ query: option.text, lang: `${option.from}2${option.to}` }),
      'Sec-Ch-Ua': requestModule.getSCU(),
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': requestModule.getUserAgent(),
    },
  );

  const responseArray = response.data.split('\n') || [];
  let list = null;
  let text = '';

  for (let index = 0; index < responseArray.length; index++) {
    const line = responseArray[index];
    if (/^data:/i.test(line)) {
      const data = JSON.parse(line.replace(/^data:/i, ''));

      if (data.data && data.data.list && data.data.event && data.data.event === 'Translating') {
        list = data.data.list;
        break;
      }
    }
  }

  for (let index = 0; index < list.length; index++) {
    const element = list[index];
    text += element.dst || '';
  }

  return text;
}

// module exports
module.exports = { exec };
