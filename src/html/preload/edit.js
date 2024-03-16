'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

// kana characters
const allKana = /^[ぁ-ゖァ-ヺー]+$/gi;

// file module
const fileModule = {
  getPath: (...args) => {
    return ipcRenderer.sendSync('get-path', ...args);
  },
  getUserDataPath: (...args) => {
    return ipcRenderer.sendSync('get-user-data-path', ...args);
  },
  readJson: (filePath, returnArray) => {
    return ipcRenderer.sendSync('read-json', filePath, returnArray);
  },
  writeJson: (filePath, data) => {
    ipcRenderer.send('write-json', filePath, data);
  },
};

// log location
const logPath = fileModule.getUserDataPath('log');

// temp location
const tempPath = fileModule.getUserDataPath('temp');

// target log
let targetLog = null;

// google form
const formId = '1FAIpQLScj8LAAHzy_nTIbbJ1BSqNzyZy3w5wFrLxDVUMbY0BIAjaIAg';
const entry1 = 'entry.195796166';
const entry2 = 'entry.1834106335';
const entry3 = 'entry.2057890818';
const entry4 = 'entry.654133178';

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  setContextBridge();
  setIPC();

  setView();
  setEvent();
  setButton();
});

// set context bridge
function setContextBridge() {
  contextBridge.exposeInMainWorld('myAPI', {
    getConfig: () => {
      return ipcRenderer.sendSync('get-config');
    },
    dragWindow: (clientX, clientY, windowWidth, windowHeight) => {
      return ipcRenderer.send(
        'drag-window',
        clientX,
        clientY,
        windowWidth,
        windowHeight
      );
    },
  });
}

// set IPC
function setIPC() {
  // change UI text
  ipcRenderer.on('change-ui-text', () => {
    document.dispatchEvent(new CustomEvent('change-ui-text'));
  });

  // send data
  ipcRenderer.on('send-data', (event, id) => {
    try {
      const milliseconds = parseInt(id.slice(2));
      const logFileList = [
        createLogName(milliseconds),
        createLogName(milliseconds + 86400000),
        createLogName(milliseconds - 86400000),
      ];

      if (logFileList.length > 0) {
        for (let index = 0; index < logFileList.length; index++) {
          try {
            const filePath = fileModule.getPath(logPath, logFileList[index]);
            const log = fileModule.readJson(filePath, false);
            targetLog = log[id];

            if (targetLog) {
              break;
            }
          } catch (error) {
            console.log(error);
          }
        }

        if (targetLog) {
          // show audio
          showAudio();

          // show text
          showText();

          /*
                    // show restart
                    if (targetLog?.code !== 'FFFF') {
                        document.getElementById('div_restart').hidden = false;
                    }
                    */

          // set select_engine
          if (targetLog?.translation?.engine) {
            if (
              ['Youdao', 'Baidu', 'Caiyun', 'Papago', 'DeepL'].includes(
                targetLog.translation.engine
              )
            ) {
              document.getElementById('select_engine').value =
                targetLog.translation.engine;
            }
          }

          // set select_from
          if (targetLog?.translation?.from) {
            if (['Japanese', 'English'].includes(targetLog.translation.from)) {
              document.getElementById('select_from').value =
                targetLog.translation.from;
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
}

// set view
function setView() {
  const config = ipcRenderer.sendSync('get-config');
  document.getElementById('select_engine').value = config.translation.engine;
  document.getElementById('select_from').value = config.translation.from;
  document.getElementById('checkbox_replace').checked =
    config.translation.replace;
}

// set event
function setEvent() {
  document.getElementById('checkbox_replace').oninput = () => {
    let config = ipcRenderer.sendSync('get-config');
    config.translation.replace =
      document.getElementById('checkbox_replace').checked;
    ipcRenderer.send('set-config', config);
  };
}

// set button
function setButton() {
  // restart
  document.getElementById('button_restart_translate').onclick = () => {
    const config = ipcRenderer.sendSync('get-config');

    let dialogData = {
      id: targetLog.id,
      playerName: targetLog.player,
      code: targetLog.code,
      name: targetLog.name,
      text: targetLog.text,
      timestamp: targetLog.timestamp,
      translation: config.translation,
    };

    if (!dialogData.translation.replace) {
      // clear id and timestamp
      dialogData.id = null;
      dialogData.timestamp = null;
    }

    dialogData.translation.from = document.getElementById('select_from').value;
    dialogData.translation.fromPlayer =
      document.getElementById('select_from').value;
    dialogData.translation.engine =
      document.getElementById('select_engine').value;

    ipcRenderer.send('add-task', dialogData);
  };

  // load json
  document.getElementById('button_read_json').onclick = () => {
    ipcRenderer.send('load-json');
  };

  // report translation
  document.getElementById('button_report_translation').onclick = () => {
    reportTranslation();
  };

  // save custom
  document.getElementById('button_save_temp').onclick = () => {
    const textBefore = document
      .getElementById('textarea_before')
      .value.replaceAll('\n', '')
      .trim();
    const textAfter = document
      .getElementById('textarea_after')
      .value.replaceAll('\n', '')
      .trim();
    const type = document.getElementById('select_type').value;

    if (textBefore !== '') {
      if (type === 'jp') {
        addAndSave('jpTemp.json', textBefore, textAfter, type);
      } else if (type === 'overwrite') {
        addAndSave('overwriteTemp.json', textBefore, textAfter, type);
      } else if (type === 'player' || type === 'retainer') {
        addAndSave('player.json', textBefore, textAfter, type);
      } else {
        addAndSave('chTemp.json', textBefore, textAfter, type);
      }

      ipcRenderer.send('show-notification', '已儲存自訂翻譯');
      ipcRenderer.send('load-json');
    } else {
      ipcRenderer.send('show-notification', '「替換前(原文)」不可為空白');
    }
  };

  // delete temp
  document.getElementById('button_delete_temp').onclick = () => {
    const textBefore = document
      .getElementById('textarea_before')
      .value.replaceAll('\n', '')
      .trim();
    const type = document.getElementById('select_type').value;

    if (textBefore !== '') {
      if (type === 'jp') {
        deleteAndSave('jpTemp.json', textBefore);
      } else if (type === 'overwrite') {
        deleteAndSave('overwriteTemp.json', textBefore);
      } else if (type === 'player' || type === 'retainer') {
        deleteAndSave('player.json', textBefore);
      } else {
        deleteAndSave('chTemp.json', textBefore);
      }

      ipcRenderer.send('show-notification', '已刪除自訂翻譯');
      ipcRenderer.send('load-json');
    } else {
      ipcRenderer.send('show-notification', '「替換前(原文)」不可為空白');
    }
  };

  // view temp
  document.getElementById('button_view_temp').onclick = () => {
    ipcRenderer.send('execute-command', `start "" "${tempPath}"`);
  };

  // close
  document.getElementById('img_button_close').onclick = () => {
    ipcRenderer.send('close-window');
  };
}

// show audio
function showAudio() {
  const text = targetLog.audio_text || targetLog.text;

  if (text !== '') {
    try {
      const urlList = ipcRenderer.sendSync(
        'google-tts',
        text,
        targetLog.translation.from
      );
      console.log('TTS url:', urlList);

      let innerHTML = '';
      for (let index = 0; index < urlList.length; index++) {
        const url = urlList[index];

        innerHTML += `
                    <audio controls preload="metadata">
                        <source src="${url}" type="audio/ogg">
                        <source src="${url}" type="audio/mpeg">
                    </audio>
                    <br>
                `;
      }

      document.getElementById('div_audio').innerHTML = innerHTML;
    } catch (error) {
      console.log(error);
    }
  }
}

// show text
function showText() {
  const text1 = document.getElementById('div_text1');
  const text2 = document.getElementById('div_text2');

  text1.innerHTML = `<span>${
    targetLog.name !== '' ? targetLog.name + '：<br>' : ''
  }${targetLog.text}</span>`;
  text2.innerHTML =
    `<span>${
      targetLog.translated_name !== ''
        ? targetLog.translated_name + '：<br>'
        : ''
    }` + `${targetLog.translated_text}</span>`;
}

// add and save
function addAndSave(name, textBefore, textAfter, type) {
  let temp = fileModule.readJson(fileModule.getPath(tempPath, name));
  temp = addTemp(temp, textBefore, textAfter, type);
  fileModule.writeJson(fileModule.getPath(tempPath, name), temp);
}

// add temp
function addTemp(temp, textBefore, textAfter, type) {
  const list = ['jp', 'overwrite', 'player', 'retainer'];
  const array = temp.map((x) => x[0]);

  allKana.lastIndex = 0;
  if (
    !list.includes(type) &&
    textBefore.length < 3 &&
    allKana.test(textBefore)
  ) {
    textBefore = textBefore + '#';
  }

  const element = !list.includes(type)
    ? [textBefore, textAfter, type]
    : [textBefore, textAfter];

  if (array.includes(textBefore)) {
    temp[array.indexOf(textBefore)] = element;
  } else {
    temp.push(element);
  }

  return temp;
}

// delete and save
function deleteAndSave(name, textBefore) {
  let temp = fileModule.readJson(fileModule.getPath(tempPath, name));
  temp = deleteTemp(temp, textBefore);
  fileModule.writeJson(fileModule.getPath(tempPath, name), temp);
}

// delete temp
function deleteTemp(temp, textBefore) {
  let count = 0;

  for (let index = temp.length - 1; index >= 0; index--) {
    const element = temp[index];

    if (element[0] === textBefore || element[0] === textBefore + '#') {
      temp.splice(index, 1);
      count++;
    }
  }

  ipcRenderer.send('show-notification', `共找到${count}個`);

  return temp;
}

// report translation
function reportTranslation() {
  try {
    const text1 =
      (targetLog.name !== '' ? targetLog.name + ': ' : '') + targetLog.text;
    const text2 =
      (targetLog.translated_name !== ''
        ? targetLog.translated_name + ': '
        : '') + targetLog.translated_text;
    const path =
      `/forms/d/e/${formId}/formResponse?` +
      `${entry1}=待處理` +
      `&${entry2}=${targetLog.translation.engine}` +
      `&${entry3}=${text1}` +
      `&${entry4}=${text2}`;

    ipcRenderer.send('post-form', encodeURI(path));
    ipcRenderer.send('show-message-box', '回報完成');
  } catch (error) {
    console.log(error);
    ipcRenderer.send('show-message-box', error);
  }
}

// create log name
function createLogName(milliseconds = null) {
  return ipcRenderer.sendSync('create-log-name', milliseconds);
}
