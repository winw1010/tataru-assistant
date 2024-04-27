'use strict';

// https://papago.naver.com/
// https://papago.naver.com/main.7fb83b159297990e1b87.chunk.js
// Authorization:"PPG "+t+":"+p.a.HmacMD5(t+"\n"+e.split("?")[0]+"\n"+n,"v1.7.2_9d7a38d925").toString(p.a.enc.Base64),Timestamp:n
// v1.7.5_9b3c4db4fc
// const versionRegExp = /HmacMD5\(.+,"(?<target>.+)"\)\.toString\(.+?\.enc\.Base64\)/is;

// papago function
const papagoFunction = require('./papago-function');

// request module
const requestModule = require('../system/request-module');

// RegExp
const regJSESSIONID = /(?<target>JSESSIONID=[^;]+)/is;
const regFileName = /src="\/(?<target>main\..+?\.chunk\.js)"/is;
const regPpg = /(?<target>PPG.+?HmacMD5.+?toString.+?Base64)/is;
const regVersion = /"(?<target>v\d+\.\d+\.\d+_[^"]+)"/is;

// authentication
let authentication = {
  deviceId: '',
  papagoVersion: '',
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
  // set authentication
  await setAuthentication();
}

// set cookie
async function setAuthentication() {
  const response1 = await requestModule.get('https://papago.naver.com/');

  // set cookie
  const setCookie = response1?.headers?.['set-cookie'];

  if (setCookie) {
    regJSESSIONID.lastIndex = 0;
    const value = regJSESSIONID.exec(setCookie.join('; '))?.groups?.target;

    authentication.cookie = value + '; papago_skin_locale=en; NNB=DUY6W7XWYMWGM ';
    authentication.expireDate = requestModule.getExpiryDate();
  } else {
    throw 'set-cookie is undefined';
  }

  // set authentication
  const fileName = regFileName.exec(response1?.data)?.groups?.target;

  if (fileName) {
    const response2 = await requestModule.get('https://papago.naver.com/' + fileName);
    const ppg = regPpg.exec(response2?.data)?.groups?.target;
    const version = regVersion.exec(ppg)?.groups?.target;

    if (version) {
      authentication.deviceId = papagoFunction.generateDeviceId();
      authentication.papagoVersion = version;
    } else {
      throw 'version is undefined';
    }
  } else {
    throw 'fileName is undefined';
  }
}

// translate
async function translate(option) {
  // check expire date
  if (new Date().getTime() >= authentication.expireDate) {
    await initialize();
  }

  const currentTime = new Date().getTime();
  const authorization = `PPG ${authentication.deviceId}:${papagoFunction.generateSignature(
    authentication,
    currentTime
  )}`;

  const response = await requestModule.post(
    'https://papago.naver.com/apis/n2mt/translate',
    encodeURI(
      requestModule.toParameters({
        deviceId: authentication.deviceId,
        locale: 'en-US',
        agree: false,
        dict: 'true',
        dictDisplay: 30,
        honorific: false,
        instant: false,
        paging: false,
        source: option.from,
        target: option.to,
        text: option.text,
      })
    ),
    {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US',
      Authorization: authorization,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: authentication.cookie,
      Origin: 'https://papago.naver.com',
      Referer: 'https://papago.naver.com/',
      'Sec-Ch-Ua': requestModule.getSCU(),
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      Timestamp: currentTime,
      'User-Agent': requestModule.getUserAgent(),
      'X-Apigw-Partnerid': 'papago',
    }
  );

  if (response?.data?.translatedText) {
    return response.data.translatedText;
  } else {
    throw response?.data;
  }
}

// module exports
module.exports = { exec };
