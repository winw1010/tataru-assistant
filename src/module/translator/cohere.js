'use strict';

const { CohereClient } = require('cohere-ai');

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
  const cohere = new CohereClient({
    token: config.system.cohereToken,
  });
  return cohere;
}

async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
  if (!currentCohere) currentCohere = createCohereClient();

  let prompt = `I want you to act as an expert translator. You will be provided with a sentence in ${source}, and your task is to translate it into ${target}.`;
  let prediction = null;

  if (table.length > 0) {
    prompt += ' And';
    for (let index = 0; index < table.length; index++) {
      const element = table[index];
      prompt += ` replace ${element[0]} with ${element[1]},`;
    }
    prompt = prompt.slice(0, prompt.lastIndexOf(',')) + '.';
  }

  try {
    prediction = await currentCohere.chat({
      preamble: prompt,
      message: sentence,
      maxTokens: 4096,
      temperature: 0,
      //temperature: 0.7,
      //top_p: 1,
    });

    console.log('prompt', prompt);
    console.log('Input Tokens:', prediction?.meta?.tokens.inputTokens);
    console.log('Output Tokens:', prediction?.meta?.tokens.outputTokens);
    return prediction?.text?.replace(/^翻译结果：/, '') || '';
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}

// module exports
module.exports = {
  exec,
};
