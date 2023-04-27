'use strict';

// sharp
const sharp = require('sharp');
sharp.cache(false);

// config module
const configModule = require('./config-module');

// dialog module
const dialogModule = require('./dialog-module');

// file module
const fileModule = require('./file-module');

// screenshot module
const screenshotModule = require('./screenshot-module');

// text detect module
const textDetectModule = require('./text-detect-module');

// window module
const windowModule = require('./window-module');

// image path
const imagePath = fileModule.getRootPath('src', 'data', 'img');

// start recognize
async function startRecognize(rectangleSize, displayBounds, displayIndex) {
    dialogModule.showNotification('正在擷取螢幕畫面');
    console.log('rectangle size:', rectangleSize);

    try {
        // screenshot path
        const screenshotPath = getImagePath('screenshot.png');

        // get displays
        const displays = await screenshotModule.listDisplays();

        // take screenshot
        try {
            await screenshotModule({
                screen: displays[displayIndex].id,
                filename: screenshotPath,
                format: 'png',
            });
        } catch (error) {
            await screenshotModule({
                filename: screenshotPath,
                format: 'png',
            });
        }

        // restore all windows
        windowModule.forEachWindow((myWindow) => {
            myWindow.restore();
        });

        // crop image
        cropImage(rectangleSize, displayBounds, screenshotPath);
    } catch (error) {
        console.log(error);
        dialogModule.showNotification('無法擷取螢幕畫面: ' + error);
    }
}

// crop image
async function cropImage(rectangleSize, displayBounds, screenshotPath) {
    try {
        const cropPath = getImagePath('crop.png');
        const config = configModule.getConfig();
        const newSize = getNewSize(displayBounds);

        let imageBuffer = await sharp(screenshotPath)
            .resize({
                width: newSize.width,
                height: newSize.height,
            })
            .extract({
                left: parseInt(rectangleSize.x * newSize.scaleRate),
                top: parseInt(rectangleSize.y * newSize.scaleRate),
                width: parseInt(rectangleSize.width * newSize.scaleRate),
                height: parseInt(rectangleSize.height * newSize.scaleRate),
            })
            .png({ quality: 100 })
            .toBuffer();

        // save crop
        fileModule.imageWriter(cropPath, imageBuffer);

        // start reconize
        dialogModule.showNotification('正在辨識圖片文字');
        if (config.captureWindow.type === 'google') {
            // google vision
            textDetectModule.googleVision(cropPath);
        } else {
            // tesseract ocr
            textDetectModule.tesseractOCR(await fixImage(imageBuffer));
        }
    } catch (error) {
        console.log(error);
        dialogModule.showNotification('無法擷取螢幕畫面: ' + error);
    }
}

// get new size
function getNewSize(displayBounds) {
    if (displayBounds.width > 1920) {
        const scaleRate = 1920 / displayBounds.width;

        return {
            width: 1920,
            height: parseInt(displayBounds.height * scaleRate),
            scaleRate: scaleRate,
        };
    } else {
        return {
            width: displayBounds.width,
            height: displayBounds.height,
            scaleRate: 1,
        };
    }
}

// fix image
async function fixImage(imageBuffer) {
    try {
        // greyscale image
        let image = sharp(imageBuffer).greyscale();

        // determind background color is light or dark
        const { dominant } = await image.stats();

        if (hsp(dominant) >= 16256.25) {
            // light color background
            console.log('light color background');

            // set result image buffer
            return await image.toBuffer();
        } else {
            // dark color background
            console.log('dark color background');

            // set result image buffer
            return await image.negate({ alpha: false }).toBuffer();
        }
    } catch (error) {
        console.log(error);
        dialogModule.showNotification('圖片處理發生錯誤: ' + error);
        return imageBuffer;
    }
}

// hsp
function hsp(dominant) {
    const red = dominant.r;
    const green = dominant.g;
    const blue = dominant.b;

    return 0.299 * (red * red) + 0.587 * (green * green) + 0.114 * (blue * blue);
}

// get image path
function getImagePath(fileName) {
    return fileModule.getPath(imagePath, fileName);
}

// module exports
module.exports = {
    startRecognize,
};

/*
// contrast values
const contrastThreshold = 160; //128
const contrast = 100; //76.5
const fator = ((255 + contrast) * 350) / (255 * (350 - contrast));

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
        dialogModule.showNotification('無法擷取螢幕畫面: ' + error);
    }
}
*/
