'use strict';

const requestModule = require('../system/request-module');

const { createPrompt } = require('./ai-function');

const configModule = require('../system/config-module');

const regGptModel = /gpt-\d+(\.\d+)?(-turbo)?(-preview)?$/i;

// exec
async function exec(option, table = []) {
  const response = translate(option.text, option.from, option.to, table);
  return response;
}

// translate
async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();
  const prompt = createPrompt(source, target, table);
  const apiUrl = config.api.unofficialApi
    ? config.api.unofficialApiUrl.replace(/\/$/, '') + '/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const response = await requestModule.post(
    apiUrl,
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
    { 'Content-Type': ' application/json', Authorization: 'Bearer ' + config.api.gptApiKey }
  );

  console.log('prompt:', prompt);
  console.log('Total Tokens:', response?.data?.usage?.total_tokens);

  return response.data.choices[0].message.content;
}

// get model list
async function getModelList(apiKey = null) {
  try {
    const config = configModule.getConfig();
    const apiUrl = config.api.unofficialApi
      ? config.api.unofficialApiUrl.replace(/\/$/, '') + '/models'
      : 'https://api.openai.com/v1/models';

    const response = await requestModule.get(apiUrl, { Authorization: 'Bearer ' + apiKey });

    let list = response.data.data.map((x) => x.id);
    let gptList = [];

    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      regGptModel.lastIndex = 0;
      if (regGptModel.test(element)) {
        gptList.push(element);
      }
    }

    return gptList.sort();
  } catch (error) {
    return [];
  }
}

// module exports
module.exports = {
  exec,
  getModelList,
};
