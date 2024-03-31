'use strict';

const OpenAI = require('openai').default;

const configModule = require('../system/config-module');

let currentOpenai = null;

// translate
async function exec(option) {
  try {
    if (!currentOpenai) createOpenai();
    const response = translate(option.text, option.from, option.to);
    return response;
  } catch (error) {
    console.log(error);
    currentOpenai = null;
    return error;
  }
}

function createOpenai() {
  const config = configModule.getConfig();
  const openai = new OpenAI({
    baseURL: config.system.openaiBaseURL || 'https://api.openai.com/v1',
    apiKey: config.system.openaiApiKey,
  });
  currentOpenai = openai;
}

async function translate(sentence = '', source = 'Japanese', target = 'Chinese') {
  sentence = sentence.replace(/\r|\n/g, '');
  const config = configModule.getConfig();
  //const openai = currentOpenai;
  const openai = new OpenAI({
    baseURL: config.system.openaiBaseURL || 'https://api.openai.com/v1',
    apiKey: config.system.openaiApiKey,
  });

  let response = null;

  try {
    if (config.system.skipVerifySSL === false) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    }
    response = await openai.chat.completions.create({
      model: config.system.openaiModel || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: config.system.openaiPrompt === '' ? `You will be provided with a sentence in ${source}, and your task is to translate it into ${target}.` : config.system.openaiPrompt.replace('$source',source).replace('$target',target),
        },
        {
          role: 'user',
          content: sentence,
        },
      ],
      temperature: 0,
      //temperature: 0.7,
      //top_p: 1,
    });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1;
    console.log('Total Tokens:', response?.usage?.total_tokens);
    return response?.choices[0]?.message?.content || '';
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}

// module exports
module.exports = { exec };
