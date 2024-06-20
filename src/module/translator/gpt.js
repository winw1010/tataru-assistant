'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const regGptModel = /gpt-\d.*[^0-9]$/i;

const maxTokens = 4096;

// exec
async function exec(option, table = [], type = 'sentence') {
  const response = translate(option.text, option.from, option.to, table, type);
  return response;
}

// translate
async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = [], type = 'sentence') {
  const config = configModule.getConfig();
  const prompt = aiFunction.createPrompt(source, target, table, type);
  const apiUrl = config.api.unofficialApi
    ? config.api.unofficialApiUrl.replace(/\/$/, '') + '/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.gptApiKey}`,
  };

  const payload = {
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
    max_tokens: maxTokens,
    temperature: 0.7,
    //top_p: 1,
  };

  const response = await requestModule.post(apiUrl, payload, headers);

  console.log('prompt:', prompt);
  console.log('Total Tokens:', response?.data?.usage?.total_tokens);

  return response.data.choices[0].message.content;
}

// get image text
async function getImageText(imageBase64 = '') {
  if (imageBase64 === '') {
    return '';
  }

  try {
    const config = configModule.getConfig();
    const apiUrl = config.api.unofficialApi
      ? config.api.unofficialApiUrl.replace(/\/$/, '') + '/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.api.gptApiKey}`,
    };

    const payload = {
      model: config.api.gptModel,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: aiFunction.createImagePrompt(),
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: maxTokens,
    };

    const response = await requestModule.post(apiUrl, payload, headers);
    return response.data.choices[0].message.content;
  } catch (error) {
    return error;
  }
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
  getImageText,
  getModelList,
};
