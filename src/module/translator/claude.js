'use strict';

const { Anthropic } = require('@anthropic-ai/sdk');

// const requestModule = require('../system/request-module');

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
  const historyIndex = 'CLAUDE_' + prompt;
  const glossary = aiFunction.createGlossary(source, target, table);
  const sample = aiFunction.getTranslationSample(source, target);
  const model = config.api.claudeApiModel;
  const client = new Anthropic({ apiKey: config.api.claudeApiKey });

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

  const messages = [
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
  ];

  // get response
  const response = await client.beta.messages.create({ model: model, messages: messages });
  const responseText = getResponseText(response);

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
        content: responseText,
      },
    );
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

    const response = await client.beta.messages.create({ model: model, messages: messages });
    const responseText = getResponseText(response);
    return responseText;
  } catch (error) {
    return '' + error;
  }
}

// get response text
function getResponseText(data) {
  return data.content[0].text;
}

// module exports
module.exports = {
  exec,
  getImageText,
};
