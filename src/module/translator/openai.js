'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

// exec
async function exec(option, type) {
  const response = translate(option.text, option.from, option.to, option.table, type);
  return response;
}

// translate
async function translate(text = '', source = 'Japanese', target = 'Chinese', table = [], type = 'text') {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslationPrompt(source, target, type, table.length > 0);
  const glossary = aiFunction.createGlossary(source, target, table);
  const apiUrl = config.api.llmApiUrl;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.llmApiKey}`,
  };

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, prompt, config);

  const payload = {
    model: config.api.llmApiModel,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      ...chatHistoryList[prompt],
      {
        role: 'user',
        content: JSON.stringify({
          text: text,
          glossary: glossary,
        }),
      },
    ],
    temperature: parseFloat(config.ai.temperature),
    //top_p: 1,
  };

  // get response
  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = response.data.choices[0].message.content;
  const totalTokens = response?.data?.usage?.total_tokens;

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

  // log
  console.log('Total Tokens:', totalTokens);
  console.log('Prompt:', prompt);
  console.log('Glossary:', glossary);
  console.log('Response Text:', responseText);

  return responseText;
}

// module exports
module.exports = {
  exec,
};
