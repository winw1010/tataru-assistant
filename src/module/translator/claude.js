'use strict';

const { Anthropic } = require('@anthropic-ai/sdk');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

// exec
async function exec(option) {
  const response = translate(option.name, option.text, option.source, option.target, option.table);
  return response;
}

// translate
async function translate(name = '', text = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslationPrompt(source, target, table.length > 0);
  const chatIndex = source + 'To' + target;
  const glossary = aiFunction.createGlossary(source, target, table);
  const sample = aiFunction.getTranslationSample(source, target);
  const model = config.api.claudeApiModel;
  const client = new Anthropic({ apiKey: config.api.claudeApiKey });

  // create chat history
  const chatHistory = createChatHistory(chatIndex, sample);

  // set payload
  const messages = [
    {
      role: 'system',
      content: prompt,
    },
    ...chatHistory,
    {
      role: 'user',
      content: JSON.stringify({
        name: name,
        text: text,
        glossary: glossary,
      }),
    },
  ];

  // set request timeout
  aiFunction.setRequestTimeout();

  // request
  const response = await client.messages.create({ model: model, messages: messages });
  const responseText = getResponseText(response);

  // add chat history
  if (config.ai.useChat) {
    aiFunction.addChatHistory(chatIndex, name, text, glossary, responseText);
  }

  // log
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
    const model = config.api.claudeApiModel;
    const client = new Anthropic({ apiKey: config.api.claudeApiKey });

    const messages = [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ];

    const response = await client.messages.create({ model: model, messages: messages });
    const responseText = getResponseText(response);
    return responseText;
  } catch (error) {
    return '' + error;
  }
}

// create chat history
function createChatHistory(historyIndex = 'default', sample = {}) {
  const array = aiFunction.getChatHistory(historyIndex);
  const chatHistory = [];

  // add sample
  if (Object.getOwnPropertyNames(sample).length > 0) {
    chatHistory.push(
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

  // add history
  for (let index = 0; index < array.length; index++) {
    const chat = array[index];

    chatHistory.push(
      {
        role: 'user',
        content: JSON.stringify({
          name: chat.name,
          text: chat.text,
          glossary: chat.glossary,
        }),
      },
      {
        role: 'assistant',
        content: chat.responseText,
      },
    );
  }

  return chatHistory;
}

// get response text
function getResponseText(response) {
  return response.content[0].text;
}

// module exports
module.exports = {
  exec,
  getImageText,
};
