'use strict';

// electron
const { ipcRenderer } = require('electron');

const arrayParameters = {
  'player-name-table': { type: 'user', name: 'playerName' },
  'custom-target-table': { type: 'user', name: 'customTarget' },
  'custom-overwrite-table': { type: 'user', name: 'customOverwrite' },
  'custom-source-table': { type: 'user', name: 'customSource' },
};

// No kanji
const regNoKanji = /^[^\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF]+$/;

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
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-window');
  };

  // save custom
  document.getElementById('button-save-custom').onclick = () => {
    const textBefore = document.getElementById('textarea-before').value.replaceAll('\n', '').trim();
    const textAfter = document.getElementById('textarea-after').value.replaceAll('\n', '').trim();
    const type = document.getElementById('select-type').value;

    let fileName = '';
    let textBefore2 = textBefore;
    let array = [];

    if (textBefore.length > 1) {
      if (type === 'custom-source') {
        fileName = 'custom-source.json';
        if (textBefore2.length < 3 && regNoKanji.test(textBefore2)) textBefore2 += '#';
        array.push([textBefore2, textAfter]);
      } else if (type === 'custom-overwrite') {
        fileName = 'custom-overwrite.json';
        array.push([textBefore2, textAfter]);
      } else if (type === 'player' || type === 'retainer') {
        fileName = 'player-name.json';
        if (textBefore2.length < 3 && regNoKanji.test(textBefore2)) textBefore2 += '#';
        array.push([textBefore2, textAfter, type]);
      } else {
        fileName = 'custom-target.json';
        if (textBefore2.length < 3 && regNoKanji.test(textBefore2)) textBefore2 += '#';
        array.push([textBefore2, textAfter, type]);
      }

      ipcRenderer.send('save-user-custom', fileName, array);
      ipcRenderer.send('show-notification', '已儲存自訂翻譯');
      createTable();
    } else {
      ipcRenderer.send('show-notification', '原文字數不足');
    }
  };

  // delete custom
  document.getElementById('button-delete-custom').onclick = () => {
    const textBefore = document.getElementById('textarea-before').value.replaceAll('\n', '').trim();
    const type = document.getElementById('select-type').value;

    let fileName = '';
    let textBefore2 = textBefore;

    if (textBefore.length > 1) {
      if (type === 'custom-source') {
        fileName = 'custom-source.json';
        if (textBefore2.length < 3 && regNoKanji.test(textBefore2)) textBefore2 += '#';
      } else if (type === 'custom-overwrite') {
        fileName = 'custom-overwrite.json';
      } else if (type === 'player' || type === 'retainer') {
        fileName = 'player-name.json';
        if (textBefore2.length < 3 && regNoKanji.test(textBefore2)) textBefore2 += '#';
      } else {
        fileName = 'custom-target.json';
        if (textBefore2.length < 3 && regNoKanji.test(textBefore2)) textBefore2 += '#';
      }

      ipcRenderer.send('delete-user-custom', fileName, textBefore2);
      ipcRenderer.send('show-notification', '已刪除自訂翻譯');
      createTable();
    } else {
      ipcRenderer.send('show-notification', '原文字數不足');
    }
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
