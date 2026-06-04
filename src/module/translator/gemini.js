'use strict';

// https://ai.google.dev/api/generate-content#v1beta.GenerationConfig

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

const safetySettings = [
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
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
];

// exec
async function exec(option) {
  const response = translate(option.name, option.text, option.source, option.target, option.table);
  return response;
}

// translate
async function translate(name = '', text = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslationPrompt(source, target, table.length > 0);
  const historyIndex = 'Gemini_' + prompt;
  const glossary = aiFunction.createGlossary(source, target, table);
  const sample = aiFunction.getTranslationSample(source, target);
  const model = config.api.geminiModel;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const headers = {
    'x-goog-api-key': config.api.geminiApiKey,
    'Content-Type': 'application/json',
  };

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, historyIndex, config);

  // sample array
  const sampleArray = [];
  if (sample) {
    sampleArray.push(
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({
              name: sample.name[0],
              text: sample.text[0],
              glossary: glossary,
            }),
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: JSON.stringify({
              name: sample.name[1],
              text: sample.text[1],
            }),
          },
        ],
      },
    );
  }

  const payload = {
    systemInstruction: {
      parts: [{ text: prompt }],
    },
    contents: [
      ...sampleArray,
      ...chatHistoryList[historyIndex],
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({
              name: name,
              text: text,
              glossary: glossary,
            }),
          },
        ],
      },
    ],
  };

  payload.safetySettings = safetySettings;

  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = getResponseText(response.data);

  // push history
  if (config.ai.useChat) {
    chatHistoryList[historyIndex].push(
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({
              name: name,
              text: text,
              glossary: glossary,
            }),
          },
        ],
      },
      {
        role: 'model',
        parts: [{ text: typeof responseText === 'string' ? responseText : JSON.stringify(responseText) }],
      },
    );
  }

  console.log('Prompt:', prompt);
  console.log('Glossary:', glossary);
  console.log('Response Text:', responseText);

  return responseText;
}

// get image text
async function getImageText(imageBase64 = '', language = 'Japanese') {
  if (imageBase64 === '') {
    return '';
  }

  try {
    const config = configModule.getConfig();
    const prompt = aiFunction.createImagePrompt(language);
    const model = config.api.geminiModel;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const headers = {
      'x-goog-api-key': config.api.geminiApiKey,
      'Content-Type': 'application/json',
    };

    const payload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
    };

    const response = await requestModule.post(apiUrl, payload, headers);
    const responseText = getResponseText(response.data);
    return responseText;
  } catch (error) {
    return '' + error;
  }
}

// get response text
function getResponseText(data) {
  return data.candidates[0].content.parts[0].text;
}

// module exports
module.exports = {
  exec,
  getImageText,
};
