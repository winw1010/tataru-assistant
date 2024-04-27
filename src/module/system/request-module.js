'use strict';

// axios
const axios = require('axios').default;

// config module
const configModule = require('./config-module');

/*
// restricted headers
const restrictedHeaders = [
  'Content-Length',
  'Host',
  'Trailer',
  'Te',
  'Upgrade',
  'Cookie2',
  'Keep-Alive',
  'Transfer-Encoding',
];
*/

// get
async function get(url = '', headers = {}, timeout = 10000) {
  let response = null;

  try {
    response = await axios.get(url, { timeout, headers });
  } catch (error) {
    console.log(error);
  }

  return response;
}

// post
function post(url = '', data = '', headers = {}, timeout = 10000) {
  let response = null;

  try {
    response = axios.post(url, data, { timeout, headers });
  } catch (error) {
    console.log(error);
  }

  return response;
}

// get cookie
async function getCookie(url = '', regArray = []) {
  const response = await get(url);
  const setCookie = response?.headers?.['set-cookie']?.join('; ');

  if (setCookie) {
    const cookie = [];

    for (let index = 0; index < regArray.length; index++) {
      const reg = regArray[index];
      reg.lastIndex = 0;
      const target = reg.exec(setCookie)?.groups?.target;

      if (target) {
        cookie.push(target);
      }
    }

    if (cookie.length > 0) {
      return cookie;
    } else {
      throw 'target is undefined, set-cookie: ' + setCookie;
    }
  } else {
    throw 'set-cookie is undefined';
  }
}

// get expiry date
function getExpiryDate() {
  return new Date().getTime() + 21600000;
}

// get sec-ch-ua
function getSCU() {
  const scu = configModule.getConfig()?.system?.scu;
  return scu ? scu : configModule.getDefaultConfig().system.scu;
}

// get user agent
function getUserAgent() {
  const userAgent = configModule.getConfig()?.system?.userAgent;
  return userAgent ? userAgent : configModule.getDefaultConfig().system.userAgent;
}

// to parameters
function toParameters(data = {}) {
  const dataNames = Object.getOwnPropertyNames(data);
  let parameters = [];

  for (let index = 0; index < dataNames.length; index++) {
    const dataName = dataNames[index];
    parameters.push(`${dataName}=${data[dataName]}`);
  }

  return parameters.join('&');
}

// module exports
module.exports = {
  get,
  post,
  getCookie,
  getExpiryDate,
  getSCU,
  getUserAgent,
  toParameters,
};
