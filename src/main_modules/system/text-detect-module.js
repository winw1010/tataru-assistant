'use strict';

// tesseract
const { createWorker } = require('tesseract.js');

// google vision
const vision = require('@google-cloud/vision');

// config module
const configModule = require('./config-module');

// file module
const fileModule = require('./file-module');

// window module
const windowModule = require('./window-module');

// language enum
const { languageEnum } = require('./engine-module');

// correction-module
const { correctionEntry } = require('../correction/correction-module');

// temp image path
const tempImagePath = fileModule.getRootPath('src', 'trained_data');

// google vision
async function googleVision(imagePath) {
    try {
        const path = fileModule.getUserDataPath('setting', 'google-credential.json');
        if (!fileModule.fileChecker(path)) {
            throw '尚未設定Google憑證，請先至【設定】>【系統】取得憑證';
        }

        const client = new vision.ImageAnnotatorClient({
            keyFilename: fileModule.getUserDataPath('setting', 'google-credential.json'),
        });
        const [result] = await client.textDetection(imagePath);
        const detections = result.textAnnotations[0];

        if (detections?.description) {
            fixImageText(detections.description);
        } else {
            throw result.error;
        }
    } catch (error) {
        console.log(error);
        windowModule.sendIndex('show-notification', '無法辨識圖片文字: ' + error);
    }
}

// tesseract ocr
async function tesseractOCR(imageBuffer) {
    try {
        const config = configModule.getConfig();

        // set worker
        const worker = createWorker({
            langPath: getPath('tesseract'),
            cacheMethod: 'none',
            gzip: false,
        });

        // load worker
        await worker.load();

        // load language
        if (config.translation.from === languageEnum.ja) {
            await worker.loadLanguage('jpn');
            await worker.initialize('jpn');
        } else if (config.translation.from === languageEnum.en) {
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
        }

        // recognize text
        const {
            data: { text },
        } = await worker.recognize(imageBuffer);

        // terminate worker
        await worker.terminate();

        // fix or error
        if (text.trim().length !== 0) {
            fixImageText(text);
        } else {
            throw '擷取文字為空白，請更換辨識模式';
        }
    } catch (error) {
        console.log(error);
        windowModule.sendIndex('show-notification', '無法辨識圖片文字: ' + error);
    }
}

// fix image text
function fixImageText(text) {
    const config = configModule.getConfig();

    // fix
    if (config.captureWindow.type !== 'google') {
        if (config.translation.from === languageEnum.ja) {
            text = text.replaceAll(' ', '');
        }

        text = text
            .replaceAll('\n\n', '\n')
            .replaceAll('`', '「')
            .replaceAll(/間の(?=使徒|戦士|巫女|世界)/gi, '闇の')
            .replaceAll(/(?<=機工|飛空|整備|道|戦|闘|兵)填/gi, '士');
    }

    // return if edit is true
    if (config.captureWindow.edit) {
        windowModule.restartWindow('capture-edit', text);
        return;
    }

    // translate image text
    translateImageText(text);
}

// translate image text
function translateImageText(text) {
    const config = configModule.getConfig();

    // set string array
    let stringArray = [];
    if (config.captureWindow.split) {
        stringArray = text.split('\n');
    } else {
        if (config.translation.from === languageEnum.ja) {
            stringArray = [text.replaceAll('\n', '')];
        } else {
            stringArray = [text.replaceAll('\n', ' ')];
        }
    }

    // delete images
    deleteImages();

    // start translate
    const timestamp = new Date().getTime();
    for (let index = 0; index < stringArray.length; index++) {
        const element = stringArray[index];
        if (element !== '') {
            const dialogData = {
                id: 'id' + (timestamp + index),
                code: '003D',
                playerName: '',
                name: '',
                text: element,
                timestamp: timestamp + index,
            };

            correctionEntry(dialogData, config.translation);
        }
    }
}

// get path
function getPath(fileName) {
    return fileModule.getPath(tempImagePath, fileName);
}

// delete images
function deleteImages() {
    const images = ['screenshot.png', 'crop.jpeg'];

    images.forEach((value) => {
        try {
            fileModule.fileDeleter(getPath(value));
        } catch (error) {
            console.log(error);
        }
    });
}

module.exports = {
    googleVision,
    tesseractOCR,
    translateImageText,
};
