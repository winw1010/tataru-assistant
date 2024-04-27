'use strict';

const axios = require('axios').default;

// request module
//const requestModule = require('../system/request-module');

// translate
async function exec(option) {
  try {
    const response = await axios.post(
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
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'x-authorization': 'token lqkr1tfixq1wa9kmj9po',
        },
      }
    );

    if (response.data?.target) {
      return response.data.target;
    } else {
      return response.data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

// module exports
module.exports = { exec };
