'use strict';

// electron
const { ipcRenderer } = require('electron');

const arrayParameters = {
  'custom-chinese-table': { type: 'ch', name: 'chTemp', textType: 'no-temp' },
  'custom-overwrite-table': { type: 'ch', name: 'overwriteTemp', textType: 'all' },
  'custom-replace-table': { type: 'game', name: 'replaceTemp', textType: 'all' },
  'app-temp-table': { type: 'ch', name: 'chTemp', textType: 'temp-name' },
  'app-old-temp-table': { type: 'ch', name: 'chTemp', textType: 'temp' },
  'app-combine': { type: 'ch', name: 'combine', textType: 'all' },
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
    createTable(document.getElementById('select-table-type').value);
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

    createTable(document.getElementById('select-table-type').value, keyword);
  };
}

// create table
function createTable(type = '', keyword = '') {
  if (type === '') type = document.getElementById('select-table-type').value;

  const arrayParameter = arrayParameters[type];
  const array = ipcRenderer.sendSync('get-array', arrayParameter.type, arrayParameter.name);
  const tbody = document.getElementById('tbody-custom-table');
  let innerHTML = '';

  if (array.length > 0) {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];

      if (keyword !== '' && !element[0].includes(keyword) && !element[1].includes(keyword)) continue;

      innerHTML += `
      <tr>
      <td>${element[0]}</td>
      <td>${element[1]}</td>
      <td></td>
      </tr>
      `;
    }
  } else {
    innerHTML += '<tr><td colspan="3">無資料</td></tr>';
  }

  tbody.innerHTML = innerHTML;
}
