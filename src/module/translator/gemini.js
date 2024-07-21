'use strict';

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

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
async function exec(option, type) {
  try {
    const response = translate(option.text, option.from, option.to, type);
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
async function translate(text, source, target, type) {
  if (!currentGemini) currentGemini = createAI();
  currentGemini = createAI();

  const config = configModule.getConfig();
  const model = currentGemini.getGenerativeModel({
    //model: 'gemini-pro',
    model: 'gemini-1.5-flash',
    safetySettings,
  });

  const prompt = aiFunction.createTranslatePrompt(source, target, type);

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, prompt, config);

  const payload =
    chatHistoryList[prompt].length > 0
      ? {
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
        }
      : [prompt, text];

  // const response = await model.generateContent([prompt, text]);
  const response = await model.generateContent(payload);
  const responseText = response.response.text();

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

  return response.response.text();
}

// module exports
module.exports = {
  exec,
};
