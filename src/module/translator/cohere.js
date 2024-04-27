'use strict';

const axios = require('axios').default;

const { createPrompt } = require('./ai-function');

const configModule = require('../system/config-module');

// translate
async function exec(option, table = []) {
  try {
    const response = translate(option.text, option.from, option.to, table);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();
  const prompt = createPrompt(source, target, table);
  const response = await axios.post(
    'https://api.cohere.ai/v1/chat',
    {
      preamble: prompt,
      message: sentence,
      maxTokens: 3000,
      temperature: 0.7,
      //top_p: 1,
    },
    {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'bearer ' + config.api.cohereToken,
      },
    }
  );

  console.log('prompt', prompt);
  console.log('Tokens:', response.data?.meta?.tokens);

  if (response.data?.text) {
    return response.data.text;
  } else {
    return response.data;
  }
}

// module exports
module.exports = {
  exec,
};
