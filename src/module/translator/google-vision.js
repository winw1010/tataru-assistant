'use strict';

const configModule = require('../system/config-module');

const fileModule = require('../system/file-module');

const requestModule = require('../system/request-module');

async function textDetection(path = '') {
  const config = configModule.getConfig();
  const apiKey = config.api.googleVisionApiKey;
  const apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey;
  const header = { 'Content-Type': 'application/json' };
  const payload = {
    requests: [
      {
        image: {
          content: fileModule.read(path, 'image'),
        },
        features: [
          {
            type: 'TEXT_DETECTION',
          },
        ],
      },
    ],
  };

  const response = await requestModule.post(apiUrl, payload, header);
  return response.data.responses[0].fullTextAnnotation.text;
}

module.exports = {
  textDetection,
};
