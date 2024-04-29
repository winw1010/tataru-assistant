'use strict';

// electron
const { ipcRenderer } = require('electron');

// log path
const logPath = ipcRenderer.sendSync('get-user-data-path', 'log');

// target log
let targetLog = null;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  setIPC();

  setView();
  setEvent();
  setButton();
});

// set IPC
function setIPC() {
  // change UI text
  ipcRenderer.on('change-ui-text', () => {
    const config = ipcRenderer.sendSync('get-config');
    document.dispatchEvent(new CustomEvent('change-ui-text', { detail: config }));
  });

  // send data
  ipcRenderer.on('send-data', (event, id) => {
    readLog(id);
  });
}

// set view
function setView() {
  const config = ipcRenderer.sendSync('get-config');

  document.getElementById('select-engine').innerHTML = ipcRenderer.sendSync('get-engine-select');
  document.getElementById('select-from').innerHTML = ipcRenderer.sendSync('get-source-select');
  document.getElementById('select-to').innerHTML = ipcRenderer.sendSync('get-target-select');

  document.getElementById('select-engine').value = config.translation.engine;
  document.getElementById('select-from').value = config.translation.from;
  document.getElementById('select-to').value = config.translation.to;

  document.getElementById('checkbox-replace').checked = config.translation.replace;
}

// set event
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  document.getElementById('checkbox-replace').oninput = () => {
    let config = ipcRenderer.sendSync('get-config');
    config.translation.replace = document.getElementById('checkbox-replace').checked;
    ipcRenderer.send('set-config', config);
  };
}

// set button
function setButton() {
  // restart
  document.getElementById('button-restart-translate').onclick = () => {
    const config = ipcRenderer.sendSync('get-config');

    const dialogData = {
      id: targetLog.id,
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

    dialogData.translation.engine = document.getElementById('select-engine').value;
    dialogData.translation.from = document.getElementById('select-from').value;
    dialogData.translation.fromPlayer = document.getElementById('select-from').value;
    dialogData.translation.to = document.getElementById('select-to').value;

    ipcRenderer.send('add-task', dialogData);
  };

  // load json
  document.getElementById('button-load-json').onclick = () => {
    ipcRenderer.send('load-json');
  };

  // report translation
  document.getElementById('button-report-translation').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://forms.gle/1iX2Gq4G1itCy3UH9"');
  };

  // save custom
  document.getElementById('button-save-custom').onclick = () => {
    const textBefore = document.getElementById('textarea-before').value.replaceAll('\n', '').trim();
    const textAfter = document.getElementById('textarea-after').value.replaceAll('\n', '').trim();
    const type = document.getElementById('select-type').value;

    if (textBefore.length > 1) {
      ipcRenderer.send('save-user-custom', textBefore, textAfter, type);
      ipcRenderer.send('add-notification', '已儲存自訂翻譯');
    } else {
      ipcRenderer.send('add-notification', '原文字數不足');
    }
  };

  // delete custom
  document.getElementById('button-delete-custom').onclick = () => {
    const textBefore = document.getElementById('textarea-before').value.replaceAll('\n', '').trim();
    const type = document.getElementById('select-type').value;

    if (textBefore.length > 1) {
      ipcRenderer.send('delete-user-custom', textBefore, type);
      ipcRenderer.send('add-notification', '已刪除自訂翻譯');
    } else {
      ipcRenderer.send('add-notification', '原文字數不足');
    }
  };

  // edit custom
  document.getElementById('button-edit-custom').onclick = () => {
    ipcRenderer.send('create-window', 'custom');
  };

  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-window');
  };
}

// read log
function readLog(id = '') {
  try {
    const config = ipcRenderer.sendSync('get-config');
    const milliseconds = parseInt(id.slice(2));
    const filePath = ipcRenderer.sendSync('get-path', logPath, createLogName(milliseconds));
    const log = ipcRenderer.sendSync('read-json', filePath, false);

    targetLog = log[id];

    if (targetLog) {
      // show audio
      showAudio();

      // show text
      showText();

      // set select-engine
      if (targetLog?.translation?.engine) {
        document.getElementById('select-engine').value = fixLogValue(
          targetLog.translation.engine,
          ['Youdao', 'Baidu', 'Caiyun', 'Papago', 'DeepL', 'GPT', 'Cohere', 'Gemini'],
          config.translation.engine
        );
      }

      // set select-from
      if (targetLog?.translation?.from) {
        document.getElementById('select-from').value = fixLogValue(
          targetLog.translation.from,
          ['Japanese', 'English', 'Traditional-Chinese', 'Simplified-Chinese'],
          config.translation.from
        );
      }

      // set select-to
      if (targetLog?.translation?.to) {
        document.getElementById('select-to').value = fixLogValue(
          targetLog.translation.to,
          ['Japanese', 'English', 'Traditional-Chinese', 'Simplified-Chinese'],
          config.translation.to
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

// show audio
function showAudio() {
  const text = targetLog.audio_text || targetLog.text;

  if (text !== '') {
    try {
      const urlList = ipcRenderer.sendSync('google-tts', text, targetLog.translation.from);
      console.log('TTS url:', urlList);

      let innerHTML = '';
      for (let index = 0; index < urlList.length; index++) {
        const url = urlList[index];

        innerHTML += `
                    <audio class="w-100" controls preload="metadata">
                        <source src="${url}" type="audio/ogg">
                        <source src="${url}" type="audio/mpeg">
                    </audio>
                    <br>
                `;
      }

      document.getElementById('div-audio').innerHTML = innerHTML;
    } catch (error) {
      console.log(error);
    }
  }
}

// show text
function showText() {
  const divText1 = document.getElementById('div-text1');
  const name1 = targetLog.name;
  const text1 = targetLog.text;

  const divText2 = document.getElementById('div-text2');
  const name2 = targetLog.translated_name;
  const text2 = targetLog.translated_text;

  divText1.innerHTML = `<span>${name1 !== '' ? name1 + '：<br>' : ''}${text1}</span>`;
  divText2.innerHTML = `<span>${name2 !== '' ? name2 + '：<br>' : ''}${text2}</span>`;
}

/*
// report translation
function reportTranslation() {
  // google form
  const formId = '1FAIpQLScj8LAAHzy_nTIbbJ1BSqNzyZy3w5wFrLxDVUMbY0BIAjaIAg';
  const entry1 = 'entry.195796166';
  const entry2 = 'entry.1834106335';
  const entry3 = 'entry.2057890818';
  const entry4 = 'entry.654133178';

  try {
    const text1 = (targetLog.name !== '' ? targetLog.name + ': ' : '') + targetLog.text;
    const text2 =
      (targetLog.translated_name !== '' ? targetLog.translated_name + ': ' : '') + targetLog.translated_text;
    const path =
      `/forms/d/e/${formId}/formResponse?` +
      `${entry1}=待處理` +
      `&${entry2}=${targetLog.translation.engine}` +
      `&${entry3}=${text1}` +
      `&${entry4}=${text2}`;

    ipcRenderer.send('post-form', encodeURI(path));
    ipcRenderer.send('show-info', '回報完成');
  } catch (error) {
    console.log(error);
    ipcRenderer.send('show-info', '' + error);
  }
}
*/

// fix log value
function fixLogValue(value = '', valueArray = [], defaultValue = '') {
  if (!valueArray.includes(value)) value = defaultValue;
  return value;
}

// create log name
function createLogName(milliseconds = null) {
  return ipcRenderer.sendSync('create-log-name', milliseconds);
}
