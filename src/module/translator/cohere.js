'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

// translate
async function exec(option, type) {
  const response = translate(option.text, option.from, option.to, type);
  return response;
}

async function translate(text, source, target, type) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslationPrompt(source, target, type);

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, prompt, config);

  const payload = {
    model: config.api.cohereModel,
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
    temperature: parseFloat(config.ai.temperature),
    //top_p: 1,
  };

  if (chatHistoryList[prompt].length > 0) {
    payload.chat_history = chatHistoryList[prompt];
  }

  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: 'bearer ' + config.api.cohereToken,
  };

  // get response
  const response = await requestModule.post('https://api.cohere.com/v2/chat', payload, headers);
  const responseText = response.data.message.content[0].text;
  const totalTokens = response?.data?.usage?.tokens;

  // push history
  if (config.ai.useChat && type !== 'name') {
    chatHistoryList[prompt].push(
      {
        role: 'user',
        content: text,
      },
      {
        role: 'assistant',
        content: responseText,
      }
    );
  }

  console.log('Tokens:', totalTokens);
  console.log('Prompt:', prompt);

  return responseText;
}

// module exports
module.exports = {
  exec,
};
