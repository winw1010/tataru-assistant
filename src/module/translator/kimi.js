'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

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
  const apiUrl = 'https://api.moonshot.cn/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.kimiToken}`,
  };

  // initialize chat history
  if (!chatHistoryList[prompt]) {
    chatHistoryList[prompt] = [];
  }

  const payload = {
    model: 'moonshot-v1-8k',
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
    pushChatHistory(prompt, text, responseText, config.ai.chatLength);
  }

  // log
  console.log('Total Tokens:', totalTokens);
  console.log('Prompt:', prompt);

  return responseText;
}

// psuh chat history
function pushChatHistory(prompt, text, responseText, chatLength = 0) {
  chatLength = parseInt(chatLength);

  if (chatLength <= 0) return;

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

  while (chatHistoryList[prompt].length > chatLength * 2) {
    chatHistoryList[prompt].shift();
  }
}

// module exports
module.exports = {
  exec,
};
