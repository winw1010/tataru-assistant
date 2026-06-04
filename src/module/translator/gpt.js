'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

// exec
async function exec(option) {
  const response = translate(option.name, option.text, option.source, option.target, option.table);
  return response;
}

// translate
async function translate(name = '', text = '', source = 'Japanese', target = 'Chinese', table = []) {
  const config = configModule.getConfig();
  const prompt = aiFunction.createTranslationPrompt(source, target, table.length > 0);
  const historyIndex = 'GPT_' + prompt;
  const glossary = aiFunction.createGlossary(source, target, table);
  const sample = aiFunction.getTranslationSample(source, target);
  const apiUrl = 'https://api.openai.com/v1/responses';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.gptApiKey}`,
  };

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, historyIndex, config);

  // sample array
  const sampleArray = [];
  if (sample) {
    sampleArray.push(
      {
        role: 'user',
        content: JSON.stringify({
          name: sample.name[0],
          text: sample.text[0],
          glossary: sample.glossary,
        }),
      },
      {
        role: 'assistant',
        content: JSON.stringify({
          name: sample.name[1],
          text: sample.text[1],
        }),
      },
    );
  }

  const payload = {
    model: config.api.gptModel,
    input: [
      {
        role: 'developer',
        content: prompt,
      },
      ...sampleArray,
      ...chatHistoryList[historyIndex],
      {
        role: 'user',
        content: JSON.stringify({
          name: name,
          text: text,
          glossary: glossary,
        }),
      },
    ],
  };

  // get response
  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = getResponseText(response.data);
  const totalTokens = response?.data?.usage?.total_tokens;

  // push history
  if (config.ai.useChat) {
    chatHistoryList[historyIndex].push(
      {
        role: 'user',
        content: JSON.stringify({
          name: name,
          text: text,
          glossary: glossary,
        }),
      },
      {
        role: 'assistant',
        content: typeof responseText === 'string' ? responseText : JSON.stringify(responseText),
      },
    );
  }

  // log
  console.log('Total Tokens:', totalTokens);
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
    const apiUrl = 'https://api.openai.com/v1/responses';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.api.gptApiKey}`,
    };

    const payload = {
      model: config.api.gptModel,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt,
            },
            {
              type: 'input_image',
              image_url: `data:image/png;base64,${imageBase64}`,
            },
          ],
        },
      ],
    };

    const response = await requestModule.post(apiUrl, payload, headers);
    return getResponseText(response.data);
  } catch (error) {
    return '' + error;
  }
}

// get response text
function getResponseText(data) {
  /*
  [
    { id: 'rs_0', type: 'reasoning', summary: [] },
    {
      id: 'msg_0',
      type: 'message',
      status: 'completed',
      content: [{ type: 'output_text', annotations: [], logprobs: [], text: '晚上好！' }],
      role: 'assistant',
    },
  ];
  */

  const output = data.output;

  for (let index = 0; index < output.length; index++) {
    const element = output[index];

    if (element.type === 'message' && element.status === 'completed' && element.role === 'assistant' && element.content && element.content[0]) {
      return element.content[0].text;
    }
  }

  throw 'Request Failed.';
}

// module exports
module.exports = {
  exec,
  getImageText,
};
