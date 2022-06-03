'use strict';

// fs
const { unlinkSync } = require('fs');

// path
const { resolve } = require('path');

// communicate with main
const { ipcRenderer } = require('electron');

// take desktop screenshot
const screenshot = require('screenshot-desktop');

// jimp
const Jimp = require('jimp');

// get prominent color
const { prominent } = require('color.js');

// tesseract
const { createWorker } = require('tesseract.js');

// language table
const { languageTable } = require('./translator/language-table');

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

        // fix image
        cropImage(rectangleSize, displayBounds, imagePath);
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面');
    }
}

// crop image
async function cropImage(rectangleSize, displayBounds, imagePath) {
    try {
        const croppedImage = (await Jimp.read(imagePath))
            .resize(displayBounds.width, displayBounds.height)
            .crop(rectangleSize.x, rectangleSize.y, rectangleSize.width, rectangleSize.height)
            .scale(2)
            .greyscale()
            .contrast(0.3)

        // save cropped image
        if (croppedImage.getWidth() > 700) {
            croppedImage.resize(700, Jimp.AUTO);
        } else if (croppedImage.getHeight() > 700) {
            croppedImage.resize(Jimp.AUTO, 700);
        }

        croppedImage.write(getPath('crop.png'), (err, value) => {
            fixImage(value);
        });
    } catch (error) {
        console.log(error);
    }
}

// image process
async function fixImage(croppedImage) {
    try {
        // get prominent color
        const prominentColor = await prominent(getPath('crop.png'), { amount: 2 });
        console.log('prominent color:', prominentColor);

        // check prominent color
        if (prominentColor[0][0] >= 128) {
            // light background
            console.log('light background');

            /*
            croppedImage
                .invert()
                //.contrast(0.5)
                .threshold({ max: 128, replace: 255 })
                .invert();
            */
        } else {
            // dark background
            console.log('dark background');

            if (prominentColor[1][0] > 230) {
                // dark text
                console.log('dark text');

                croppedImage.invert();
            } else {
                // light text
                console.log('light text');

                croppedImage.invert(); //.contrast(0.7).threshold({ max: 128, replace: 255 }).invert();
            }
        }

        // save result
        croppedImage.write(getPath('result.png'));

        // recognize image
        recognizeImage(await croppedImage.getBufferAsync(Jimp.MIME_PNG));
    } catch (error) {
        console.log(error);
    }
}

// recognize image text
async function recognizeImage(file) {
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
        const { data: { text } } = await worker.recognize(file);

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