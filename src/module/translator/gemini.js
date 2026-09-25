'use strict';

// https://ai.google.dev/api/generate-content#v1beta.GenerationConfig

const { GoogleGenAI } = require('@google/genai');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

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
  const chatIndex = source + 'To' + target;
  const glossary = aiFunction.createGlossary(source, target, table);
  const sample = aiFunction.getTranslationSample(source, target);
  const model = config.api.geminiModel;
  const ai = new GoogleGenAI({ apiKey: config.api.geminiApiKey });

  // create chat history
  const chatHistory = createChatHistory(chatIndex, sample);

  // set payload
  const contents = [
    ...chatHistory,
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
  ];

  // set request timeout
  aiFunction.setRequestTimeout();

  // request
  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: {
      systemInstruction: {
        parts: [{ text: prompt }],
      },
      safetySettings: safetySettings,
    },
  });
  const responseText = getResponseText(response);

  if (!responseText) {
    throw 'Null Text';
  }

  // add chat history
  if (config.ai.useChat) {
    aiFunction.addChatHistory(chatIndex, name, text, glossary, responseText);
  }

  // log
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
    const ai = new GoogleGenAI({ apiKey: config.api.geminiApiKey });

    const contents = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64,
        },
      },
      { text: prompt },
    ];

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: {
          parts: [{ text: prompt }],
        },
        safetySettings: safetySettings,
      },
    });
    const responseText = getResponseText(response);
    return responseText;
  } catch (error) {
    return '' + error;
  }
}

// create chat history
function createChatHistory(historyIndex = 'default', sample = {}) {
  const array = aiFunction.getChatHistory(historyIndex);
  const chatHistory = [];

  // add sample
  if (Object.getOwnPropertyNames(sample).length > 0) {
    chatHistory.push(
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({
              name: sample.name[0],
              text: sample.text[0],
              glossary: sample.glossary,
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

  // add history
  for (let index = 0; index < array.length; index++) {
    const chat = array[index];

    chatHistory.push(
      {
        role: 'user',
        parts: [
          {
            text: JSON.stringify({
              name: chat.name,
              text: chat.text,
              glossary: chat.glossary,
            }),
          },
        ],
      },
      {
        role: 'model',
        parts: [{ text: chat.responseText }],
      },
    );
  }

  return chatHistory;
}

// get response text
function getResponseText(response) {
  return response.text;
}

// module exports
module.exports = {
  exec,
  getImageText,
};
