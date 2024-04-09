'use strict';

const OpenAI = require('openai').default;

const configModule = require('../system/config-module');

const regGptModel = /^gpt-\d+(\.\d+)?(-turbo)?(-preview)?$/i;
const regOtherGptModel = /gpt/i;

// translate
async function exec(option) {
  try {
    const response = translate(option.text, option.from, option.to);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function createOpenai(apiKey = null) {
  const config = configModule.getConfig();
  const openai = !config.system.UnofficialApi
    ? new OpenAI({
        apiKey: apiKey ? apiKey : config.system.gptApiKey,
      })
    : new OpenAI({
        apiKey: apiKey ? apiKey : config.system.gptApiKey,
        baseURL: config.system.unofficialApiUrl,
      });
  return openai;
}

async function translate(sentence = '', source = 'Japanese', target = 'Chinese') {
  const config = configModule.getConfig();
  const openai = createOpenai();

  let response = null;

  try {
    response = await openai.chat.completions.create({
      model: config.system.gptModel,
      messages: [
        {
          role: 'system',
          content: `You will be provided with a sentence in ${source}, and your task is to translate it into ${target}. Convert the sentence to standard ${source} before translation.`,
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

async function getModelList(apiKey = null) {
  let list = [];
  try {
    const openai = createOpenai(apiKey);
    const gptModelList = [];
    const otherGptModelList = [];
    const otherModelList = [];

    const tempModelList = (await openai.models.list()).data.map((x) => x.id);
    tempModelList.sort();

    for (let index = 0; index < tempModelList.length; index++) {
      const modelId = tempModelList[index];

      if (regGptModel.test(modelId)) {
        gptModelList.push(modelId);
      } else if (regOtherGptModel.test(modelId)) {
        otherGptModelList.push(modelId);
      } else {
        otherModelList.push(modelId);
      }
    }

    list = [].concat(['# GPT'], gptModelList, ['# Other GPT'], otherGptModelList, ['# Other'], otherModelList);
  } catch (error) {
    console.log(error?.error?.message || error);
  }
  return list;
}

// module exports
module.exports = {
  exec,
  getModelList,
};
