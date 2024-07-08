'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const maxTokens = 4096;

// exec
async function exec(option) {
  const response = translate(option.text, option.from, option.to);
  return response;
}

// translate
async function translate(text = '', source = 'Japanese', target = 'Chinese') {
  const config = configModule.getConfig();
  const apiUrl = config.api.llmApiUrl;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.llmApiKey}`,
  };

  const payload = {
    model: config.api.llmApiModel,
    messages: [
      {
        role: 'system',
        content: aiFunction.createSystemContent(source, target),
      },
      {
        role: 'user',
        content: text,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
    //top_p: 1,
  };

  const response = await requestModule.post(apiUrl, payload, headers);

  console.log('Total Tokens:', response?.data?.usage?.total_tokens);

  return response.data.choices[0].message.content;
}

// module exports
module.exports = {
  exec,
};
