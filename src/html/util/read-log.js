'use strict';

// electron
const { ipcRenderer } = require('electron');

// log location
const logPath = ipcRenderer.sendSync('get-user-data-path', 'log');

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
}

// set view
function setView() {
  readLogList();
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
  document.getElementById('button-view-log').onclick = () => {
    ipcRenderer.send('execute-command', `start "" "${logPath}"`);
  };

  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-window');
  };
}

function readLogList() {
  try {
    const logs = ipcRenderer.sendSync('read-directory', logPath);

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

function readLog(fileName) {
  if (fileName === 'none') {
    ipcRenderer.send('show-notification', '檔案不存在');
    return;
  }

  try {
    const fileLocation = ipcRenderer.sendSync('get-path', logPath, fileName);
    const log = ipcRenderer.sendSync('read-json', fileLocation, false);
    const logNames = Object.getOwnPropertyNames(log);

    if (logNames.length > 0) {
      ipcRenderer.send('send-index', 'clear-dialog');

      for (let index = 0; index < logNames.length; index++) {
        const logElement = log[logNames[index]];

        if (logElement.code !== 'FFFF') {
          ipcRenderer.send(
            'add-log',
            logElement.id,
            logElement.code,
            logElement.translated_name,
            logElement.translated_text
          );
        }
      }

      ipcRenderer.send('send-index', 'move-to-bottom');
    }
  } catch (error) {
    console.log(error);
    ipcRenderer.send('show-notification', '無法讀取檔案');
  }
}
