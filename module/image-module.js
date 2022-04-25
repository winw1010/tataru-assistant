'use strict';

// fs
const { unlinkSync } = require('fs');

// path
const { resolve } = require('path');

// communicate with main
const { ipcRenderer } = require('electron');

// axios
const axios = require('axios').default;

// take desktop screenshot
const screenshot = require('screenshot-desktop');

// jimp
const Jimp = require('jimp');

// get prominent color
const { prominent } = require('color.js');

// tesseract
const { createWorker } = require('tesseract.js');

// take screenshot
async function takeScreenshot(rectangleSize, displayBounds, displayIndex) {
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
        ipcRenderer.send('send-preload', 'show-notification', '無法擷取螢幕畫面');
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
        console.log(prominentColor);

        // check prominent color
        if (prominentColor[0][0] >= 128) {
            // light background
            console.log('light');

            /*
            croppedImage
                .invert()
                //.contrast(0.5)
                .threshold({ max: 128, replace: 255 })
                .invert();
            */
        } else {
            // dark background
            console.log('dark');

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
        ipcRenderer.send('send-preload', 'show-notification', '圖片辨識中');

        const config = ipcRenderer.sendSync('load-config');

        // set worker
        const worker = createWorker({
            langPath: getPath(config.captureWindow.type),
            cacheMethod: 'none',
            gzip: false
        });

        // load worker
        await worker.load();

        // load language
        if (config.translation.from === 'japanese') {
            await worker.loadLanguage('jpn');
            await worker.initialize('jpn');
        } else if (config.translation.from === 'english') {
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
            console.log('Empty text');
            ipcRenderer.send('send-preload', 'show-notification', '無法擷取文字');
        }
    } catch (error) {
        console.log(error);
    }
}

function translate(text) {
    const config = ipcRenderer.sendSync('load-config');

    // fix
    text = text
        .replace(/ /g, '')
        .replace(/`/g, '「')
        .replace(/道填/g, '道士')
        .replace(/機工填/g, '機工士');

    // return if need to edit
    if (config.captureWindow.edit) {
        ipcRenderer.send('create-window', 'capture_edit', text);
        return;
    }

    // set array
    let array = [];
    if (config.captureWindow.split) {
        array = text.split('\n');
    } else {
        array = [text.replace(/\n/g, ' ')];
    }

    // delete images
    deleteImages();

    // start translate
    const timestamp = new Date().getTime();
    for (let index = 0; index < array.length; index++) {
        if (array[index] !== '') {
            const data = {
                id: 'id' + (timestamp + index),
                code: '003D',
                playerName: '',
                name: '',
                text: array[index],
                timestamp: (timestamp + index)
            }

            setTimeout(() => { post(data); }, index * 200);
        }
    }
}

// get path
function getPath(file) {
    return resolve(process.cwd(), 'trained_data', file);
}

// delete images
function deleteImages() {
    try {
        unlinkSync(getPath('screenshot.png'));
    } catch (error) {
        console.log(error);
    }

    try {
        unlinkSync(getPath('crop.png'));
    } catch (error) {
        console.log(error);
    }

    try {
        unlinkSync(getPath('result.png'));
    } catch (error) {
        console.log(error);
    }
}

// post
function post(data) {
    const config = ipcRenderer.sendSync('load-config');
    const host = config.server.host;
    const port = config.server.port;

    axios({
            method: 'post',
            url: `http://${host}:${port}`,
            data: data
        })
        .then(function(response) {
            console.log(response);
        })
        .catch(function(error) {
            console.log(error);
        });
}

exports.takeScreenshot = takeScreenshot;