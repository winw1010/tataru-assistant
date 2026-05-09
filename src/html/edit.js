'use strict';

// electron
const { ipcRenderer } = require('electron');

// all language list
const allLanguageList = ['Japanese', 'English', 'Traditional-Chinese', 'Simplified-Chinese', 'Korean', 'Russian', 'Italian'];

// target log
let targetLog = null;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
  setIPC();
  await setView();
  setEvent();
  setButton();
});

// set IPC
function setIPC() {
  // change UI text
  ipcRenderer.on('change-ui-text', async () => {
    const config = await ipcRenderer.invoke('get-config');
    document.dispatchEvent(new CustomEvent('change-ui-text', { detail: config }));
  });

  // send data
  ipcRenderer.on('send-data', async (event, id) => {
    await readLog(id);
  });
}

// set view
async function setView() {
  const config = await ipcRenderer.invoke('get-config');

  document.getElementById('select-engine').innerHTML = await ipcRenderer.invoke('get-engine-select');
  document.getElementById('select-from').innerHTML = await ipcRenderer.invoke('get-source-select');
  document.getElementById('select-to').innerHTML = await ipcRenderer.invoke('get-target-select');

  document.getElementById('select-engine').value = config.translation.engine;
  document.getElementById('select-from').value = config.translation.from;
  document.getElementById('select-to').value = config.translation.to;

  document.getElementById('checkbox-replace').checked = config.translation.replace;

  // change UI text
  ipcRenderer.send('change-ui-text');
}

// set event
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  document.getElementById('checkbox-replace').oninput = async () => {
    const config = await ipcRenderer.invoke('get-config');
    config.translation.replace = document.getElementById('checkbox-replace').checked;
    await ipcRenderer.invoke('set-config', config);
  };
}

// set button
function setButton() {
  // restart
  document.getElementById('button-restart-translate').onclick = async () => {
    const config = await ipcRenderer.invoke('get-config');

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

  // report
  document.getElementById('button-report-translation').onclick = () => {
    ipcRenderer.send('open-report-page');
  };

  // remove dialog
  document.getElementById('button-remove-dialog').onclick = () => {
    if (targetLog) {
      ipcRenderer.send('remove-dialog', targetLog.id);
    }
  };

  // save custom
  document.getElementById('button-save-custom').onclick = () => {
    const textBefore = document.getElementById('textarea-before').value.replaceAll('\n', '').trim();
    const textAfter = document.getElementById('textarea-after').value.replaceAll('\n', '').trim();
    const type = document.getElementById('select-type').value;

    if (textBefore.length > 1) {
      ipcRenderer.send('save-user-custom', textBefore, textAfter, type);
      ipcRenderer.send('add-notification', 'WORD_SAVED');
    } else {
      ipcRenderer.send('add-notification', 'LENGTH_TOO_SHORT');
    }
  };

  // delete custom
  document.getElementById('button-delete-custom').onclick = () => {
    const textBefore = document.getElementById('textarea-before').value.replaceAll('\n', '').trim();
    const type = document.getElementById('select-type').value;

    if (textBefore.length > 1) {
      ipcRenderer.send('delete-user-custom', textBefore, type);
      ipcRenderer.send('add-notification', 'WORD_DELETED');
    } else {
      ipcRenderer.send('add-notification', 'LENGTH_TOO_SHORT');
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
async function readLog(id = '') {
  const logPath = await ipcRenderer.invoke('get-user-data-path', 'log');

  try {
    const config = await ipcRenderer.invoke('get-config');
    const milliseconds = parseInt(id.slice(2));
    const filePath = await ipcRenderer.invoke('get-path', logPath, await createLogName(milliseconds));
    const log = await ipcRenderer.invoke('read-json', filePath, false);

    targetLog = log[id];

    if (targetLog) {
      // show audio
      await showAudio();

      // show text
      showText();

      // set select-engine
      if (targetLog?.translation?.engine) {
        document.getElementById('select-engine').value = fixLogValue(
          targetLog.translation.engine,
          ['Youdao', 'Baidu', 'Caiyun', 'Papago', 'DeepL', 'GPT', 'Cohere', 'Gemini', 'Kimi', 'LLM-API'],
          config.translation.engine,
        );
      }

      // set select-from
      if (targetLog?.translation?.from) {
        document.getElementById('select-from').value = fixLogValue(targetLog.translation.from, allLanguageList, config.translation.from);
      }

      // set select-to
      if (targetLog?.translation?.to) {
        document.getElementById('select-to').value = fixLogValue(targetLog.translation.to, allLanguageList, config.translation.to);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

// show audio
async function showAudio() {
  const text = targetLog.audio_text || targetLog.text;

  if (text !== '') {
    try {
      const urlList = await ipcRenderer.invoke('google-tts', text, targetLog.translation.from);
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

// fix log value
function fixLogValue(value = '', valueArray = [], defaultValue = '') {
  if (!valueArray.includes(value)) value = defaultValue;
  return value;
}

// create log name
async function createLogName(milliseconds = null) {
  return await ipcRenderer.invoke('create-log-name', milliseconds);
}
