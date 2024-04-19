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

  let prompt = `You will be provided with a sentence in ${source}, and your task is to translate it into ${target}. The response should not be in ${source}.`;
  let response = null;

  if (table.length > 0) {
    prompt += ` You are given the following table of translation of ${source} to ${target} terms that you must use every time you encounter one of the ${source} terms from the table in the text to translate:\r\n|${source}|${target}|`;
    for (let index = 0; index < table.length; index++) {
      const element = table[index];
      prompt += `\r\n|${element[0]}|${element[1]}|`;
    }
  }

  try {
    response = await currentCohere.chat({
      preamble: prompt,
      message: sentence,
      maxTokens: 3000,
      temperature: 0,
      //temperature: 0.7,
      //top_p: 1,
    });

    console.log('prompt', prompt);
    console.log('Input Tokens:', response?.meta?.tokens.inputTokens);
    console.log('Output Tokens:', response?.meta?.tokens.outputTokens);
    return response?.text?.replace(/^(翻译结果)|(翻譯結果)：/, '') || '';
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}

// module exports
module.exports = {
  exec,
};
