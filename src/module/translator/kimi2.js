'use strict';

const requestModule = require('../system/request-module');

const { createTranslatePrompt } = require('./ai-function');

const configModule = require('../system/config-module');

const maxTokens = 4096;

const maxHistory = 10 * 2 + 1; // 5 pairs of user and assistant, plus the initial prompt

const promptHistoryMgr = {
  soruce: '',
  target: '',
  promptContent: '',
  promptHistory: [],

  addUser: function (promptContent) {
    this.promptHistory.push({ role: 'user', content: promptContent });
    if (this.promptHistory.length > maxHistory) {
      this.promptHistory.splice(1, 1);
    }
  },

  addAssistant: function (promptResponse) {
    this.promptHistory.push(promptResponse);
    if (this.promptHistory.length > maxHistory) {
      this.promptHistory.splice(1, 1);
    }
  },

  get: function () {
    return this.promptHistory;
  },

  reset: function (kimiCustomPrompt, source, target, type) {
    this.source = source;
    this.target = target;
    this.promptContent = kimiCustomPrompt;
    this.promptHistory = [{ role: 'system', content: createTranslatePrompt(source, target, type, kimiCustomPrompt) }];
  },

  shouldReset: function (source, target, promptContent) {
    return source !== this.source || target !== this.target || this.promptContent !== promptContent;
  },
};

// translate
async function exec(option, type) {
  const response = translate(option.text, option.from, option.to, type);
  return response;
}

async function translate(sentence, source, target, type) {
  const config = configModule.getConfig();
  // const prompt = createPrompt(source, target, table, type);
  if (promptHistoryMgr.shouldReset(source, target, config.api.kimiCustomPrompt)) {
    promptHistoryMgr.reset(config.api.kimiCustomPrompt, source, target, type);
  }

  promptHistoryMgr.addUser(sentence);

  const response = await requestModule.post(
    'https://api.moonshot.cn/v1/chat/completions',
    {
      messages: promptHistoryMgr.get(),
      model: 'moonshot-v1-8k',
      maxTokens: maxTokens,
      temperature: 0.3,
    },
    {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + config.api.kimiToken,
    }
  );

  const respContent = response?.data?.choices[0]?.message;
  if (respContent) {
    promptHistoryMgr.addAssistant(respContent);
  }

  return response?.data?.choices[0]?.message?.content;
}

// module exports
module.exports = {
  exec,
};
