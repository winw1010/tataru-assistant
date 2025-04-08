'use strict';

// electron
const { ipcRenderer } = require('electron');

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
  ipcRenderer.on('change-ui-text', async () => {
    const config = await ipcRenderer.invoke('get-config');
    document.dispatchEvent(new CustomEvent('change-ui-text', { detail: config }));
  });
}

// set view
async function setView() {
  await readLogList();

  // change UI text
  ipcRenderer.send('change-ui-text');
}

// set enevt
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });
}

// set button
function setButton() {
  // read
  document.getElementById('button-read-log').onclick = () => {
    const file = document.getElementById('select-log').value;
    readLog(file);
  };

  // view
  document.getElementById('button-view-log').onclick = async () => {
    const logPath = await ipcRenderer.invoke('get-user-data-path', 'log');
    ipcRenderer.send('execute-command', `start "" "${logPath}"`);
  };

  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-window');
  };
}

async function readLogList() {
  try {
    const logPath = await ipcRenderer.invoke('get-user-data-path', 'log');
    const logs = await ipcRenderer.invoke('read-directory', logPath);

    if (logs.length > 0) {
      const select = document.getElementById('select-log');

      let innerHTML = '';
      for (let index = 0; index < logs.length; index++) {
        const log = logs[index];
        innerHTML += `<option value="${log}">${log?.replace('.json', '')}</option>`;
      }

      select.innerHTML = innerHTML;
      select.value = logs[logs.length - 1];
    }
  } catch (error) {
    console.log(error);
  }
}

async function readLog(fileName) {
  if (fileName === 'none') {
    ipcRenderer.send('add-notification', 'FILE_NOT_FOUND');
    return;
  }

  try {
    const logPath = await ipcRenderer.invoke('get-user-data-path', 'log');
    const fileLocation = await ipcRenderer.invoke('get-path', logPath, fileName);
    const log = await ipcRenderer.invoke('read-json', fileLocation, false);
    const logNames = Object.keys(log);

    if (logNames.length > 0) {
      ipcRenderer.send('send-index', 'clear-dialog');

      for (let index = 0; index < logNames.length; index++) {
        const logItem = log[logNames[index]];

        if (logItem.code !== 'FFFF') {
          const dialogData = {
            id: logItem.id,
            code: logItem.code,
            translatedName: logItem.translated_name,
            translatedText: logItem.translated_text,
            translation: logItem.translation,
          };

          const scroll = index === logNames.length - 1;

          ipcRenderer.send('add-log', dialogData, scroll);
        }
      }
    }
  } catch (error) {
    console.log(error);
    ipcRenderer.send('add-notification', 'UNABLE_TO_READ_THE_FILE');
  }
}
