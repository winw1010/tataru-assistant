'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const maxTokens = 4096;

// exec
async function exec(option, table = [], type = 'sentence') {
  const response = translate(option.text, option.from, option.to, table, type);
  return response;
}

// translate
async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = [], type = 'sentence') {
  const config = configModule.getConfig();
  const prompt = aiFunction.createPrompt(source, target, table, type);
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
        content: 'You are a professional translator.',
      },
      {
        role: 'user',
        content: prompt + `\r\nThe ${type}:\r\n` + sentence,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
    //top_p: 1,
  };

  const response = await requestModule.post(apiUrl, payload, headers);

  console.log('prompt:', prompt);
  console.log('Total Tokens:', response?.data?.usage?.total_tokens);

  return response.data.choices[0].message.content;
}

// module exports
module.exports = {
  exec,
};
