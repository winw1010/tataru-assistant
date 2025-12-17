'use strict';

// https://ai.google.dev/api/generate-content#v1beta.GenerationConfig

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

const safetySettings = [
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_NONE',
  },
];

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
  const model = config.api.geminiModel;
  const apiKey = config.api.geminiApiKey;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const headers = {
    'x-goog-api-key': apiKey,
    'Content-Type': 'application/json',
  };

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, prompt, config);

  const payload = {
    systemInstruction: {
      parts: [{ text: prompt }],
    },
    contents: [
      ...chatHistoryList[prompt],
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({
              text: text,
              glossary: glossary,
            }),
          },
        ],
      },
    ],
    generationConfig: {
      //stopSequences: ['Title'],
      //temperature: parseFloat(config.ai.temperature),
      //maxOutputTokens: 800,
      //topP: 0.8,
      //topK: 10,
    },
  };

  payload.safetySettings = safetySettings;

  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = response.data.candidates[0].content.parts[0].text.replace(/\r|\n/g, '');

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
  console.log('Glossary:', glossary);
  console.log('Response Text:', responseText);

  return responseText;
}

// module exports
module.exports = {
  exec,
};
