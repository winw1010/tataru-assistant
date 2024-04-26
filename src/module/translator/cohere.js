'use strict';

const axios = require('axios').default;

//const { CohereClient } = require('cohere-ai');

const { createPrompt } = require('./ai-function');

const configModule = require('../system/config-module');

//let currentCohere = null;

// translate
async function exec(option, table = []) {
  try {
    const response = translate(option.text, option.from, option.to, table);
    return response;
  } catch (error) {
    console.log(error);
    //currentCohere = null;
    return error;
  }
}

/*
function createCohereClient() {
  const config = configModule.getConfig();
  const cohere = new CohereClient({
    token: config.api.cohereToken,
  });
  return cohere;
}
*/

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

/*
async function translate2(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
  if (!currentCohere) currentCohere = createCohereClient();

  let prompt = createPrompt(source, target, table);
  let response = null;

  try {
    response = await currentCohere.chat({
      preamble: prompt,
      message: sentence,
      maxTokens: 3000,
      temperature: 0.7,
      //top_p: 1,
    });

    console.log('prompt', prompt);
    console.log('Input Tokens:', response?.meta?.tokens.inputTokens);
    console.log('Output Tokens:', response?.meta?.tokens.outputTokens);
    return response?.text;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}
*/

// module exports
module.exports = {
  exec,
};
