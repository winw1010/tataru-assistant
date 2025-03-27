'use strict';

// net
const { net } = require('electron');

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
let scu = '"Not(A:Brand";v="99", "Chromium";v="133", "Google Chrome";v="133"';

// user agent
let userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

// get
async function get(url = '', headers = {}, timeout = 10000, useProxy = false) {
  const options = { headers, timeout };

  if (useProxy) {
    options.proxy = getProxy();
  }

  return await netRequest('GET', url, null, options);
}

// post
async function post(url = '', data = '', headers = {}, timeout = 10000, useProxy = false) {
  const options = { headers, timeout };

  if (useProxy) {
    options.proxy = getProxy();
  }

  return await netRequest('POST', url, data, options);
}

// net request
async function netRequest(method = 'GET', url = '', data = null, options = {}) {
  const request = options.proxy
    ? net.request({
        method: method,
        protocol: options.proxy.protocol,
        hostname: options.proxy.host,
        port: options.proxy.port,
      })
    : net.request({
        method: method,
        url: url,
      });

  Object.keys(checkHeaders(options.headers)).forEach((headerName) => {
    try {
      request.setHeader(headerName, options.headers[headerName]);
    } catch (error) {
      console.log(error);
    }
  });

  request.on('response', (response) => {
    const chunkArray = [];

    response.on('data', (chunk) => {
      chunkArray.push(chunk);
    });

    response.on('end', () => {
      const responseData = Buffer.concat(chunkArray).toString();
      try {
        return JSON.parse(responseData);
      } catch (error) {
        console.log(error);
        return responseData;
      }
    });

    response.on('error', (error) => {
      throw error;
    });
  });

  request.on('login', (authInfo, callback) => {
    callback(options.proxy.username, options.proxy.password);
  });

  request.on('error', (error) => {
    throw error;
  });

  if (data) {
    request.end(data);
  } else {
    request.end();
  }

  setTimeout(() => {
    request.abort();
    throw `Request Timeout(${method}, ${url})`;
  }, options.timeout);
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
function checkHeaders(headers = {}) {
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

// get proxy
function getProxy() {
  const config = configModule.getConfig();

  return {
    protocol: config.proxy.protocol + ':',
    host: config.proxy.host,
    port: parseInt(config.proxy.port),
    username: config.proxy.username,
    password: config.proxy.password,
  };
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
