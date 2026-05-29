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
`Translate ${source} text into ${target}, and don't provide any explanations.`

const role = source && target ? `${source}-${target} translator` : 'translator';
`Act as a professional ${role}, your job is translating everything what user provided.`
*/

const configModule = require('../system/config-module');

function createTranslationPrompt(source = 'Japanese', target = 'Chinese', withGlossary = false) {
  const config = configModule.getConfig();
  const useCustomPrompt = config.ai.useCustomTranslationPrompt;
  const customPrompt = config.ai.customTranslationPrompt?.trim();
  const withGlossaryText = withGlossary ? ' with the glossary(in glossary field)' : '';

  if (useCustomPrompt && customPrompt) {
    return customPrompt.replaceAll('${source}', source).replaceAll('${target}', target);
  } else {
    return `Translate ${source} JSON object to ${target}${withGlossaryText}.`.replaceAll('  ', ' ');
  }
}

function createImagePrompt() {
  return `Copy the text from the image, and don't provide any explanations.`;
}

// initialize chat history
function initializeChatHistory(chatHistoryList = {}, index = '', config = {}) {
  const chatLength = parseInt(config.ai.useChat ? config.ai.chatLength : '0');

  if (!Array.isArray(chatHistoryList[index])) {
    chatHistoryList[index] = [];
  }

  if (chatHistoryList[index].length > chatLength * 2) {
    chatHistoryList[index].splice(0, chatHistoryList[index].length - chatLength * 2);
  }
}

// create glossary
function createGlossary(source = 'Japanese', target = 'Chinese', table = []) {
  const glossary = [];

  for (let index = 0; index < table.length; index++) {
    const glossaryElement = {};
    const tableElement = table[index];
    const tableElement0 = tableElement[0];
    const tableElement1 = tableElement[1];

    glossaryElement[source] = tableElement0;
    glossaryElement[target] = tableElement1;

    glossary.push(glossaryElement);
  }

  return glossary;
}

// get translation sample
function getTranslationSample(source = 'Japanese', target = 'Chinese') {
  const tataru = {
    Auto: 'Tataru',
    Japanese: 'タタル',
    English: 'Tataru',
    Chinese: '塔塔露',
    Korean: '타타루',
    Russian: 'Татару',
    Italian: 'Tataru',
    Portuguese: 'Tataru',
    Brazilian: 'Tataru',
  };

  const hello = {
    Auto: 'Hello!',
    Japanese: 'こんにちは！',
    English: 'Hello!',
    Chinese: '你好！',
    Korean: '안녕！',
    Russian: 'Привет!',
    Italian: 'Ciao!',
    Portuguese: 'Olá!',
    Brazilian: 'Olá!',
  };

  const sample = {
    name: [tataru[source], tataru[target]],
    text: [hello[source], hello[target]],
    glossary: [{}],
  };

  sample.glossary[0][source] = tataru[source];
  sample.glossary[0][target] = tataru[target];

  return sample;
}

module.exports = {
  createTranslationPrompt,
  createImagePrompt,
  initializeChatHistory,
  createGlossary,
  getTranslationSample,
};
