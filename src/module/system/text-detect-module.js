'use strict';

// tesseract
const { createWorker } = require('tesseract.js');

// google vision
const vision = require('@google-cloud/vision');

// config module
const configModule = require('./config-module');

// dialog module
const dialogModule = require('./dialog-module');

// file module
const fileModule = require('./file-module');

// window module
const windowModule = require('./window-module');

// engine module
const engineModule = require('./engine-module');

// fix entry
const { addTask } = require('../fix/fix-entry');

// gpt module
const gptModule = require('../translator/gpt');

// image dir
const imageDir = fileModule.getRootPath('src', 'data', 'img');

// start reconizing
async function startReconizing(captureData) {
  captureData.text = '';

  // gpt vision
  if (captureData.type === 'gpt-vision') {
    const imageBase64 = fileModule.read(captureData.imagePath, 'image');
    captureData.text = await gptModule.getImageText(imageBase64);
  }
  // google vision
  else if (captureData.type === 'google-vision') {
    captureData.text = await googleVision(captureData);
  }
  // tesseract ocr
  else {
    captureData.text = await tesseractOCR(captureData);
  }

  // check text length
  if (captureData.text === '') {
    return;
  }

  // fix text
  captureData.text = fixText(captureData);

  // open edit window if edit is true
  if (captureData.edit) {
    windowModule.restartWindow('capture-edit', captureData);
    return;
  }

  // translate image text
  translateImageText(captureData);
}

// google vision
async function googleVision(captureData) {
  let text = '';

  try {
    const keyPath = fileModule.getUserDataPath('config', 'google-credential.json');
    const client = new vision.ImageAnnotatorClient({
      keyFilename: keyPath,
    });
    const [result] = await client.textDetection(captureData.imagePath);
    const detections = result.textAnnotations[0];

    if (detections?.description) {
      text = detections.description;
    } else {
      throw result.error;
    }
  } catch (error) {
    console.log(error);
    dialogModule.addNotification(error);
  }

  return text;
}

// tesseract ocr
async function tesseractOCR(captureData) {
  let text = '';

  try {
    // set worker
    let worker = null;
    if (captureData.from === engineModule.languageEnum.ja) {
      worker = await createWorker(['jpn', 'jpn_vert']);
    } /*else if (config.translation.from === engineModule.languageEnum.en)*/ else {
      worker = await createWorker('eng');
    }

    // recognize text
    const ret = await worker.recognize(captureData.imagePath);

    // fix or show error
    text = ret.data.text;

    // terminate worker
    await worker.terminate();
  } catch (error) {
    console.log(error);
    dialogModule.addNotification(error);
  }

  return text;
}

// fix image text
function fixText(captureData) {
  let text = '';
  text = captureData.text;

  console.log(text);

  // fix new line
  text = text.replaceAll('\n\n', '\n');

  // fix jp
  if (captureData.from === engineModule.languageEnum.ja) {
    text = text
      .replaceAll(' ', '')
      .replaceAll('...', '…')
      .replaceAll('..', '…')
      .replaceAll('･･･', '…')
      .replaceAll('･･', '…')
      .replaceAll('･', '・')
      .replaceAll('・・・', '…')
      .replaceAll('・・', '…')
      .replaceAll('､', '、')
      .replaceAll('?', '？')
      .replaceAll('!', '！')
      .replaceAll('~', '～')
      .replaceAll(':', '：')
      .replaceAll('=', '＝')
      .replaceAll('『', '「')
      .replaceAll('』', '」');
  }

  // fix tesseract
  if (captureData.type !== 'google-vision') {
    text = text
      .replaceAll('`', '「')
      .replaceAll(/(?<![ァ-ヺー])・(?![ァ-ヺー])/gi, '、')
      .replaceAll('ガンプレイカー', 'ガンブレイカー')
      .replaceAll('ガンプブレイカー', 'ガンブレイカー')
      .replaceAll(/間の(?=使徒|戦士|巫女|世界)/gi, '闇の')
      .replaceAll(/(?<=機工|飛空|整備|道|戦|闘|兵)(填|土)/gi, '士')
      .replaceAll(/倫成/gi, '賛成');
  }

  // add notification
  dialogModule.addNotification('RECOGNITION_COMPLETED');

  return text;
}

// translate image text
async function translateImageText(captureData) {
  // set translation
  const translation = configModule.getConfig().translation;
  translation.from = captureData.from;

  // set text array
  const textArray = [];

  if (captureData.split) {
    textArray.concat(captureData.text.split(/[\r\n]/));
  } else {
    if (captureData.from === engineModule.languageEnum.ja) {
      textArray.push(captureData.text.replace(/[\r\n]/g, ''));
    } else {
      textArray.push(captureData.text.replace(/[\r\n]/g, ' ').replaceAll('  ', ' '));
    }
  }

  // delete images
  deleteImages();

  // start translation
  for (let index = 0; index < textArray.length; index++) {
    const text = textArray[index];

    if (text === '') continue;

    const dialogData = {
      code: '003D',
      name: '',
      text: text,
      translation,
    };

    await engineModule.sleep(100);
    addTask(dialogData);
  }
}

// delete images
function deleteImages() {
  fileModule.readdir(imageDir).forEach((fileName) => {
    if (fileName.includes('.png')) {
      fileModule.unlink(fileModule.getPath(imageDir, fileName));
    }
  });
}

module.exports = {
  startReconizing,
  translateImageText,
};
