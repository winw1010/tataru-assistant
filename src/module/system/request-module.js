'use strict';

// axios
const axios = require('axios').default;

// config module
const configModule = require('./config-module');

// restricted headers of Chromium
// Additionally, setting the Connection header to the value upgrade is also disallowed.
const restrictedHeaders = ['Content-Length', 'Host', 'Trailer', 'Te', 'Upgrade', 'Cookie2', 'Keep-Alive', 'Transfer-Encoding'];

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
    response = await axios.get(url, { headers: clearHeaders(headers), timeout, proxy });
  } catch (error) {
    console.log(error);
    throw 'Request error: GET ' + url;
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
    response = await axios.post(url, data, { headers: clearHeaders(headers), timeout, proxy });
    console.log('Response data:', response.data);
  } catch (error) {
    console.log(error);
    throw 'Request error: POST ' + url;
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
