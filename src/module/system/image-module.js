'use strict';

// sharp
const sharp = require('sharp');
sharp.cache(false);

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

// start recognize
async function takeScreenshot(captureData) {
  dialogModule.addNotification('CAPTURING_THE_SCREEN');

  console.log('screen size:', captureData.screenSize);
  console.log('rectangle size:', captureData.rectangleSize);

  try {
    // get displays
    const displays = await screenshotModule.listDisplays();

    // set screenshot path
    captureData.screenshotPath = getImagePath('screenshot.png');

    // take screenshot
    try {
      await screenshotModule({
        screen: displays[captureData.displayIndex].id,
        filename: captureData.screenshotPath,
        format: 'png',
      });
    } catch (error) {
      console.log('error:', error);
      await screenshotModule({
        filename: captureData.screenshotPath,
        format: 'png',
      });
    }

    // restore all windows
    windowModule.forEachWindow((myWindow) => {
      try {
        myWindow.restore();
      } catch (error) {
        error;
      }
    });

    // crop image
    cropImage(captureData);
  } catch (error) {
    console.log(error);
    dialogModule.addNotification(error);
  }
}

// crop image
async function cropImage(captureData) {
  try {
    // set image path
    captureData.imagePath = getImagePath('cropped.png');

    // crop image
    await sharp(captureData.screenshotPath)
      .resize(captureData.screenSize) // resize image to screen size
      .extract({
        left: parseInt(captureData.rectangleSize.x),
        top: parseInt(captureData.rectangleSize.y),
        width: parseInt(captureData.rectangleSize.width),
        height: parseInt(captureData.rectangleSize.height),
      })
      //.greyscale()
      .toFile(captureData.imagePath);

    // start reconizing
    dialogModule.addNotification('RECOGNIZING_THE_IMAGE');
    textDetectModule.startReconizing(captureData);
  } catch (error) {
    console.log(error);
    dialogModule.addNotification(error);
  }
}

/*
// fix image
async function fixImage(cropPath = '') {
  // adaptive thresholding?
  // Otsu thresholding?

  const processedPath = getImagePath('processed.png');

  try {
    // read image
    const imageSharp = sharp(cropPath);

    // get dominant
    const { dominant } = await imageSharp.stats();

    // negate image if background is dark
    if (hsp(dominant) >= 16256.25) {
      console.log('light background');
    } else {
      console.log('dark background');
      imageSharp.negate({ alpha: false });
    }

    // save processed image
    await imageSharp.toFile(processedPath);
    return processedPath;
  } catch (error) {
    console.log(error);
    dialogModule.addNotification(error);
    return cropPath;
  }
}
*/

/*
async function otsuFix(croppedPath = '') {
  // adaptive thresholding?
  // Otsu thresholding?

  const maskPath = getImagePath('mask.png');
  const combinedPath = getImagePath('combined.png');
  const textPath = getImagePath('text.png');
  const processedPath = getImagePath('processed.png');

  const metaData = await sharp(croppedPath).metadata();
  let isDark = false;

  try {
    // read cropped image
    const maskImage = sharp(croppedPath).threshold(await getOstuValue(croppedPath), { greyscale: false });

    // get dominant
    const { dominant } = await maskImage.stats();

    // negate image if background is dark
    // hsp(dominant) >= 16256.25 : light background
    if (dominant.r >= 128) {
      console.log('light background');
    } else {
      console.log('dark background');
      maskImage.negate({ alpha: false });
      isDark = true;
    }

    // save mask image
    await maskImage.unflatten().toFile(maskPath);

    // save combined image
    await sharp(maskPath)
      .composite([
        {
          input: croppedPath,
          blend: 'in',
        },
      ])
      .toFile(combinedPath);

    // save text image
    const textImage = sharp(combinedPath);
    if (isDark) {
      textImage.negate({ alpha: false });
    }
    await textImage.toFile(textPath);

    // save processed image
    await sharp({
      create: {
        width: metaData.width,
        height: metaData.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 },
      },
    })
      .composite([{ input: textPath }])
      .toFile(processedPath);
    return processedPath;
  } catch (error) {
    console.log(error);
    dialogModule.addNotification(error);
    return croppedPath;
  }
}
*/

/*
// hsp
function hsp(dominant) {
  const red = dominant.r;
  const green = dominant.g;
  const blue = dominant.b;

  return 0.299 * (red * red) + 0.587 * (green * green) + 0.114 * (blue * blue);
}
*/

/*
// otsu
async function getOstuValue(croppedPath = '') {
  const cropImageRawBuffer = await sharp(croppedPath).raw().toBuffer();
  const intensity = [];

  for (let index = 0; index < cropImageRawBuffer.length; index += 4) {
    intensity.push(cropImageRawBuffer[index]);
  }

  return Math.min(255, otsu(intensity) + 1);
}
*/

// get image path
function getImagePath(fileName) {
  return fileModule.getRootPath('src', 'data', 'img', fileName);
}

// module exports
module.exports = {
  takeScreenshot,
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
        dialogModule.addNotification(error);
    }
}
*/
