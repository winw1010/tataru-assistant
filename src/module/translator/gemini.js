'use strict';

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const { createPrompt } = require('./ai-function');

const configModule = require('../system/config-module');

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

let currentGemini = null;

// translate
async function exec(option, table = []) {
  try {
    const response = translate(option.text, option.from, option.to, table);
    return response;
  } catch (error) {
    console.log(error);
    currentGemini = null;
    return error;
  }
}

function createOpenai() {
  const config = configModule.getConfig();
  const genAI = new GoogleGenerativeAI(config.api.geminiApiKey);
  return genAI;
}

async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = []) {
  if (!currentGemini) currentGemini = createOpenai();

  const model = currentGemini.getGenerativeModel({
    model: 'gemini-pro',
    safetySettings,
  });

  let prompt = createPrompt(source, target, table) + '\r\nThe sentence:\r\n' + sentence;
  let response = null;

  try {
    response = await model.generateContent(prompt);
    console.log('prompt', prompt);
    return response?.response?.text();
  } catch (error) {
    console.log(error);
    return error;
  }
}

// module exports
module.exports = {
  exec,
};
