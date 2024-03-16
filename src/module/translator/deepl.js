'use strict';

// Cookie: https://www.deepl.com/translator
// Split Text: https://www2.deepl.com/jsonrpc?method=LMT_split_text
// Translate: https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs

// deepl function
const deeplFunction = require('./deepl-function');

// request module
const requestModule = require('../system/request-module');

// RegExp
const dapUidRegExp = /(?<target>dapUid=[^;]+)/is;

// expire date
let expireDate = 0;

// cookie
let cookie = '';

// authentication
let authentication = {};

// exec
async function exec(option) {
  try {
    let result = '';

    // check expire date
    if (new Date().getTime() >= expireDate) {
      await initialize();
    }

    // split text
    const chunks = await splitText(option.text);

    // get result
    chunks &&
      (result = await translate(cookie, authentication, option, chunks));

    return result;
  } catch (error) {
    console.log(error);
    expireDate = 0;
    return '';
  }
}

// initialize
async function initialize() {
  // set cookie
  await setCookie();

  // set authentication
  setAuthentication();
}

// set cookie
async function setCookie() {
  dapUidRegExp.lastIndex = 0;

  const response = await requestModule.getCookie(
    {
      protocol: 'https:',
      hostname: 'www.deepl.com',
      path: '/translator',
    },
    dapUidRegExp
  );

  if (response) {
    cookie = response;
    expireDate = requestModule.getExpiryDate();
  } else {
    throw 'ERROR: setCookie';
  }
}

// set authentication
function setAuthentication() {
  authentication = {
    id: Math.floor(Math.random() * (100_000_000 - 1_000_000 + 1)) + 1_000_000,
  };
}

// split text
async function splitText(text) {
  let postData = deeplFunction.getSplitText();
  postData.id = authentication.id++;
  postData.params.texts = [text];

  const response = await requestModule.post(
    {
      protocol: 'https:',
      hostname: 'www2.deepl.com',
      path: '/jsonrpc?method=LMT_split_text',
    },
    deeplFunction.fixMethod(postData.id, JSON.stringify(postData)),
    {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-TW,zh;q=0.9',
      'content-type': 'application/json',
      origin: 'https://www.deepl.com',
      referer: 'https://www.deepl.com/',
      'sec-ch-ua': requestModule.getSCU(),
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': requestModule.getUserAgent(),
    }
  );

  console.log(response);

  if (response?.result?.texts[0]?.chunks) {
    return response.result.texts[0].chunks;
  } else {
    throw 'ERROR: splitText';
  }
}

// translate
async function translate(cookie, authentication, option, chunks) {
  let postData = deeplFunction.getHandleJobs();
  postData.id = authentication.id++;
  postData.params.jobs = deeplFunction.generateJobs(chunks);
  postData.params.lang.source_lang_computed = option.from;
  postData.params.lang.target_lang = option.to;
  postData.params.timestamp = deeplFunction.generateTimestamp(
    postData.params.jobs
  );

  const response = await requestModule.post(
    {
      protocol: 'https:',
      hostname: 'www2.deepl.com',
      path: '/jsonrpc?method=LMT_handle_jobs',
    },
    deeplFunction.fixMethod(postData.id, JSON.stringify(postData)),
    {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-TW,zh;q=0.9',
      'content-type': 'application/json',
      cookie: cookie,
      origin: 'https://www.deepl.com',
      referer: 'https://www.deepl.com/',
      'sec-ch-ua':
        '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': requestModule.getUserAgent(),
    }
  );

  if (response?.result?.translations) {
    let result = '';
    const resultArray = response?.result.translations;

    for (let index = 0; index < resultArray.length; index++) {
      result += resultArray[index]?.beams[0]?.sentences[0]?.text || '';
    }

    return result;
  } else {
    console.log('cookie:', cookie);
    console.log('authentication:', authentication);
    console.log('option:', option);
    console.log('chunks:', chunks);
    console.log('data:', response);
    throw 'ERROR: translate';
  }
}

// module exports
module.exports = { exec };
