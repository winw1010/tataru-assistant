'use strict';

// update button
const updateButton = '<img src="./img/ui/download_white_48dp.svg" style="width: 1.5rem; height: 1.5rem;">';

// message
const message = {
  VIEW_README: ['查看使用說明: Ctrl+F9', '查看使用说明: Ctrl+F9', 'Readme: Ctrl+F9'],

  UPDATE_AVAILABLE: [
    `<span class="text-warning">已有可用的更新，點擊${updateButton}下載最新版本</span>`,
    `<span class="text-warning">已有可用的更新，点击${updateButton}下载最新版本</span>`,
    `<span class="text-warning">An update is available. Click ${updateButton} to download the latest version.</span>`,
  ],
  VERSION_CHECK_ERRORED: ['無法取得版本資訊', '无法取得版本资讯', 'Unable to retrieve version information.'],

  DOWNLOAD_COMPLETED: ['對照表下載完畢', '对照表下载完毕', 'NO_MESSAGE'],
  LOAD_COMPLETED: ['對照表讀取完畢', '对照表读取完毕', 'NO_MESSAGE'],
  TEMP_DELETED: ['暫存清除完畢', '暂存清除完毕', 'Cache cleared.'],

  SETTINGS_SAVED: ['設定已儲存', '设定已储存', 'Settings saved'],
  RESTORED_TO_DEFAULT_SETTINGS: ['已恢復預設值', '已恢復预设值', 'Restored to default settings.'],

  GOOGLE_CREDENTIAL_SAVED: ['已儲存Google憑證', '已储存Google凭证', 'Google credential saved.'],
  INCORRECT_FILE: ['檔案格式不正確', '档案格式不正确', 'Invalid file format.'],

  LENGTH_TOO_SHORT: ['字數不足', '字数不足', 'Insufficient word count.'],
  WORD_SAVED: ['已儲存自訂翻譯', '已储存自订翻译', 'Custom translation saved.'],
  WORD_DELETED: ['已刪除自訂翻譯', '已删除自订翻译', 'Custom translation Deleted'],

  CAPTURING_THE_SCREEN: ['正在擷取螢幕畫面', '正在撷取萤幕画面', 'Capturing screenshot...'],
  RECOGNIZING_THE_IMAGE: ['正在辨識圖片文字', '正在辨识图片文字', 'Recognizing text from image...'],
  RECOGNITION_COMPLETED: ['辨識完成', '辨识完成', 'Recognition complete.'],
  RECOGNITION_EMPTY: ['字串長度為0', '字串长度为0', 'Error: Empty string.'],

  FILE_NOT_FOUND: ['檔案不存在', '档案不存在', 'File does not exist.'],
  UNABLE_TO_READ_THE_FILE: ['無法讀取檔案', '无法读取档案', 'Unable to read file.'],

  USE_AI_TRANSLATOR: ['使用AI翻譯以獲得更好的AI翻譯品質', '使用AI翻译以获得更好的AI翻译质量', 'Use AI translation to get better AI translation quality.'],
  ENABLE_MULTI_TURN_CONVERSATION: [
    '於[設定]->[AI翻譯設定]中開啟"多輪對話"功能(上下文追蹤功能)可提升AI翻譯品質',
    '于[設定]->[AI翻译设定]中开启"多轮对话"功能(上下文追踪功能)可提升AI翻译质量',
    'Enabling the "Multi-turn Conversation" feature (Context Tracking) in [Config] -> [AI Translation Settings] can improve AI translation quality.',
  ],
};

// get message
function getMessage(text = '', appLanguage = '') {
  let languageIndex;
  text += '';

  switch (appLanguage) {
    case 'app-zht':
      languageIndex = 0;
      break;

    case 'app-zhs':
      languageIndex = 1;
      break;

    default:
      languageIndex = 2;
      break;
  }

  return message?.[text]?.[languageIndex] || text;
}

// module exports
module.exports = {
  getMessage,
};
