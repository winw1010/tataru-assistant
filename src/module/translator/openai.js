'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

const escapeCharacter = /[\r\n\t]/g;
const escapeCharacter2 = /[\\'"]/g;

// exec
async function exec(option) {
  const response = translate(option.name, option.text, option.source, option.target, option.table);
  return response;
}

// translate
async function translate(name = '', text = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslationPrompt(source, target, table.length > 0);
  const historyIndex = 'LLM_' + prompt;
  const glossary = aiFunction.createGlossary(source, target, table);
  const sample = aiFunction.getTranslationSample(source, target);
  const apiUrl = config.api.llmApiUrl;
  const headers = JSON.parse(config.api.llmApiHeader);

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, historyIndex, config);
  const contentHistory = getContentHistory(chatHistoryList[historyIndex]);

  const userSample = processEscapeCharacter(
    JSON.stringify({
      name: sample.name[0],
      text: sample.text[0],
      glossary: sample.glossary,
    }),
  );

  const assistantSample = processEscapeCharacter(
    JSON.stringify({
      name: sample.name[1],
      text: sample.text[1],
    }),
  );

  const userContent = processEscapeCharacter(
    JSON.stringify({
      name: name,
      text: text,
      glossary: glossary,
    }),
  );

  const payload = JSON.parse(
    config.api.llmApiPayload
      .replace('${prompt}', prompt)
      .replace('${user-content-sample}', userSample)
      .replace('${assistant-content-sample}', assistantSample)
      .replace('{},', contentHistory)
      .replace('${user-content}', userContent),
  );

  // get response
  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = getAssistantText(response.data, config.api.llmApiResponseLocation);
  const responseObject = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;

  // push history
  try {
    if (config.ai.useChat) {
      const userHistory = JSON.parse(
        config.api.llmApiUserFormat.replace(
          '${user-content}',
          processEscapeCharacter(
            JSON.stringify({
              name: name,
              text: text,
              glossary: glossary,
            }),
          ),
        ),
      );

      const assistantHistory = JSON.parse(
        config.api.llmApiAssistantFormat.replace(
          '${assistant-content}',
          processEscapeCharacter(
            JSON.stringify({
              name: responseObject.name,
              text: responseObject.text,
            }),
          ),
        ),
      );

      chatHistoryList[historyIndex].push(userHistory, assistantHistory);
    }
  } catch (error) {
    error;
  }

  // log
  console.log('Prompt:', prompt);
  console.log('Glossary:', glossary);
  console.log('Response Data:', response.data);
  console.log('Response Text:', responseText);

  return responseText;
}

// processEscapeCharacter
function processEscapeCharacter(text = '') {
  return text.replaceAll(escapeCharacter, '').replaceAll(escapeCharacter2, '\\$&');
}

// get assistant text
function getAssistantText(responseData = null, responseLocation = '') {
  if (responseData && responseLocation) {
    const array = responseLocation.split('.');
    let value = '';

    for (let index = 0; index < array.length; index++) {
      if (index === 0) {
        value = responseData[array[index]];
      } else {
        value = value[array[index]];
      }
    }

    return value;
  } else {
    return '';
  }
}

// get content history
function getContentHistory(array) {
  let historyString = '';
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    historyString += JSON.stringify(element) + ',';
  }
  return historyString;
}

// module exports
module.exports = {
  exec,
};
