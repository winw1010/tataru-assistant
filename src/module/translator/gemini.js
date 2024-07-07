'use strict';

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const aiFunction = require('./ai-function');

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
async function exec(option) {
  try {
    const response = translate(option.text, option.from, option.to);
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
async function translate(text = '', source = 'Japanese', target = 'Chinese') {
  if (!currentGemini) currentGemini = createAI();
  currentGemini = createAI();

  const model = currentGemini.getGenerativeModel({
    //model: 'gemini-pro',
    model: 'gemini-1.5-flash',
    safetySettings,
  });

  const response = await model.generateContent([aiFunction.createSystemContent(source, target), 'The text: ' + text]);

  return response.response.text();
}

// module exports
module.exports = {
  exec,
};
