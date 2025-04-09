'use strict';

// electron
const { ipcRenderer } = require('electron');

const arrayParameters = {
  'player-name-table': { type: 'user', name: 'playerName' },
  'custom-target-table': { type: 'user', name: 'customTarget' },
  'custom-overwrite-table': { type: 'user', name: 'customOverwrite' },
  'custom-source-table': { type: 'user', name: 'customSource' },
  'temp-name-table': { type: 'user', name: 'tempName' },
  'temp-name-table-valid': { type: 'user', name: 'tempNameValid' },
};

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

  // create table
  ipcRenderer.on('create-table', async () => {
    await createTable();
  });
}

// set view
async function setView() {
  await createTable();

  // change UI text
  ipcRenderer.send('change-ui-text');
}

// set enevt
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  document.getElementById('select-table-type').onchange = async () => {
    await createTable();
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

  // search
  document.getElementById('button-search').onclick = async () => {
    let keyword = document.getElementById('input-Keyword').value;
    await createTable(keyword);
  };

  // view all
  document.getElementById('button-view-all').onclick = async () => {
    await createTable();
  };

  // view files
  document.getElementById('button-view-files').onclick = async () => {
    ipcRenderer.send('execute-command', `start "" "${await ipcRenderer.invoke('get-user-data-path', 'text')}"`);
  };

  // clear cache
  document.getElementById('button-clear-cache').onclick = () => {
    ipcRenderer.send('clear-cache');
  };
}

// create table
async function createTable(keyword = '') {
  const tableType = document.getElementById('select-table-type').value;
  const arrayParameter = arrayParameters[tableType];
  const array = await ipcRenderer.invoke('get-user-array', arrayParameter.name);
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
    innerHTML += '<tr><td colspan="4">No data</td></tr>';
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
