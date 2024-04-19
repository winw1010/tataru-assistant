'use strict';

// electron
const { ipcRenderer } = require('electron');

const arrayParameters = {
  'player-name-table': { type: 'user', name: 'playerName' },
  'custom-target-table': { type: 'user', name: 'customTarget' },
  'custom-overwrite-table': { type: 'user', name: 'customOverwrite' },
  'custom-source-table': { type: 'user', name: 'customSource' },
  'temp-name-table': { type: 'user', name: 'tempName' },
};

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

  // create table
  ipcRenderer.on('create-table', () => {
    createTable();
  });
}

// set view
function setView() {
  createTable();
}

// set enevt
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  document.getElementById('select-table-type').onchange = () => {
    createTable();
  };
}

// set button
function setButton() {
  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-window');
  };

  // save custom
  document.getElementById('button-save-custom').onclick = () => {
    const textBefore = document.getElementById('textarea-before').value.replaceAll('\n', '').trim();
    const textAfter = document.getElementById('textarea-after').value.replaceAll('\n', '').trim();
    const type = document.getElementById('select-type').value;

    if (textBefore.length > 1) {
      ipcRenderer.send('save-user-custom', textBefore, textAfter, type);
      ipcRenderer.send('show-notification', '已儲存自訂翻譯');
    } else {
      ipcRenderer.send('show-notification', '原文字數不足');
    }
  };

  // delete custom
  document.getElementById('button-delete-custom').onclick = () => {
    const textBefore = document.getElementById('textarea-before').value.replaceAll('\n', '').trim();
    const type = document.getElementById('select-type').value;

    if (textBefore.length > 1) {
      ipcRenderer.send('delete-user-custom', textBefore, type);
      ipcRenderer.send('show-notification', '已刪除自訂翻譯');
    } else {
      ipcRenderer.send('show-notification', '原文字數不足');
    }
  };

  // search
  document.getElementById('button-search').onclick = () => {
    let keyword = document.getElementById('input-Keyword').value;
    createTable(keyword);
  };

  // view all
  document.getElementById('button-view-all').onclick = () => {
    createTable();
  };

  // import old data
  document.getElementById('button-import-old-data').onclick = () => {
    ipcRenderer.send('import-old-data');
  };
}

// create table
function createTable(keyword = '') {
  const tableType = document.getElementById('select-table-type').value;
  const arrayParameter = arrayParameters[tableType];
  const array = ipcRenderer.sendSync('get-user-array', arrayParameter.name);
  const tbody = document.getElementById('tbody-custom-table');
  let innerHTML = '';

  if (array.length > 0) {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      const text = element[0] || '';
      const translatedText = element[1] || '';
      const textType = element[2] || '';

      if (keyword !== '' && !text.includes(keyword) && !translatedText.includes(keyword)) continue;

      innerHTML += `
      <tr>
      <td id="text1-${index}">${text}</td>
      <td id="text2-${index}">${translatedText}</td>
      <td id="type-${index}">${textType}</td>
      <td><a id="edit-${index}" href="#">編輯</a></td>
      </tr>
      `;
    }
  } else {
    innerHTML += '<tr><td colspan="4">無資料</td></tr>';
  }

  tbody.innerHTML = innerHTML;

  for (let index = 0; index < array.length; index++) {
    const editButton = document.getElementById(`edit-${index}`);

    if (editButton) {
      editButton.onclick = () => {
        document.getElementById('textarea-before').value = document.getElementById(`text1-${index}`).innerText;
        document.getElementById('textarea-after').value = document.getElementById(`text2-${index}`).innerText;
      };
    }
  }
}
