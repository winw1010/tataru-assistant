'use strict';

// update button
const updateButton = '<img src="./img/ui/download_white_48dp.svg" style="width: 1.5rem; height: 1.5rem;">';

// message
const message = {
  VIEW_README: ['查看使用說明: CTRL+F9', '查看使用说明: CTRL+F9', 'Readme: CTRL+F9'],

  UPDATE_AVAILABLE: [
    `<span class="text-warning">已有可用的更新，點擊${updateButton}下載最新版本</span>`,
    `<span class="text-warning">已有可用的更新，点击${updateButton}下载最新版本</span>`,
    `<span class="text-warning">Update available, press ${updateButton} to download the latest version.</span>`,
  ],
  VERSION_CHECK_ERRORED: ['無法取得版本資訊', '无法取得版本资讯', 'Failed to get version file'],

  DOWNLOAD_COMPLETED: ['對照表下載完畢', '对照表下载完毕', 'NO_MESSAGE'],
  LOAD_COMPLETED: ['對照表讀取完畢', '对照表读取完毕', 'NO_MESSAGE'],
  TEMP_DELETED: ['暫存清除完畢', '暂存清除完毕', 'Temp file deleted'],

  SETTINGS_SAVED: ['設定已儲存', '设定已储存', 'Settings saved'],
  RESTORED_TO_DEFAULT_SETTINGS: ['已恢復預設值', '已恢復预设值', 'Restored to default settings'],

  GOOGLE_CREDENTIAL_SAVED: ['已儲存Google憑證', '已储存Google凭证', 'Google credential saved'],
  INCORRECT_FILE: ['檔案格式不正確', '档案格式不正确', 'Incorrect file'],

  LENGTH_TOO_SHORT: ['字數不足', '字数不足', 'The length of word is too short'],
  WORD_SAVED: ['已儲存自訂翻譯', '已储存自订翻译', 'Saved'],
  WORD_DELETED: ['已刪除自訂翻譯', '已删除自订翻译', 'Deleted'],

  CAPTURING_THE_SCREEN: ['正在擷取螢幕畫面', '正在撷取萤幕画面', 'Capturing the screen'],
  RECOGNIZING_THE_IMAGE: ['正在辨識圖片文字', '正在辨识图片文字', 'Recognizing the image'],
  RECOGNITION_COMPLETED: ['辨識完成', '辨识完成', 'Recognition completed'],
  RECOGNITION_EMPTY: ['字串長度為0', '字串长度为0', 'Text is empty string'],

  FILE_NOT_FOUND: ['檔案不存在', '档案不存在', 'File is not found'],
  UNABLE_TO_READ_THE_FILE: ['無法讀取檔案', '无法读取档案', 'Unable to read the file'],
};

// get message
function getMessage(text = '', appLanguage = '') {
  let languageIndex = 0;
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
