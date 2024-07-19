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
  const prompt = aiFunction.createTranslatePrompt(source, target, type);

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, prompt, config.ai.chatLength);

  const payload = {
    preamble: prompt,
    message: text,
    maxTokens: 4096,
    temperature: parseFloat(config.ai.temperature) / 2,
    //top_p: 1,
  };

  if (config.ai.useChat) {
    payload.chat_history = chatHistoryList[prompt];
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'bearer ' + config.api.cohereToken,
  };

  // get response
  const response = await requestModule.post('https://api.cohere.ai/v1/chat', payload, headers);
  const responseText = response.data.text;
  const totalTokens = response?.data?.meta?.tokens;

  // push history
  if (config.ai.useChat && type !== 'name') {
    chatHistoryList[prompt].push(
      {
        role: 'USER',
        message: text,
      },
      {
        role: 'CHATBOT',
        message: responseText,
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
