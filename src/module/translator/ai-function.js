'use strict';

/*
// old prompts
'I want you to act as an expert translator.'
`You will be provided with a ${type} in ${source}, and your task is to translate it into ${target}. Your response should not be in ${source}.`
`Translate the following text from ${source} to ${target} and do not include any explanation.`
`You are a professional translation machine, your job is to translate the ${source} name and sentence provided by the user into ${target} and do not include any explanation. Use homophonic translation if it is not a word or phrase in ${source}.`
`Translate the following ${type} from ${source} into ${target} and do not include any explanation.`;
`Translate ${source} ${type} provided by user into ${target} and do not make any explanation.`;
`Translate ${source} text into ${target} and don't make any explanations.`;

const role = source && target ? `${source}-${target} translator` : 'translator';
`Act as a professional ${role}, your job is translating everything what user provided.`
*/

const configModule = require('../system/config-module');

function createTranslationPrompt(source = 'Japanese', target = 'Chinese', type = 'sentence') {
  const customPrompt = configModule.getConfig().ai.customTranslationPrompt?.trim();

  if (customPrompt) {
    if (source === '') {
      source = 'any languages';
    }

    return customPrompt.replaceAll('${source}', source).replaceAll('${target}', target).replaceAll('${type}', type);
  } else {
    return `Translate ${source} text into ${target}, and don't provide any explanations.`;
  }
}

function createImagePrompt() {
  return `Copy the text from the image, and don't provide any explanations.`;
}

// initialize chat history
function initializeChatHistory(chatHistoryList = {}, prompt = '', config = {}) {
  const chatLength = parseInt(config.ai.useChat ? config.ai.chatLength : '0');

  if (!Array.isArray(chatHistoryList[prompt])) {
    chatHistoryList[prompt] = [];
  }

  while (chatHistoryList[prompt].length > chatLength * 2) {
    chatHistoryList[prompt].shift();
    chatHistoryList[prompt].shift();
  }
}

module.exports = {
  createTranslationPrompt,
  createImagePrompt,
  initializeChatHistory,
};
