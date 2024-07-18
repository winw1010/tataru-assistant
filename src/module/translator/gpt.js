'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

const regGptModel = /gpt-\d.*[^0-9]$/i;

const maxTokens = 4096;

// exec
async function exec(option, type) {
  const response = translate(option.text, option.from, option.to, type);
  return response;
}

// translate
async function translate(text, source, target, type) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslatePrompt(source, target, type);
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.gptApiKey}`,
  };

  // initialize chat history
  if (!chatHistoryList[prompt]) {
    chatHistoryList[prompt] = [];
  }

  const payload = {
    model: config.api.gptModel,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      ...chatHistoryList[prompt],
      {
        role: 'user',
        content: text,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
    //top_p: 1,
  };

  // get response
  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = response.data.choices[0].message.content;
  const totalTokens = response?.data?.usage?.total_tokens;

  // push history
  if (config.ai.useChat && type !== 'name') {
    aiFunction.pushChatHistory(chatHistoryList[prompt], text, responseText, config.ai.chatLength);
  }

  // log
  console.log('Total Tokens:', totalTokens);
  console.log('Prompt:', prompt);

  return responseText;
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
    let modelList = [];

    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      regGptModel.lastIndex = 0;
      if (regGptModel.test(element)) {
        modelList.push(element);
      }
    }

    return modelList.sort();
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
