'use strict';

const axios = require('axios').default;

//const OpenAI = require('openai').default;

const { createPrompt } = require('./ai-function');

const configModule = require('../system/config-module');

const regGptModel = /gpt-\d+(\.\d+)?(-turbo)?(-preview)?$/i;
//const regOtherGptModel = /gpt/i;

//let currentOpenAI = null;

// translate
async function exec(option, table = []) {
  try {
    const response = translate(option.text, option.from, option.to, table);
    return response;
  } catch (error) {
    console.log(error);
    //currentOpenAI = null;
    return error;
  }
}

/*
function createOpenai(apiKey = null) {
  const config = configModule.getConfig();
  const openai = !config.api.UnofficialApi
    ? new OpenAI({
        apiKey: apiKey ? apiKey : config.api.gptApiKey,
      })
    : new OpenAI({
        apiKey: apiKey ? apiKey : config.api.gptApiKey,
        baseURL: config.api.unofficialApiUrl,
      });
  return openai;
}
*/

async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();
  const prompt = createPrompt(source, target, table);
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: config.api.gptModel,
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
      temperature: 0.7,
      //top_p: 1,
    },
    {
      timeout: 10000,
      headers: { 'Content-Type': ' application/json', Authorization: 'Bearer ' + config.api.gptApiKey },
    }
  );

  console.log('prompt:', prompt);
  console.log('Total Tokens:', response.data?.usage?.total_tokens);

  if (response.data?.choices[0]?.message?.content) {
    return response.data?.choices[0]?.message?.content;
  } else {
    return '翻譯失敗';
  }
}

async function getModelList(apiKey = null) {
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      timeout: 10000,
      headers: { Authorization: 'Bearer ' + apiKey },
    });

    let list = [];
    let gptList = [];

    if (response.data.data) {
      list = response.data.data.map((x) => x.id);
    }

    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      if (regGptModel.test(element)) {
        gptList.push(element);
      }
    }

    return gptList.sort();
  } catch (error) {
    return [];
  }
}

/*
async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();

  if (!currentOpenAI) currentOpenAI = createOpenai();

  let prompt = createPrompt(source, target, table);
  let response = null;

  try {
    response = await currentOpenAI.chat.completions.create({
      model: config.api.gptModel,
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
      temperature: 0.7,
      //top_p: 1,
    });

    console.log('prompt:', prompt);
    console.log('Total Tokens:', response?.usage?.total_tokens);
    return response?.choices[0]?.message?.content;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
}
*/

/*
async function getModelList(apiKey = null) {
  let list = [];
  try {
    const gptModelList = [];
    //const otherGptModelList = [];
    //const otherModelList = [];
    const openai = createOpenai(apiKey);

    const tempModelList = (await openai.models.list()).data.map((x) => x.id);
    tempModelList.sort();

    for (let index = 0; index < tempModelList.length; index++) {
      const modelId = tempModelList[index];

      if (regGptModel.test(modelId)) {
        gptModelList.push(modelId);
      }
      
      //else if (regOtherGptModel.test(modelId)) {
      //  otherGptModelList.push(modelId);
      //} else {
      //  otherModelList.push(modelId);
      //}
    }

    list = gptModelList;
  } catch (error) {
    console.log(error?.error?.message || error);
  }
  return list;
}
*/

// module exports
module.exports = {
  exec,
  getModelList,
};
