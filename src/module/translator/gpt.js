'use strict';

const OpenAI = require('openai').default;

const configModule = require('../system/config-module');

const regGptModel = /^gpt-\d+(\.\d+)?(-turbo)?(-preview)?$/i;
const regOtherGptModel = /gpt/i;

let currentOpenAI = null;

// translate
async function exec(option, table = []) {
  try {
    const response = translate(option.text, option.from, option.to, table);
    return response;
  } catch (error) {
    console.log(error);
    currentOpenAI = null;
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

async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();

  if (!currentOpenAI) currentOpenAI = createOpenai();

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
    response = await currentOpenAI.chat.completions.create({
      model: config.system.gptModel,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: sentence,
        },
      ],
      max_tokens: 3000,
      temperature: 0,
      //temperature: 0.7,
      //top_p: 1,
    });

    console.log('prompt', prompt);
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
    const gptModelList = [];
    const otherGptModelList = [];
    const otherModelList = [];
    const openai = createOpenai(apiKey);

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
