'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

// exec
async function exec(option) {
  const response = translate(option.name, option.text, option.source, option.target, option.table);
  return response;
}

// translate
async function translate(name = '', text = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslationPrompt(source, target, table.length > 0);
  const historyIndex = 'Cohere_' + prompt;
  const glossary = aiFunction.createGlossary(source, target, table);
  const sample = aiFunction.getTranslationSample(source, target);
  const apiUrl = 'https://api.cohere.com/v2/chat';
  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: 'bearer ' + config.api.cohereToken,
  };

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, historyIndex, config);

  // sample array
  const sampleArray = [];
  if (sample) {
    sampleArray.push(
      {
        role: 'user',
        content: JSON.stringify({
          name: sample.name[0],
          text: sample.text[0],
          glossary: sample.glossary,
        }),
      },
      {
        role: 'assistant',
        content: JSON.stringify({
          name: sample.name[1],
          text: sample.text[1],
        }),
      },
    );
  }

  const payload = {
    model: config.api.cohereModel,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      ...sampleArray,
      ...chatHistoryList[historyIndex],
      {
        role: 'user',
        content: JSON.stringify({
          name: name,
          text: text,
          glossary: glossary,
        }),
      },
    ],
  };

  // get response
  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = getResponseText(response.data);
  const totalTokens = response?.data?.usage?.tokens;

  // push history
  if (config.ai.useChat) {
    chatHistoryList[historyIndex].push(
      {
        role: 'user',
        content: JSON.stringify({
          name: name,
          text: text,
          glossary: glossary,
        }),
      },
      {
        role: 'assistant',
        content: typeof responseText === 'string' ? responseText : JSON.stringify(responseText),
      },
    );
  }

  console.log('Tokens:', totalTokens);
  console.log('Prompt:', prompt);
  console.log('Glossary:', glossary);
  console.log('Response Text:', responseText);

  return responseText;
}

// get image text
async function getImageText(imageBase64 = '', language = 'Japanese') {
  if (imageBase64 === '') {
    return '';
  }

  try {
    const config = configModule.getConfig();
    const prompt = aiFunction.createImagePrompt(language);
    const model = config.api.geminiModel;
    const apiUrl = 'https://api.cohere.ai/v2/chat';
    const headers = {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'bearer ' + config.api.cohereToken,
    };

    const payload = {
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    };

    const response = await requestModule.post(apiUrl, payload, headers);
    const responseText = getResponseText(response.data);
    return responseText;
  } catch (error) {
    return '' + error;
  }
}

// get response text
function getResponseText(data) {
  return data.message.content[0].text;
}

// module exports
module.exports = {
  exec,
  getImageText,
};
