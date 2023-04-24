'use strict';

// fs
const fs = require('fs');

// path
const path = require('path');

// root path
const rootPath = process.cwd();

// user path
const userPath = process.env.USERPROFILE;

// app name
const appName = 'Tataru Helper Node';

// directory check
function directoryCheck() {
    const documentPath = getUserPath('Documents');
    const subPath = ['', appName, appName + '\\image', appName + '\\log', appName + '\\setting', appName + '\\temp'];

    subPath.forEach((value) => {
        try {
            const dir = getPath(documentPath, value);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
        } catch (error) {
            console.log(error);
        }
    });
}

// directoryReader
function directoryReader(path) {
    let result = [];

    try {
        result = fs.readdirSync(path);
    } catch (error) {
        console.log(error);
    }

    return result;
}

// json reader
function jsonReader(filePath = './', returnArray = true) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath));
        return data;
    } catch (error) {
        console.log(error);

        if (returnArray) {
            return [];
        } else {
            return {};
        }
    }
}

// json writer
function jsonWriter(filePath = './', data = null) {
    try {
        let dataString = JSON.stringify(data);

        fs.writeFileSync(
            filePath,
            dataString.includes('{') ? JSON.stringify(data, null, '\t') : dataString.replaceAll('[[', '[\r\n\t[').replaceAll('],', '],\r\n\t').replaceAll(']]', ']\r\n]').replaceAll('","', '", "')
        );
    } catch (error) {
        console.log(error);
    }
}

// image writer
function imageWriter(filePath = './', imageBuffer = Buffer.from('')) {
    try {
        fs.writeFileSync(filePath, Buffer.from(imageBuffer, 'base64'));
    } catch (error) {
        console.log(error);
    }
}

// file writer
function fileWriter(filePath = './', data) {
    try {
        fs.writeFileSync(filePath, data);
    } catch (error) {
        console.log(error);
    }
}

// file checker
function fileChecker(filePath = './') {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        console.log(error);
        return false;
    }
}

// file deleter
function fileDeleter(filePath = './') {
    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.log(error);
    }
}

// get path
function getPath(...args) {
    return path.join(...args);
}

// get root path
function getRootPath(...args) {
    return path.join(rootPath, ...args);
}

// get user path
function getUserPath(...args) {
    return path.join(userPath, ...args);
}

// get user path
function getUserDataPath(...args) {
    return path.join(userPath, 'Documents', appName, ...args);
}

// delete images
function deleteImages() {
    const imagePath = getRootPath('src', 'data', 'image');
    const images = fs.readdirSync(imagePath);

    images.forEach((fileName) => {
        if (fileName.includes('png')) {
            try {
                fileDeleter(getPath(imagePath, fileName));
            } catch (error) {
                console.log(error);
            }
        }
    });
}

// module exports
module.exports = {
    directoryCheck,
    directoryReader,
    jsonReader,
    jsonWriter,
    imageWriter,
    fileWriter,
    fileChecker,
    fileDeleter,
    getPath,
    getRootPath,
    getUserPath,
    getUserDataPath,
    deleteImages,
};
