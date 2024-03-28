'use strict';

// electron
const { ipcRenderer } = require('electron');

const arrayParameters = {
  'custom-chinese-table': { type: 'ch', name: 'chTemp', textType: 'no-temp' },
  'custom-overwrite-table': { type: 'ch', name: 'overwriteTemp', textType: '' },
  'custom-replace-table': { type: 'game', name: 'replaceTemp', textType: '' },
  'tataru-chinese-table': { type: 'ch', name: 'combine', textType: '' },
  'tataru-overwrite-table': { type: 'ch', name: 'overwrite', textType: '' },
  'tataru-replace-table': { type: 'game', name: 'replace', textType: '' },
  'tataru-temp-table': { type: 'ch', name: 'chTemp', textType: 'temp-name' },
  'tataru-old-temp-table': { type: 'ch', name: 'chTemp', textType: 'temp' },
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

  document.getElementById('select-search-type').onchange = () => {
    document.getElementById('div-input-keyword').hidden = document.getElementById('select-search-type').value === 'all';
  };
}

// set button
function setButton() {
  // close
  document.getElementById('img_button_close').onclick = () => {
    ipcRenderer.send('close-window');
  };

  // search
  document.getElementById('button-search').onclick = () => {
    let keyword = '';

    if (document.getElementById('select-search-type').value !== 'all')
      keyword = document.getElementById('input-Keyword').value;

    createTable(keyword);
  };
}

// create table
function createTable(keyword = '') {
  const tableType = document.getElementById('select-table-type').value;
  const arrayParameter = arrayParameters[tableType];
  const array = ipcRenderer.sendSync('get-array', arrayParameter.type, arrayParameter.name);
  const tbody = document.getElementById('tbody-custom-table');
  let innerHTML = '';

  if (array.length > 0) {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      const text = element[0] || '';
      const translatedText = element[1] || '';
      const textType = element[2] || '';

      if (keyword !== '' && !text.includes(keyword) && !translatedText.includes(keyword)) continue;

      if (arrayParameter.textType !== '') {
        if (arrayParameter.textType === 'no-temp') {
          if (['temp', 'temp-name'].includes(textType)) continue;
        } else {
          if (arrayParameter.textType !== textType) continue;
        }
      }

      innerHTML += `
      <tr>
      <td>${element[0]}</td>
      <td>${element[1]}</td>
      </tr>
      `;
    }
  } else {
    innerHTML += '<tr><td colspan="3">無資料</td></tr>';
  }

  tbody.innerHTML = innerHTML;
}
