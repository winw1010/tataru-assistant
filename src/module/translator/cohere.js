'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

// translate
async function exec(option) {
  const response = translate(option.text, option.from, option.to);
  return response;
}

async function translate(text = '', source = 'Japanese', target = 'Chinese') {
  const config = configModule.getConfig();
  const response = await requestModule.post(
    'https://api.cohere.ai/v1/chat',
    {
      preamble: aiFunction.createSystemContent(source, target),
      message: text,
      maxTokens: 4096,
      temperature: 0.7,
      //top_p: 1,
    },
    {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + config.api.cohereToken,
    }
  );

  console.log('Tokens:', response?.data?.meta?.tokens);

  return response.data.text;
}

// module exports
module.exports = {
  exec,
};
