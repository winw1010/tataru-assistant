'use strict';

// axios
const axios = require('axios').default;

// config module
const configModule = require('./config-module');

// restricted headers of Chromium
// Additionally, setting the Connection header to the value upgrade is also disallowed.
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

// sec-ch-ua
let scu = '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"';

// user agent
let userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// get
async function get(url = '', headers = {}, timeout = 10000) {
  const config = configModule.getConfig();
  const proxyAuth = config.proxy.username && config.proxy.password;
  const proxy = config?.proxy?.enable
    ? {
        protocol: config.proxy.protocol + ':',
        host: config.proxy.host,
        port: parseInt(config.proxy.port),
        auth: proxyAuth
          ? {
              username: config.proxy.username,
              password: config.proxy.password,
            }
          : undefined,
      }
    : undefined;

  let response = null;

  try {
    response = await axios({ method: 'get', url, headers: clearHeaders(headers), timeout, proxy });
  } catch (error) {
    console.log(error);
    throw 'GET error: ' + url;
  }

  return response;
}

// post
async function post(url = '', data = '', headers = {}, timeout = 10000) {
  const config = configModule.getConfig();
  const proxy = config?.proxy?.enable
    ? {
        protocol: config.proxy.protocol + ':',
        host: config.proxy.host,
        port: parseInt(config.proxy.port),
        auth:
          config.proxy.username && config.proxy.password
            ? {
                username: config.proxy.username,
                password: config.proxy.password,
              }
            : undefined,
      }
    : undefined;

  let response = null;

  try {
    response = await axios({ method: 'post', url, data, headers: clearHeaders(headers), timeout, proxy });
    console.log('Response data:', response.data);
  } catch (error) {
    console.log(error);
    throw 'POST error: ' + url;
  }

  return response;
}

// get cookie
async function getCookie(url = '', regArray = []) {
  const response = await get(url);
  const setCookie = response.headers['set-cookie'].join('; ');
  const cookie = [];

  for (let index = 0; index < regArray.length; index++) {
    const reg = regArray[index];
    reg.lastIndex = 0;
    const target = reg.exec(setCookie).groups.target;

    if (target) {
      cookie.push(target);
    }
  }

  if (cookie.length > 0) {
    return cookie;
  } else {
    throw 'Target cookie is undefined, set-cookie: ' + setCookie;
  }
}

// clear headers
function clearHeaders(headers = {}) {
  const headerNames = Object.getOwnPropertyNames(headers);

  for (let index = 0; index < headerNames.length; index++) {
    const element = headerNames[index];
    if (restrictedHeaders.includes(element)) {
      delete headers[element];
    }
  }

  if (headers['Connection'] === 'upgrade') {
    delete headers['Connection'];
  }

  return headers;
}

// get expiry date
function getExpiryDate() {
  return new Date().getTime() + 21600000;
}

// get sec-ch-ua
function getSCU() {
  return scu;
}

// set sec-ch-ua
function setSCU(value = []) {
  let notA = null;
  let chromium = null;

  for (let index = 0; index < value.length; index++) {
    const element = value[index];
    if (element.brand !== 'Chromium') {
      notA = element;
    } else {
      chromium = element;
    }
  }

  if (notA && chromium) {
    scu = `"${chromium.brand}";v="${chromium.version}", "${notA.brand}";v="${notA.version}", "Google Chrome";v="${chromium.version}"`;
  }

  return Boolean(notA && chromium);
}

// get user agent
function getUserAgent() {
  return userAgent;
}

// set user agent
function setUserAgent(value = '') {
  userAgent = value
    .replace(/\s+tataru-assistant\/\d+\.\d+\.\d+\s+/gi, ' ')
    .replace(/\s+Electron\/\d+\.\d+\.\d+\s+/gi, ' ')
    .replace(/(Chrome\/\d+)\.\d+\.\d+.\d+/gi, '$1.0.0.0');
}

// set UA
function setUA(scuValue = [], uaValue = '') {
  try {
    if (!(Array.isArray(scuValue) && scuValue.length > 0 && typeof uaValue === 'string' && uaValue.length > 0)) {
      return;
    }

    if (setSCU(scuValue)) {
      setUserAgent(uaValue);
      console.log(scu);
      console.log(userAgent);
    }
  } catch (error) {
    console.log(error);
  }
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
  setUA,
  toParameters,
};
