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

// tesseract path
const tesseractPath = fileModule.getRootPath('src', 'data', 'tesseract');

// image path
const imagePath = fileModule.getRootPath('src', 'data', 'img');

// google vision
async function googleVision(imagePath) {
    try {
        const path = fileModule.getUserDataPath('setting', 'google-credential.json');
        if (!fileModule.exists(path)) {
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
        dialogModule.showNotification('無法辨識圖片文字: ' + error);
    }
}

// tesseract ocr
async function tesseractOCR(imageBuffer) {
    try {
        const config = configModule.getConfig();
        const worker = await createWorker({
            langPath: tesseractPath,
            cacheMethod: 'none',
            gzip: false,
        });

        // load language
        if (config.translation.from === engineModule.languageEnum.ja) {
            await worker.loadLanguage('jpn');
            await worker.initialize('jpn');
        } else if (config.translation.from === engineModule.languageEnum.en) {
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
        }

        // recognize text
        const {
            data: { text },
        } = await worker.recognize(imageBuffer);

        // fix or error
        if (text.trim().length > 0) {
            fixImageText(text);
        } else {
            dialogModule.showNotification('無法擷取文字，請重新擷取或更換辨識模式');
        }

        // terminate worker
        await worker.terminate();
    } catch (error) {
        console.log(error);
        dialogModule.showNotification('無法辨識圖片文字: ' + error);
    }
}

// fix image text
function fixImageText(text) {
    console.log(text);

    // get config
    const config = configModule.getConfig();

    // fix new line
    text = text.replaceAll('\n\n', '\n');

    // fix jp
    if (config.translation.from === engineModule.languageEnum.ja) {
        text = text
            .replaceAll(' ', '')
            .replaceAll('...', '…')
            .replaceAll('..', '…')
            .replaceAll('･･･', '…')
            .replaceAll('･･', '…')
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
    if (config.captureWindow.type !== 'google') {
        text = text
            .replaceAll('`', '「')
            .replaceAll('ガンプレイカー', 'ガンブレイカー')
            .replaceAll('ガンプブレイカー', 'ガンブレイカー')
            .replaceAll(/間の(?=使徒|戦士|巫女|世界)/gi, '闇の')
            .replaceAll(/(?<=機工|飛空|整備|道|戦|闘|兵)(填|土)/gi, '士');
    }

    // show notification
    dialogModule.showNotification('辨識完成');

    // return if edit is true
    if (config.captureWindow.edit) {
        windowModule.restartWindow('capture-edit', text);
        return;
    }

    // translate image text
    translateImageText(text);
}

// translate image text
async function translateImageText(text) {
    const config = configModule.getConfig();

    // set string array
    let stringArray = [];
    if (config.captureWindow.split) {
        stringArray = text.split('\n');
    } else {
        if (config.translation.from === engineModule.languageEnum.ja) {
            stringArray = [text.replaceAll('\n', '')];
        } else {
            stringArray = [text.replaceAll('\n', ' ').replaceAll('  ', ' ')];
        }
    }

    // delete images
    deleteImages();

    // start translate
    for (let index = 0; index < stringArray.length; index++) {
        const element = stringArray[index];
        if (element !== '') {
            const dialogData = {
                code: '003D',
                name: '',
                text: element,
                translation: config.translation,
            };

            await engineModule.sleep(100);
            addTask(dialogData);
        }
    }
}

// delete images
function deleteImages() {
    fileModule.readdir(imagePath).forEach((fileName) => {
        if (fileName.includes('png')) {
            fileModule.unlink(fileModule.getPath(imagePath, fileName));
        }
    });
}

module.exports = {
    googleVision,
    tesseractOCR,
    translateImageText,
};
