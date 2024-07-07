'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const regGptModel = /gpt-\d.*[^0-9]$/i;

const maxTokens = 4096;

// exec
async function exec(option) {
  const response = translate(option.text, option.from, option.to);
  return response;
}

// translate
async function translate(text = '', source = 'Japanese', target = 'Chinese') {
  const config = configModule.getConfig();
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.gptApiKey}`,
  };

  const payload = {
    model: config.api.gptModel,
    messages: [
      {
        role: 'system',
        content: aiFunction.createSystemContent(source, target),
      },
      {
        role: 'user',
        content: 'The text: ' + text,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
    //top_p: 1,
  };

  const response = await requestModule.post(apiUrl, payload, headers);

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
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
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
    const apiUrl = 'https://api.openai.com/v1/models';
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
