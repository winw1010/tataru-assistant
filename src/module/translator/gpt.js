'use strict';

const requestModule = require('../system/request-module');

const aiFunction = require('./ai-function');

const configModule = require('../system/config-module');

const chatHistoryList = {};

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
  const apiUrl = 'https://api.openai.com/v1/responses';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.gptApiKey}`,
  };

  // initialize chat history
  aiFunction.initializeChatHistory(chatHistoryList, prompt, config);

  const payload = {
    model: config.api.gptModel,
    input: [
      {
        role: 'developer',
        content: prompt,
      },
      ...chatHistoryList[prompt],
      {
        role: 'user',
        content: JSON.stringify({
          text: text,
          glossary: glossary,
        }),
      },
    ],
    //temperature: parseFloat(config.ai.temperature),
    //top_p: 1,
  };

  // get response
  const response = await requestModule.post(apiUrl, payload, headers);
  const responseText = getAssistantText(response.data);
  const totalTokens = response?.data?.usage?.total_tokens;

  // push history
  if (config.ai.useChat && type === 'text') {
    chatHistoryList[prompt].push(
      {
        role: 'user',
        content: text,
      },
      {
        role: 'assistant',
        content: responseText,
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
async function getImageText(imageBase64 = '') {
  if (imageBase64 === '') {
    return '';
  }

  try {
    const config = configModule.getConfig();
    const prompt = aiFunction.createImagePrompt();
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
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        },
      ],
    };

    const response = await requestModule.post(apiUrl, payload, headers);
    return getAssistantText(response.data);
  } catch (error) {
    console.log(error);
    return '';
  }
}

// get assistant text
function getAssistantText(data) {
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

    if (element.type === 'message' && element.role === 'assistant' && element.status === 'completed' && element.content && element.content[0]) {
      return element.content[0].text;
    }
  }

  return '';
}

// module exports
module.exports = {
  exec,
  getImageText,
};
