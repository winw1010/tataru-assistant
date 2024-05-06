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

// exec
async function exec(option, table = [], type = 'sentence') {
  try {
    const response = translate(option.text, option.from, option.to, table, type);
    return response;
  } catch (error) {
    currentGemini = null;
    throw error;
  }
}

// create AI
function createAI() {
  const config = configModule.getConfig();
  const genAI = new GoogleGenerativeAI(config.api.geminiApiKey);
  return genAI;
}

// translate
async function translate(sentence = '', source = 'Japanese', target = 'Chinese', table = [], type = 'sentence') {
  if (!currentGemini) currentGemini = createAI();

  const model = currentGemini.getGenerativeModel({
    model: 'gemini-pro',
    safetySettings,
  });

  const prompt = createPrompt(source, target, table, type) + '\r\nThe sentence:\r\n' + sentence;
  const response = await model.generateContent(prompt);

  console.log('prompt', prompt);

  return response.response.text();
}

// module exports
module.exports = {
  exec,
};
