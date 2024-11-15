'use strict';

// config module
const configModule = require('../system/config-module');

// dialog module
const dialogModule = require('../system/dialog-module');

// data queue
const dataQueue = [];
/*let dataQueueInterval =*/ createDataQueue();
let dataQueueIntervalRunning = true;
let lastTimestamp = 0;

// create data queue
function createDataQueue() {
  return setInterval(() => {
    if (!dataQueueIntervalRunning) return;

    const data = dataQueue.shift();

    if (data) {
      dialogModule.addDialog(data);

      const response = processData(data);

      if (response === 'delete') {
        dialogModule.removeDialog(data.id);
      } else {
        dialogModule.updateDialog(data, response);
      }
    }
  }, 1000);
}

// add
function add(data) {
  // check id and timestamp
  if (!data.id || !data.timestamp) {
    let timestamp = new Date().getTime();
    if (timestamp <= lastTimestamp) timestamp = lastTimestamp + 1;
    lastTimestamp = timestamp;
    data.id = 'id' + timestamp;
    data.timestamp = timestamp;
  }

  // check translation
  if (!data.translation) {
    const config = configModule.getConfig();
    data.translation = config.translation;
  }

  // push
  dataQueue.push(data);
}

// set running
function setRunning(value = true) {
  dataQueueIntervalRunning = value;
}

// process data
function processData(data) {
  const config = configModule.getConfig();
  const useFix = config.translation.fix;
  const targetLanguage = config.translation.to;
  const sourcelanguage = getLanguage(data);

  if (useFix) {
    // building...
  } else {
    // building...
  }
}

// get language
function getLanguage(data) {
  return isPlayerChannel(data.code) ? data.translation.fromPlayer : data.translation.from;
}

// is player channel
function isPlayerChannel(code) {
  return getPlayerChannel().includes(code);
}

// get player channel
function getPlayerChannel() {
  return [
    // Say
    '000A',

    // Shout
    '000B',

    // Party
    '000E',

    // Tell
    '000D',

    // FreeCompany
    '0018',

    // Yell
    '001E',

    // Alliance
    '000F',

    // LinkShell
    '0010',
    '0011',
    '0012',
    '0013',
    '0014',
    '0015',
    '0016',
    '0017',

    // CWLS
    '0025',
    '0065',
    '0066',
    '0067',
    '0068',
    '0069',
    '006A',
    '006B',

    // NoviceNetwork
    '001B',
  ];
}

module.exports = {
  add,
  setRunning,
};
