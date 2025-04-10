'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

const safetySettings = [
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_NONE',
  },
];

// exec
async function exec(option, type) {
  const response = translate(option.text, option.from, option.to, type);
  return response;
}

// translate
async function translate(text, source, target, type) {
  const config = configModule.getConfig();
  const model = config.api.geminiModel;
  const apiKey = config.api.geminiApiKey;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  const prompt = aiFunction.createTranslatePrompt(source, target, type);

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, prompt, config);

  const payload = {
    contents: [
      ...chatHistoryList[prompt],
      {
        role: 'user',
        parts: [{ text: text }],
      },
    ],
    systemInstruction: {
      parts: [{ text: prompt }],
    },
  };

  payload.safetySettings = safetySettings;

  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = response.data.candidates[0].content.parts[0].text.replace(/\r|\n/g, '');

  // push history
  if (config.ai.useChat && type !== 'name') {
    chatHistoryList[prompt].push(
      {
        role: 'user',
        parts: [{ text: text }],
      },
      {
        role: 'model',
        parts: [{ text: responseText }],
      }
    );
  }

  console.log('Prompt:', prompt);

  return responseText;
}

// module exports
module.exports = {
  exec,
};
