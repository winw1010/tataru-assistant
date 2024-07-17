'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

// translate
async function exec(option, type) {
  const response = translate(option.text, option.from, option.to, type);
  return response;
}

async function translate(text, source, target, type) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslatePrompt(source, target, type);
  const response = await requestModule.post(
    'https://api.cohere.ai/v1/chat',
    {
      preamble: prompt,
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
  console.log('Prompt:', prompt);

  return response.data.text;
}

// module exports
module.exports = {
  exec,
};
