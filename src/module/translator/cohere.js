'use strict';

const { CohereClient } = require('cohere-ai');

const { createPrompt } = require('./ai-function');

const configModule = require('../system/config-module');

let currentCohere = null;

// translate
async function exec(option, table = []) {
  try {
    const response = translate(option.text, option.from, option.to, table);
    return response;
  } catch (error) {
    console.log(error);
    currentCohere = null;
    return error;
  }
}

function createCohereClient() {
  const config = configModule.getConfig();

  if (config.system.cohereToken === '') throw '請至【API設定】輸入API key';

  const cohere = new CohereClient({
    token: config.system.cohereToken,
  });
  return cohere;
}

async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
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

// module exports
module.exports = {
  exec,
};
