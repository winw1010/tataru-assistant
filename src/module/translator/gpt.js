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
    apiKey: config.system.gptApiKey,
  });
  currentOpenai = openai;
}

async function translate(sentence = '', source = 'Japanese', target = 'Chinese') {
  sentence = sentence.replace(/\r|\n/g, '');
  const config = configModule.getConfig();
  //const openai = currentOpenai;

  const openai = new OpenAI({
    apiKey: config.system.gptApiKey,
  });

  let response = null;

  try {
    response = await openai.chat.completions.create({
      model: getModel(config.system.gptModel),
      messages: [
        {
          role: 'system',
          content: `You will be provided with a sentence in ${source}, and your task is to translate it into ${target}.`,
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

    console.log('Total Tokens:', response?.usage?.total_tokens);
    return response?.choices[0]?.message?.content || '';
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}

function getModel(model = '') {
  if (model === '3') {
    model = 'gpt-3.5-turbo';
  } else if (model === '4') {
    model = 'gpt-4';
  }
  return model;
}

// module exports
module.exports = { exec };
