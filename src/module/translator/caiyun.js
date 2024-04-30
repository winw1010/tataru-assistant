'use strict';

// request module
const requestModule = require('../system/request-module');

// translate
async function exec(option) {
  const response = await requestModule.post(
    'https://api.interpreter.caiyunai.com/v1/translator',
    {
      source: option.text,
      trans_type: `${option.from}2${option.to}`,
      replaced: true,
      detect: true,
      media: 'text',
      request_id: '5a096eec830f7876a48aac47',
    },
    {
      'Content-Type': 'application/json',
      'x-authorization': 'token lqkr1tfixq1wa9kmj9po',
    }
  );

  return response.data.target;
}

// module exports
module.exports = { exec };
