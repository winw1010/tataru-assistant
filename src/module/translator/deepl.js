'use strict';

// Cookie: https://www.deepl.com/translator
// Split Text: https://www2.deepl.com/jsonrpc?method=LMT_split_text
// Translate: https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs

// deepl function
const deeplFunction = require('./deepl-function');

// request module
const requestModule = require('../system/request-module');

// RegExp
/*
const regINGRESSCOOKIE = /(?<target>INGRESSCOOKIE=[^;]+)/is;
const regUserCountry = /(?<target>userCountry=[^;]+)/is;
const regReleaseGroups = /(?<target>releaseGroups=[^;]+)/is;
const regDapUid = /(?<target>dapUid=[^;]+)/is;
*/

// authentication
let authentication = {
  id: 0,
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
  setAuthentication();
}

// set cookie
async function setCookie() {
  /*
  const cookie = await requestModule.getCookie('https://www.deepl.com/translator', [
    regINGRESSCOOKIE,
    regUserCountry,
    regReleaseGroups,
    regDapUid,
  ]);

  authentication.cookie = cookie.join('; ');
  authentication.expireDate = requestModule.getExpiryDate();
  */

  authentication.cookie = deeplFunction.getCookie();
  authentication.expireDate = requestModule.getExpiryDate();
}

// set authentication
function setAuthentication() {
  authentication.id = Math.floor(Math.random() * (100_000_000 - 1_000_000 + 1)) + 1_000_000;
}

// split text
async function splitText(text = '') {
  let postData = deeplFunction.getSplitText();
  postData.id = authentication.id++;
  postData.params.texts = [text];

  const response = await requestModule.post(
    'https://www2.deepl.com/jsonrpc?method=LMT_split_text',
    deeplFunction.fixMethod(postData.id, JSON.stringify(postData)),
    {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'zh-TW,zh;q=0.9',
      'Content-Type': 'application/json',
      Cookie: authentication.cookie,
      Origin: 'https://www.deepl.com',
      Referer: 'https://www.deepl.com/',
      'Sec-Ch-Ua': requestModule.getSCU(),
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': requestModule.getUserAgent(),
    }
  );

  return response.data.result.texts[0].chunks;
}

// translate
async function translate(option) {
  // check expire date
  if (new Date().getTime() >= authentication.expireDate) {
    await initialize();
  }

  const chunks = await splitText(option.text);

  let postData = deeplFunction.getHandleJobs();
  postData.id = authentication.id++;
  postData.params.jobs = deeplFunction.generateJobs(chunks);
  postData.params.lang.source_lang_computed = option.from;
  postData.params.lang.target_lang = option.to;
  postData.params.timestamp = deeplFunction.generateTimestamp(postData.params.jobs);

  const response = await requestModule.post(
    'https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs',
    deeplFunction.fixMethod(postData.id, JSON.stringify(postData)),
    {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'zh-TW,zh;q=0.9',
      'Content-Type': 'application/json',
      Cookie: authentication.cookie,
      Origin: 'https://www.deepl.com',
      Referer: 'https://www.deepl.com/',
      'Sec-Ch-Ua': requestModule.getSCU(),
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': requestModule.getUserAgent(),
    }
  );

  const resultArray = response.data.result.translations;
  let result = '';

  for (let index = 0; index < resultArray.length; index++) {
    result += resultArray[index].beams[0].sentences[0].text || '';
  }

  return result;
}

// module exports
module.exports = { exec };
