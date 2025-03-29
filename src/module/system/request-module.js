'use strict';

// net
const { net } = require('electron');

// config module
const configModule = require('./config-module');

// restricted headers of Chromium
// Additionally, setting the Connection header to the value upgrade is also disallowed.
// const restrictedHeaders = ['Content-Length', 'Host', 'Trailer', 'Te', 'Upgrade', 'Cookie2', 'Keep-Alive', 'Transfer-Encoding'];
const restrictedHeaders = [
  'content-length',
  'host',
  'trailer',
  'te',
  'upgrade',
  'cookie2',
  'keep-alive',
  'transfer-encoding',
  'connection',
];

// sec-ch-ua
let scu = '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"';

// user agent
let userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

// request timeout
const requestTimeout = 10000;

// get
async function get(url = '', headers = {}) {
  return await netRequest('GET', url, null, headers);
}

// post
async function post(url = '', data = '', headers = {}) {
  return await netRequest('POST', url, data, headers);
}

// net request
function netRequest(method = 'GET', url = '', data = null, headers = {}) {
  const config = configModule.getConfig();

  const request = config.proxy.enable
    ? net.request({
        method: method,
        protocol: config.proxy.protocol,
        hostname: config.proxy.hostname,
        port: parseInt(config.proxy.port),
        url: url,
      })
    : net.request({
        method: method,
        url: url,
      });

  Object.keys(clearHeaders(headers)).forEach((headerName) => {
    try {
      request.setHeader(headerName, headers[headerName]);
    } catch (error) {
      console.log(error);
    }
  });

  return new Promise((resolve, reject) => {
    request.on('response', (response) => {
      const chunkArray = [];

      response.on('data', (chunk) => {
        chunkArray.push(chunk);
      });

      response.on('end', () => {
        const responseData = {};
        responseData.headers = response.headers;
        responseData.data = Buffer.concat(chunkArray).toString();

        try {
          responseData.data = JSON.parse(responseData.data);
        } catch (error) {
          error;
        }

        if (method === 'POST') {
          console.log('Data:', responseData.data);
        }

        resolve(responseData);
      });

      response.on('error', (error) => {
        reject(error);
      });
    });

    request.on('login', (authInfo, callback) => {
      if (authInfo.isProxy) {
        callback(config.proxy.username, config.proxy.password);
      } else {
        reject('isProxy = false');
      }
    });

    request.on('error', (error) => {
      reject(error);
    });

    if (data) {
      if (typeof data !== 'string') {
        data = JSON.stringify(data);
      }

      request.end(data);
    } else {
      request.end();
    }

    setTimeout(() => {
      request.abort();
      reject(`Request Timeout(${method}, ${url})`);
    }, requestTimeout);
  });
}

// get cookie
async function getCookie(url = '', regArray = []) {
  const response = await get(url);
  const setCookie = response.headers['set-cookie'].join('; ');
  const cookie = [];
  const unusedIndex = [];

  for (let index = 0; index < regArray.length; index++) {
    const reg = regArray[index];
    reg.lastIndex = 0;
    const target = reg.exec(setCookie)?.groups?.target;

    if (target) {
      cookie.push(target);
    } else {
      unusedIndex.push(index);
    }
  }

  if (cookie.length === regArray.length) {
    return cookie;
  } else {
    console.log('Unused Index:', unusedIndex);
    throw `Failed to get the cookie from [${url}].`;
  }
}

// clear headers
function clearHeaders(headers = {}) {
  const headerNames = Object.keys(headers);

  for (let index = 0; index < headerNames.length; index++) {
    const headerName = headerNames[index];
    if (restrictedHeaders.includes(headerName.toLowerCase())) {
      delete headers[headerName];
    }
  }

  /*
  if (headers['Connection'] === 'upgrade') {
    delete headers['Connection'];
  }
  */

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
  const dataNames = Object.keys(data);
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
