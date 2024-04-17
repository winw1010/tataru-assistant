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
const appName = 'Tataru Assistant'; //const appName = 'Tataru Helper Node';

// directory check
function directoryCheck() {
  const documentPath = getUserPath('Documents');
  const subPath = [
    '',
    appName,
    appName + '\\' + 'image',
    appName + '\\' + 'log',
    appName + '\\' + 'setting',
    appName + '\\' + 'text',
  ];

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

// readdir
function readdir(path) {
  let result = [];

  try {
    result = fs.readdirSync(path);
  } catch (error) {
    console.log(error);
  }

  return result;
}

// exists
function exists(filePath = './') {
  let result = false;

  try {
    result = fs.existsSync(filePath);
  } catch (error) {
    console.log(error);
  }

  return result;
}

// unlink
function unlink(filePath = './') {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.log(error);
  }
}

// read
function read(filePath = './', type = '') {
  let data = null;

  try {
    switch (type) {
      case 'json':
        data = JSON.parse(fs.readFileSync(filePath));
        break;

      case 'image':
        fs.readFileSync(filePath, { encoding: 'base64' });
        break;

      default:
        data = fs.readFileSync(filePath);
        break;
    }
  } catch (error) {
    console.log(error);
  }

  return data;
}

// write
function write(filePath = './', data = '', type = '') {
  try {
    switch (type) {
      case 'json':
        {
          let dataString = JSON.stringify(data).includes('{')
            ? JSON.stringify(data, null, '\t')
            : JSON.stringify(data)
                .replaceAll('[[', '[\n\t[')
                .replaceAll('],', '],\n\t')
                .replaceAll(']]', ']\n]')
                .replaceAll('","', '", "');
          dataString = dataString.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n');
          fs.writeFileSync(filePath, dataString);
        }
        break;

      case 'image':
        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
        break;

      default:
        fs.writeFileSync(filePath, data);
        break;
    }
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

// get root data path
function getRootDataPath(...args) {
  return path.join(rootPath, 'src', 'data', ...args);
}

// get user path
function getUserPath(...args) {
  return path.join(userPath, ...args);
}

// get user path
function getUserDataPath(...args) {
  return path.join(userPath, 'Documents', appName, ...args);
}

// module exports
module.exports = {
  directoryCheck,

  readdir,
  exists,
  unlink,
  read,
  write,

  getPath,
  getRootPath,
  getRootDataPath,
  getUserPath,
  getUserDataPath,
};
