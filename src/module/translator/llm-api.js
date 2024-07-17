'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const maxTokens = 4096;

// exec
async function exec(option, type) {
  const response = translate(option.text, option.from, option.to, type);
  return response;
}

// translate
async function translate(text, source, target, type) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslatePrompt(source, target, type);
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
        content: prompt,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
    //top_p: 1,
  };

  const response = await requestModule.post(apiUrl, payload, headers);

  console.log('Total Tokens:', response?.data?.usage?.total_tokens);
  console.log('Prompt:', prompt);

  return response.data.choices[0].message.content;
}

// module exports
module.exports = {
  exec,
};
