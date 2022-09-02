'use strict';

// fs
const fs = require('fs');

// path
const path = require('path');

// root path
const rootPath = process.cwd();

// user path
const userPath = process.env.USERPROFILE;

// json reader
function jsonReader(filePath = './') {
    try {
        const data = JSON.parse(fs.readFileSync(filePath));
        return data;
    } catch (error) {
        console.log(error);
        return [];
    }
}

// json writter
function jsonWritter(filePath = './', data = []) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'));
    } catch (error) {
        console.log(error);
    }
}

// image writter
function imageWritter(filePath = './', imageBuffer = Buffer.from('')) {
    fs.writeFileSync(filePath, Buffer.from(imageBuffer, 'base64'));
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

// exports
module.exports = {
    jsonReader,
    jsonWritter,
    imageWritter,
    getPath,
    getRootPath,
    getUserPath,
};
