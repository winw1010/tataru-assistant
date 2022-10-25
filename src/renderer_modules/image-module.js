'use strict';

// electron
const { ipcRenderer } = require('electron');

// screenshot desktop
const screenshotDesktop = require('screenshot-desktop');

// sharp
const sharp = require('sharp');
sharp.cache(false);

// temp image path
const tempImagePath = ipcRenderer.sendSync('get-root-path', 'src', 'trained_data');

// contrast values
//const contrastThreshold = 160; //128
//const contrast = 100; //76.5
//const fator = ((255 + contrast) * 350) / (255 * (350 - contrast));

// take screenshot
async function takeScreenshot(rectangleSize, displayBounds, displayIndex) {
    ipcRenderer.send('send-index', 'show-notification', '正在擷取螢幕畫面');
    console.log('rectangle size:', rectangleSize);

    try {
        // get displays
        const displays = await screenshotDesktop.listDisplays();

        // declare image path
        let imagePath = '';

        // take screenshot
        try {
            imagePath = await screenshotDesktop({
                screen: displays[displayIndex].id,
                filename: getPath('screenshot.png'),
                format: 'png',
            });
        } catch (error) {
            imagePath = await screenshotDesktop({ filename: getPath('screenshot.png'), format: 'png' });
        }

        // crop image
        cropImage(rectangleSize, displayBounds, imagePath);

        // restore all windows
        ipcRenderer.send('restore-all-windows');
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面: ' + error);
    }
}

// crop image
async function cropImage(rectangleSize, displayBounds, imagePath) {
    try {
        const config = ipcRenderer.sendSync('get-config');
        const scaleRate = 1920 / displayBounds.width;

        let imageBuffer = await sharp(imagePath)
            .resize({
                width: 1920,
                height: 1080,
            })
            .extract({
                left: parseInt(rectangleSize.x * scaleRate),
                top: parseInt(rectangleSize.y * scaleRate),
                width: parseInt(rectangleSize.width * scaleRate),
                height: parseInt(rectangleSize.height * scaleRate),
            })
            .jpeg({ quality: 100 })
            .toBuffer();

        // save crop
        ipcRenderer.send('image-writer', getPath('crop.jpeg'), imageBuffer);

        // start reconize
        ipcRenderer.send('send-index', 'show-notification', '正在辨識圖片文字');
        if (config.captureWindow.type === 'google') {
            // google vision
            ipcRenderer.send('google-vision', getPath('crop.jpeg'));
        } else {
            // fix image
            //fixImage(imageBuffer);

            // tesseract ocr
            ipcRenderer.send('tesseract-ocr', imageBuffer);
        }
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面: ' + error);
    }
}

/*
// fix image
async function fixImage(imageBuffer) {
    try {
        // get image
        let image = sharp(imageBuffer)
            .greyscale()
            .linear(fator, (1 - fator) * contrastThreshold)
            .jpeg({ colors: 2 })
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
            resultImageBuffer = await image //.threshold(parseInt(dominant.r / 2))
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

        // save result
        ipcRenderer.send('image-writer', getPath('result.jpeg'), resultImageBuffer);

        // tesseract ocr
        ipcRenderer.send('tesseract-ocr', resultImageBuffer);
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法擷取螢幕畫面: ' + error);
    }
}

// hsp
function hsp(dominant) {
    const red = dominant.r;
    const green = dominant.g;
    const blue = dominant.b;

    return 0.299 * (red * red) + 0.587 * (green * green) + 0.114 * (blue * blue);
}
*/

// get path
function getPath(fileName) {
    return ipcRenderer.sendSync('get-path', tempImagePath, fileName);
}

// module exports
module.exports = {
    takeScreenshot,
};
