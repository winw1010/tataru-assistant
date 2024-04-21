'use strict';

// electron
const { ipcRenderer } = require('electron');

// image path
const imagePath = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'img');

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

  // send data
  ipcRenderer.on('send-data', (event, text) => {
    document.getElementById('textarea-screen-text').value = text;
  });
}

// set view
function setView() {
  const config = ipcRenderer.sendSync('get-config');
  document.getElementById('checkbox-split').checked = config.captureWindow.split;
  document.getElementById('img-captured').setAttribute('src', ipcRenderer.sendSync('get-path', imagePath, 'crop.png'));
}

// set event
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  // checkbox
  document.getElementById('checkbox-split').oninput = () => {
    let config = ipcRenderer.sendSync('get-config');
    config.captureWindow.split = document.getElementById('checkbox-split').checked;
    ipcRenderer.send('set-config', config);
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
    ipcRenderer.send('translate-image-text', document.getElementById('textarea-screen-text').value);
  };
}