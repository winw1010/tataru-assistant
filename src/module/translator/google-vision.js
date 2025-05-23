'use strict';

const googleVision = require('@google-cloud/vision');

const configModule = require('../system/config-module');

const fileModule = require('../system/file-module');

const requestModule = require('../system/request-module');

async function textDetection(path = '') {
  const config = configModule.getConfig();

  if (config.api.googleVisionType === 'google-api-key') {
    // API Key
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
  } else {
    // JSON
    const keyFilename = fileModule.getUserDataPath('config', 'google-vision-credential.json');
    console.log(keyFilename);
    const client = new googleVision.ImageAnnotatorClient({ keyFilename: keyFilename });
    const [result] = await client.textDetection(path);
    const detections = result.textAnnotations[0];
    return detections.description;
  }
}

module.exports = {
  textDetection,
};
