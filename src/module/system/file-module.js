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
const appName = 'Tataru Assistant';
const oldName = 'Tataru Helper Node';

// directory check
function directoryCheck() {
  const documentPath = getUserPath('Documents');

  if (!fs.existsSync(getPath(documentPath, appName)) && fs.existsSync(getPath(documentPath, oldName))) {
    copyData();
  }

  const subPath = [
    '',
    appName,
    appName + '\\' + 'config',
    appName + '\\' + 'image',
    appName + '\\' + 'log',
    appName + '\\' + 'text',
  ];

  subPath.forEach((value) => {
    try {
      const dir = getPath(documentPath, value);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    } catch (error) {
      //console.log(error);
    }
  });
}

// copy data
function copyData() {
  try {
    const oldPath = getUserPath('Documents', oldName);
    const newPath = getUserPath('Documents', appName);

    const renameList = [
      [getPath(newPath, 'setting'), getPath(newPath, 'config')],
      [getPath(newPath, 'temp'), getPath(newPath, 'text')],
      [getPath(newPath, 'text', 'jpTemp.json'), getPath(newPath, 'text', 'custom-source.json')],
      [getPath(newPath, 'text', 'chTemp.json'), getPath(newPath, 'text', 'custom-target.json')],
      [getPath(newPath, 'text', 'overwriteTemp.json'), getPath(newPath, 'text', 'custom-overwrite.json')],
      [getPath(newPath, 'text', 'player.json'), getPath(newPath, 'text', 'player-name.json')],
    ];
    const tempList = [];

    const configPath = getPath(newPath, 'config', 'config.json');
    const configList = ['geminiApiKey', 'cohereToken', 'gptApiKey', 'gptModel'];

    // copy files
    fs.cpSync(oldPath, newPath, { recursive: true });

    // rename files
    for (let index = 0; index < renameList.length; index++) {
      const element = renameList[index];

      if (exists(element[0])) {
        fs.renameSync(element[0], element[1]);
      } else {
        write(element[1], [], 'json');
      }
    }

    // delete temp element from custom-target.json
    const customTarget = read(getPath(newPath, 'text', 'custom-target.json'), 'json') || [];
    for (let index = customTarget.length - 1; index >= 0; index--) {
      const element = customTarget[index];

      if (element[2]?.includes('temp')) {
        const tempElement = customTarget.splice(index, 1);
        tempList.push(tempElement[0]);
      }
    }

    // write text files
    write(getPath(newPath, 'text', 'custom-target.json'), customTarget, 'json');
    write(getPath(newPath, 'text', 'temp-name.json'), [], 'json');
    write(getPath(newPath, 'text', 'deprecated-temp-name.json'), tempList, 'json');

    // fix config
    const config = read(configPath, 'json');
    config.api = {};
    for (let index = 0; index < configList.length; index++) {
      const name = configList[index];
      const value = config?.system?.[name];

      if (typeof value !== 'undefined') {
          config.api[name] = value;
      }
    }
    write(configPath, config, 'json');
  } catch (error) {
    //console.log(error);
  }
}

// readdir
function readdir(path) {
  let result = [];

  try {
    result = fs.readdirSync(path);
  } catch (error) {
    //console.log(error);
  }

  return result;
}

// exists
function exists(filePath = './') {
  let result = false;

  try {
    result = fs.existsSync(filePath);
  } catch (error) {
    //console.log(error);
  }

  return result;
}

// unlink
function unlink(filePath = './') {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    //console.log(error);
  }
}

// read
function read(filePath = './', type = '') {
  let data = null;

  try {
    switch (type) {
      case 'json':
        data = JSON.parse(fs.readFileSync(filePath).toString());
        break;

      case 'image':
        data = fs.readFileSync(filePath, 'base64');
        break;

      case 'txt':
        data = fs.readFileSync(filePath).toString();
        break;

      default:
        data = fs.readFileSync(filePath);
        break;
    }
  } catch (error) {
    //console.log(error);
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
    //console.log(error);
  }
}

// write log
function writeLog(type = '', message = '') {
  try {
    const logPath = getUserDataPath('config', 'log.txt');
    const currentTime = new Date().toLocaleString();
    let log = read(logPath, 'txt') || '';
    log += '\r\n' + currentTime + '\r\n' + type + '\r\n' + message + '\r\n\r\n';
    write(logPath, log);
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

// get old user path
function getOldUserDataPath(...args) {
  return path.join(userPath, 'Documents', oldName, ...args);
}

// module exports
module.exports = {
  directoryCheck,

  readdir,
  exists,
  unlink,
  read,
  write,
  writeLog,

  getPath,
  getRootPath,
  getRootDataPath,
  getUserPath,
  getUserDataPath,
  getOldUserDataPath,
};
