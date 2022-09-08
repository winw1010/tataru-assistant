'use strict';

// google vision
const vision = require('@google-cloud/vision');

// fs
const { unlinkSync } = require('fs');

// file module
const fm = require('../main_modules/file-module');

// sharp
const sharp = require('sharp');
sharp.cache(false);

// communicate with main
const { ipcRenderer } = require('electron');

// take desktop screenshot
const screenshot = require('screenshot-desktop');

// tesseract
const { createWorker } = require('tesseract.js');

// language table
const { languageEnum } = require('./engine-module');

// temp image path
const tempImagePath = fm.getRootPath('src', 'trained_data');

// contrast values
const contrastThreshold = 160; //128
const contrast = 100; //76.5
const fator = ((255 + contrast) * 350) / (255 * (350 - contrast));

// take screenshot
async function takeScreenshot(rectangleSize, displayBounds, displayIndex) {
    ipcRenderer.send('send-index', 'show-notification', '正在擷取螢幕畫面');
    console.log('rectangle size:', rectangleSize);

    try {
        // get displays
        const displays = await screenshot.listDisplays();

        // declare image path
        let imagePath = '';

        // take screenshot
        try {
            imagePath = await screenshot({
                screen: displays[displayIndex].id,
                filename: getPath('screenshot.png'),
                format: 'png',
            });
        } catch (error) {
            imagePath = await screenshot({ filename: getPath('screenshot.png'), format: 'png' });
        }

        // crop image
        cropImage(rectangleSize, displayBounds, imagePath);

        // restore all windows
        ipcRenderer.send('restore-all-windows');
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面 ' + error);
    }
}

// crop image
async function cropImage(rectangleSize, displayBounds, imagePath) {
    try {
        const config = ipcRenderer.sendSync('get-config');
        const scaleRate = (() => {
            if (config.captureWindow.type === 'google') {
                return 1;
            } else {
                return 650 / rectangleSize.width;
            }
        })();

        let imageBuffer = await sharp(imagePath)
            .resize({
                width: parseInt(displayBounds.width * scaleRate),
                height: parseInt(displayBounds.height * scaleRate),
            })
            .extract({
                left: parseInt(rectangleSize.x * scaleRate),
                top: parseInt(rectangleSize.y * scaleRate),
                width: parseInt(rectangleSize.width * scaleRate),
                height: parseInt(rectangleSize.height * scaleRate),
            })
            .toBuffer();

        // save crop.png
        fm.imageWriter(getPath('crop.png'), imageBuffer);

        // start reconize
        ipcRenderer.send('send-index', 'show-notification', '正在辨識圖片文字');
        if (config.captureWindow.type === 'google') {
            // google vision
            googleVision(getPath('crop.png'));
        } else {
            // fix image
            fixImage(imageBuffer);
        }
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面 ' + error);
    }
}

// google vision
async function googleVision(imagePath) {
    const client = new vision.ImageAnnotatorClient({
        keyFilename: fm.getUserDataPath('setting', 'google-credential.json'),
    });
    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations[0];

    if (detections?.description) {
        translate(detections.description);
    } else {
        ipcRenderer.send('send-index', 'show-notification', '無法辨識圖片文字 ' + result.error);
    }
}

// fix image
async function fixImage(imageBuffer) {
    try {
        // get image
        let image = sharp(imageBuffer)
            .greyscale()
            .linear(fator, (1 - fator) * contrastThreshold)
            .png({ colors: 2 })
            .sharpen({
                sigma: 2,
                m2: 1000,
            });

        // declare result image buffer
        let resultImageBuffer = null;

        // determind background color is light or dark
        const { dominant } = await image.stats();
        if (hsp(dominant) >= 16256.25) {
            // light color background
            console.log('light color background');

            // set result image buffer
            resultImageBuffer = await image /*.threshold(parseInt(dominant.r / 2))*/
                .toBuffer();
        } else {
            // dark color background
            console.log('dark color background');

            // set result image buffer
            resultImageBuffer = await image
                //.threshold(parseInt((dominant.r + 255) / 2))
                .negate({ alpha: false })
                .toBuffer();
        }

        // save result.png
        fm.imageWriter(getPath('result.png'), resultImageBuffer);

        // recognize image
        recognizeImage(resultImageBuffer);
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面 ' + error);
    }
}

// hsp
function hsp(dominant) {
    const red = dominant.r;
    const green = dominant.g;
    const blue = dominant.b;

    return 0.299 * (red * red) + 0.587 * (green * green) + 0.114 * (blue * blue);
}

// recognize image text
async function recognizeImage(imageBuffer) {
    try {
        const config = ipcRenderer.sendSync('get-config');

        // set worker
        const worker = createWorker({
            langPath: getPath(config.captureWindow.type),
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

        // try again or transtale
        if (text.trim().length !== 0) {
            translate(text);
        } else {
            throw 'Text is empty.';
        }
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法辨識圖片文字 ' + error);
    }
}

function translate(text) {
    const config = ipcRenderer.sendSync('get-config');

    // fix
    if (config.captureWindow.type !== 'google') {
        if (config.translation.from === languageEnum.ja) {
            text = text.replaceAll(' ', '');
        }

        text = text.replaceAll('`', '「').replaceAll(/(?<=機工|飛空|整備|道|兵)填/gi, '士');
    }

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

    // return if need to edit
    if (config.captureWindow.edit) {
        ipcRenderer.send('create-window', 'capture-edit', stringArray);
        return;
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

            ipcRenderer.send('start-translation', dialogData, config.translation);
        }
    }
}

// get path
function getPath(fileName) {
    return fm.getPath(tempImagePath, fileName);
}

// delete images
function deleteImages() {
    const images = ['screenshot.png', 'crop.png', 'result.png'];

    images.forEach((value) => {
        try {
            unlinkSync(getPath(value));
        } catch (error) {
            console.log(error);
        }
    });
}

// exports
module.exports = {
    takeScreenshot,
};
