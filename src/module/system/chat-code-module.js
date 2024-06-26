'use strict';

// Achievement 0840

// file module
const fileModule = require('./file-module');

// chat code location
const chatCodeLocation = fileModule.getUserDataPath('config', 'chat-code.json');

// default chat code
const defaultChatCode = [
  {
    ChatCode: '0039',
    MsgType: 1,
    Name: 'System',
    Color: '#CCCCCC',
  },
  {
    ChatCode: '0839',
    MsgType: 1,
    Name: 'System2',
    Color: '#CCCCCC',
  },
  {
    ChatCode: '0003',
    MsgType: 3,
    Name: 'ServerInfo',
    Color: '#CCCCCC',
  },
  {
    ChatCode: '0038',
    MsgType: 3,
    Name: 'Echo',
    Color: '#74C8CC',
  },
  {
    ChatCode: '003C',
    MsgType: 3,
    Name: 'Error',
    Color: '#FF4A4A',
  },
  {
    ChatCode: '003D',
    MsgType: 1,
    Name: 'NPCD',
    Color: '#ABD647',
  },
  {
    ChatCode: '0044',
    MsgType: 1,
    Name: 'NPCA',
    Color: '#ABD647',
  },
  {
    ChatCode: '2AB9',
    MsgType: 1,
    Name: 'BossQuotes',
    Color: '#ABD647',
  },
  {
    ChatCode: '0048',
    MsgType: 3,
    Name: 'Recruitment',
    Color: '#CCCCCC',
  },
  {
    ChatCode: '000A',
    MsgType: 3,
    Name: 'Say',
    Color: '#F7F7F7',
  },
  {
    ChatCode: '000B',
    MsgType: 3,
    Name: 'Shout',
    Color: '#FFA666',
  },
  {
    ChatCode: '000E',
    MsgType: 3,
    Name: 'Party',
    Color: '#66E5FF',
  },
  {
    ChatCode: '000D',
    MsgType: 3,
    Name: 'Tell',
    Color: '#FFB8DE',
  },
  {
    ChatCode: '0018',
    MsgType: 3,
    Name: 'FreeCompany',
    Color: '#ABDBE5',
  },
  {
    ChatCode: '001E',
    MsgType: 3,
    Name: 'Yell',
    Color: '#FFFF00',
  },
  {
    ChatCode: '000F',
    MsgType: 3,
    Name: 'Alliance',
    Color: '#FF7F00',
  },
  {
    ChatCode: '0010',
    MsgType: 3,
    Name: 'LinkShell1',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0011',
    MsgType: 3,
    Name: 'LinkShell2',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0012',
    MsgType: 3,
    Name: 'LinkShell3',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0013',
    MsgType: 3,
    Name: 'LinkShell4',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0014',
    MsgType: 3,
    Name: 'LinkShell5',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0015',
    MsgType: 3,
    Name: 'LinkShell6',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0016',
    MsgType: 3,
    Name: 'LinkShell7',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0017',
    MsgType: 3,
    Name: 'LinkShell8',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0025',
    MsgType: 3,
    Name: 'CWLS1',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0065',
    MsgType: 3,
    Name: 'CWLS2',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0066',
    MsgType: 3,
    Name: 'CWLS3',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0067',
    MsgType: 3,
    Name: 'CWLS4',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0068',
    MsgType: 3,
    Name: 'CWLS5',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '0069',
    MsgType: 3,
    Name: 'CWLS6',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '006A',
    MsgType: 3,
    Name: 'CWLS7',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '006B',
    MsgType: 3,
    Name: 'CWLS8',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '001B',
    MsgType: 3,
    Name: 'NoviceNetwork',
    Color: '#D4FF7D',
  },
  {
    ChatCode: '001D',
    MsgType: 3,
    Name: 'Emotes',
    Color: '#CCCCCC',
  },
  {
    ChatCode: '001C',
    MsgType: 3,
    Name: 'CustomEmotes',
    Color: '#CCCCCC',
  },
];

// current chat code
let currentChatCode = getDefaultChatCode();

// load chat code
function loadChatCode() {
  currentChatCode = fileModule.read(chatCodeLocation, 'json') || [];

  if (defaultChatCode.length !== currentChatCode.length) {
    currentChatCode = getDefaultChatCode();
  }

  saveChatCode();
  return currentChatCode;
}

// save chat code
function saveChatCode() {
  try {
    fileModule.write(chatCodeLocation, currentChatCode, 'json');
  } catch (error) {
    console.log(error);
  }
}

// get chat code
function getChatCode() {
  return JSON.parse(JSON.stringify(currentChatCode));
}

// set chat code
function setChatCode(newChatCode) {
  currentChatCode = newChatCode;
  saveChatCode();
}

// get default chat code
function getDefaultChatCode() {
  return JSON.parse(JSON.stringify(defaultChatCode));
}

// set default chat code
function setDefaultChatCode() {
  currentChatCode = getDefaultChatCode();
}

// get color
function getColor(code) {
  if (code === 'FFFF') code = '0039';

  let color = '#FFFFFF';

  for (let index = 0; index < currentChatCode.length; index++) {
    const element = currentChatCode[index];
    if (element.ChatCode === code) {
      color = element.Color;
      break;
    }
  }

  return color;
}

// module exports
module.exports = {
  loadChatCode,
  saveChatCode,
  getChatCode,
  setChatCode,
  getDefaultChatCode,
  setDefaultChatCode,
  getColor,
};
