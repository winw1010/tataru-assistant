'use strict';

const configModule = require('../system/config-module');

const chatHistoryList = {};

// llm json filter
const llmJsonFilter = /(?<target>{.+})/is; // /(?<target>{[^{}]*"text"\s*:\s*"[^"]*"[^{}]*})/is;

function createTranslationPrompt(source = 'Japanese', target = 'Chinese') {
  const config = configModule.getConfig();
  const useCustomPrompt = config.ai.useCustomTranslationPrompt;
  const customPrompt = config.ai.customTranslationPrompt?.trim();

  if (useCustomPrompt && customPrompt) {
    return customPrompt.replaceAll('${source}', source).replaceAll('${target}', target).replaceAll('  ', ' ');
  } else if (target === '繁體中文') {
    // 繁體中文
    return `請扮演Final Fantasy XIV翻譯器，你的任務是將使用者提供的JSON物件的'name'欄位和'text'欄位翻譯成${target}，並使用'glossary'欄位的詞彙表。請僅輸出翻譯後的有效JSON物件，保留原有的鍵值（Keys），不要輸出任何額外的解釋、問候語或Markdown程式碼區塊。`;
  } else if (target === '简体中文') {
    // 简体中文
    return `请扮演Final Fantasy XIV翻译器，你的任务是将用户提供的JSON对象的'name'字段和'text'字段翻译成${target}，并使用'glossary'字段的词汇表。请仅输出翻译后的有效JSON对象，保留原有的键（Keys），不要输出任何额外的解释、问候语或 Markdown 代码块。`;
  } else {
    // other languages
    return `Act as a Final Fantasy XIV translator. Your task is to translate the 'name' and 'text' fields of the user-provided JSON object into ${target}, using the glossary provided in the 'glossary' field. Output ONLY the translated, valid JSON object, preserving the original keys. Do not output any additional explanations, greetings, or Markdown code blocks.`;
    // return `Translate the ${source} JSON object into ${target} and return translated JSON object without any explanation${withGlossaryText}. Response object format: {"name":"(translated name)","text":"(translated text)"}`.replaceAll('  ', ' ');
  }
}

function createImagePrompt(language = 'Japanese') {
  return `Copy and return the raw ${language} text from this image.`.replaceAll('  ', ' ');
  //return `Extract all the text from this image and put it in a bulleted list.`;
  //return `Extract all the ${language} text from this image and return it.`;
  //return `Copy the text from the image, and don't provide any explanations.`;
}

// get chat history
function getChatHistory(index = '') {
  const config = configModule.getConfig();
  const chatLength = parseInt(config.ai.useChat ? config.ai.chatLength : '0');

  if (!Array.isArray(chatHistoryList[index])) {
    chatHistoryList[index] = [];
  }

  while (chatHistoryList[index].length > chatLength) {
    chatHistoryList[index].shift();
  }

  return chatHistoryList[index];
}

// add chat history
function addChatHistory(index = '', name = '', text = '', glossary = [], responseText = '') {
  if (!Array.isArray(chatHistoryList[index])) {
    chatHistoryList[index] = [];
  }

  chatHistoryList[index].push({
    name,
    text,
    glossary,
    responseText,
  });
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

// get json text
function getJsonText(text = '') {
  const json = llmJsonFilter.exec(text)?.groups?.target;

  if (json) {
    return json;
  } else {
    return JSON.stringify({ name: 'Incorrect Format', text: text + '' });
  }
}

/*
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
    Arabic: 'تاتارو',
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
    Arabic: '!مرحباً',
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
*/

/*
function setRequestTimeout() {
  setTimeout(() => {
    throw 'Request Timeout';
  }, 15000);
}
*/

module.exports = {
  createTranslationPrompt,
  createImagePrompt,
  getChatHistory,
  addChatHistory,
  createGlossary,
  getJsonText,
  //getTranslationSample,
  //setRequestTimeout,
};
