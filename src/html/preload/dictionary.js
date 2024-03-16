'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

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
}

// set view
function setView() {
  const config = ipcRenderer.sendSync('get-config');
  document.getElementById('select_engine').value = config.translation.engine;
  document.getElementById('select_from').value = config.translation.from;
  document.getElementById('select_to').value = config.translation.to;
}

// set enevt
function setEvent() {}

// set button
function setButton() {
  // close
  document.getElementById('img_button_close').onclick = () => {
    ipcRenderer.send('close-window');
  };

  // exchange
  document.getElementById('button_switch').onclick = () => {
    const valueFrom = document.getElementById('select_from').value;
    document.getElementById('select_from').value =
      document.getElementById('select_to').value;
    document.getElementById('select_to').value = valueFrom;
  };

  // translate
  document.getElementById('button_translate').onclick = () => {
    const inputText = document
      .getElementById('textarea_original_text')
      .value?.trim()
      ?.replaceAll('\n', ' ');
    const dialogData = createDialogData(inputText);

    document.getElementById('span_translated_text').innerText = '...';
    document.getElementById('div_audio').innerHTML = '';

    if (inputText !== '') {
      if (document.getElementById('checkbox_text_fix').checked) {
        ipcRenderer.send('add-task', dialogData);
      } else {
        // translate
        ipcRenderer
          .invoke('translate-text', dialogData.text, dialogData.translation)
          .then((translatedText) => {
            // show translated text
            if (translatedText !== '') {
              document.getElementById('span_translated_text').innerText =
                translatedText;
              document.getElementById('div_audio').innerHTML = getAudioHtml(
                translatedText,
                document.getElementById('select_to').value
              );
            } else {
              document.getElementById('span_translated_text').innerText =
                '翻譯失敗，請稍後再試';
              document.getElementById('div_audio').innerHTML = '';
            }
          })
          .catch(console.log);
      }
    } else {
      document.getElementById('span_translated_text').innerText =
        '翻譯文字不可空白';
      document.getElementById('div_audio').innerHTML = '';
    }
  };
}

// create dialog data
function createDialogData(text) {
  const config = ipcRenderer.sendSync('get-config');

  let dialogData = {
    id: null,
    playerName: '',
    code: '003D',
    name: '',
    text: text,
    timestamp: null,
    translation: config.translation,
  };

  dialogData.translation.from = document.getElementById('select_from').value;
  dialogData.translation.fromPlayer =
    document.getElementById('select_from').value;
  dialogData.translation.to = document.getElementById('select_to').value;
  dialogData.translation.engine =
    document.getElementById('select_engine').value;

  return dialogData;
}

// get audio html
function getAudioHtml(translatedText, languageTo) {
  if (translatedText !== '') {
    try {
      const urlList = ipcRenderer.sendSync(
        'google-tts',
        translatedText,
        languageTo
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

      return innerHTML;
    } catch (error) {
      console.log(error);
      return '';
    }
  }
}
