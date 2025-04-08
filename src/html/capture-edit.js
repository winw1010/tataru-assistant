'use strict';

// electron
const { ipcRenderer } = require('electron');

// capture data
let captureData = {};

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

  // send data
  ipcRenderer.on('send-data', (event, data) => {
    captureData = data;
    document.getElementById('textarea-screen-text').value = captureData.text;
  });
}

// set view
async function setView() {
  const config = await ipcRenderer.invoke('get-config');
  document.getElementById('checkbox-split').checked = config.captureWindow.split;
  document
    .getElementById('img-captured')
    .setAttribute('src', await ipcRenderer.invoke('get-root-path', 'src', 'data', 'img', 'cropped.png'));

  // change UI text
  ipcRenderer.send('change-ui-text');
}

// set event
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  // checkbox
  document.getElementById('checkbox-split').oninput = async () => {
    const config = await ipcRenderer.invoke('get-config');
    config.captureWindow.split = document.getElementById('checkbox-split').checked;
    await ipcRenderer.invoke('set-config', config);
  };
}

// set button
function setButton() {
  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-window');
  };

  // page
  document.getElementsByName('btnradio').forEach((btnradio) => {
    btnradio.onclick = () => {
      document.querySelectorAll('.div-page').forEach((page) => {
        document.getElementById(page.id).hidden = true;
      });
      document.getElementById(btnradio.value).hidden = false;
    };
  });

  // translate
  document.getElementById('button-translate').onclick = () => {
    captureData.text = document.getElementById('textarea-screen-text').value;
    captureData.split = document.getElementById('checkbox-split').checked;
    ipcRenderer.send('translate-image-text', captureData);
  };
}
