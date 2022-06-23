'use strict';

// fs
const { writeFileSync, unlinkSync } = require('fs');

// sharp
const sharp = require('sharp');
sharp.cache(false);

// path
const { resolve } = require('path');

// communicate with main
const { ipcRenderer } = require('electron');

// take desktop screenshot
const screenshot = require('screenshot-desktop');

// tesseract
const { createWorker } = require('tesseract.js');

// language table
const { languageTable } = require('./translator/language-table');

// values
const contrastThreshold = 160; //128
const contrast = 100; //76.5
const fator = ((255 + contrast) * 350) / (255 * (350 - contrast));

// take screenshot
async function takeScreenshot(rectangleSize, displayBounds, displayIndex) {
    console.log('rectangle size:', rectangleSize);

    try {
        // get displays
        const displays = await screenshot.listDisplays();

        // set image path
        let imagePath = '';

        // take screenshot
        try {
            imagePath = await screenshot({ screen: displays[displayIndex].id, filename: getPath('screenshot.png'), format: 'png' });
        } catch (error) {
            imagePath = await screenshot({ filename: getPath('screenshot.png'), format: 'png' });
        }

        // crop image
        cropImage(rectangleSize, displayBounds, imagePath);
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面 ' + error);
    }
}

// crop image
async function cropImage(rectangleSize, displayBounds, imagePath) {
    try {
        const scaleRate = 650 / rectangleSize.width;
        const imageBuffer = await sharp(imagePath)
            .resize({
                width: parseInt(displayBounds.width * scaleRate),
                height: parseInt(displayBounds.height * scaleRate)
            })
            .extract({
                left: parseInt(rectangleSize.x * scaleRate),
                top: parseInt(rectangleSize.y * scaleRate),
                width: parseInt(rectangleSize.width * scaleRate),
                height: parseInt(rectangleSize.height * scaleRate)
            })
            .greyscale()
            .linear(fator, (1 - fator) * contrastThreshold)
            .sharpen({
                sigma: 2,
                m2: 200
            })
            .png({ colors: 2 })
            .toBuffer();

        // save crop.png
        writeFileSync(getPath('crop.png'), Buffer.from(imageBuffer, 'base64'));

        // fix image
        fixImage(imageBuffer);
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面 ' + error);
    }
}

// fix image
async function fixImage(imageBuffer) {
    try {
        // determind background color is light or dark
        let resultImageBuffer = null;
        const { dominant } = await sharp(imageBuffer).stats();
        if (hsp(dominant) >= 16256.25) {
            // light background
            console.log('light background');
            resultImageBuffer = await sharp(imageBuffer)
                .threshold(parseInt(dominant.r / 2))
                .toBuffer();
        } else {
            // dark background
            console.log('dark background');
            resultImageBuffer = await sharp(imageBuffer)
                .threshold(parseInt((dominant.r + 255) / 2))
                .negate({ alpha: false })
                .toBuffer();
        }

        // to base64
        resultImageBuffer = Buffer.from(resultImageBuffer, 'base64');

        // save result.png
        writeFileSync(getPath('result.png'), resultImageBuffer);

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
        ipcRenderer.send('send-index', 'show-notification', '圖片辨識中');

        const config = ipcRenderer.sendSync('get-config');

        // set worker
        const worker = createWorker({
            langPath: getPath(config.captureWindow.type),
            cacheMethod: 'none',
            gzip: false
        });

        // load worker
        await worker.load();

        // load language
        if (config.translation.from === languageTable.ja) {
            await worker.loadLanguage('jpn');
            await worker.initialize('jpn');
        } else if (config.translation.from === languageTable.en) {
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
        }

        // recognize text
        const { data: { text } } = await worker.recognize(imageBuffer);

        // terminate worker
        await worker.terminate();

        // try again or transtale
        if (text.trim().length !== 0) {
            translate(text);
        } else {
            console.log('Text is empty.');
            ipcRenderer.send('send-index', 'show-notification', '無法擷取文字');
        }
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取文字 ' + error);
    }
}

function translate(text) {
    const config = ipcRenderer.sendSync('get-config');

    // fix
    if (config.translation.from === languageTable.ja) {
        text = text.replaceAll(' ', '')
    }

    text = text
        .replaceAll('`', '「')
        .replaceAll(/(?<=機工|飛空|整備|道|兵)填/gi, '士');

    // set string array
    let stringArray = [];
    if (config.captureWindow.split) {
        stringArray = text.split('\n');
    } else {
        stringArray = [text.replaceAll('\n', ' ')];
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
                timestamp: (timestamp + index)
            }

            ipcRenderer.send('send-index', 'start-translation', dialogData, config.translation);
        }
    }
}

// get path
function getPath(file) {
    return resolve(process.cwd(), 'trained_data', file);
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

exports.takeScreenshot = takeScreenshot;