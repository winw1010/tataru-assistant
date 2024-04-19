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
  ipcRenderer.on('change-ui-text', () => {
    const config = ipcRenderer.sendSync('get-config');
    document.dispatchEvent(new CustomEvent('change-ui-text', { detail: config }));
  });

  // send data
  ipcRenderer.on('send-data', (event, divId) => {
    document.getElementById('select-option').value = divId;
    document.querySelectorAll('.config-page').forEach((value) => {
      document.getElementById(value.id).hidden = true;
    });
    document.getElementById(divId).hidden = false;
  });
}

// set view
function setView() {
  document.getElementById('select-engine').innerHTML = ipcRenderer.sendSync('get-engine-select');

  document.getElementById('select-from').innerHTML = ipcRenderer.sendSync('get-source-select');

  document.getElementById('select-from-player').innerHTML = ipcRenderer.sendSync('get-source-select');

  document.getElementById('select-to').innerHTML = ipcRenderer.sendSync('get-target-select');

  document.getElementById('select-app-language').innerHTML = ipcRenderer.sendSync('get-ui-select');

  readConfig();

  readGptModelList();
}

// set event
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  // background color
  setOnInputEvent('input-background-color', 'span-background-color');

  // background transparency
  setOnInputEvent('input-background-transparency', 'span-background-transparency');

  // speech speed
  setOnInputEvent('input-speech-speed', 'span-speech-speed');

  // dialog color
  setOnInputEvent('input-dialog-color', 'span-dialog-color');

  // dialog transparency
  setOnInputEvent('input-dialog-transparency', 'span-dialog-transparency');

  // input-gpt-api-key
  document.getElementById('input-gpt-api-key').onchange = () => {
    readGptModelList();
  };
}

// set button
function setButton() {
  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-window');
  };

  // page
  document.getElementById('select-option').onchange = () => {
    const value = document.getElementById('select-option').value;
    document.querySelectorAll('.config-page').forEach((page) => {
      document.getElementById(page.id).hidden = true;
    });
    document.getElementById(value).hidden = false;
  };

  // download json
  document.getElementById('button-download-json').onclick = () => {
    ipcRenderer.send('download-json');
  };

  // version check
  document.getElementById('button-version-check').onclick = () => {
    ipcRenderer.send('version-check');
  };

  // restart sharlayan reader
  document.getElementById('button-restart-sharlayan-reader').onclick = () => {
    ipcRenderer.send('restart-sharlayan-reader');
  };

  // get set google vision
  document.getElementById('a-set-google-vision').onclick = () => {
    const path = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'text', 'readme', 'sub-google-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set cohere api
  document.getElementById('a-set-cohere-api').onclick = () => {
    const path = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'text', 'readme', 'sub-cohere-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set gpt api
  document.getElementById('a-set-gpt-api').onclick = () => {
    const path = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'text', 'readme', 'sub-gpt-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set unofficial api
  document.getElementById('a-set-unofficial-api').onclick = () => {
    const path = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'text', 'readme', 'sub-unofficial-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set google credential
  document.getElementById('button-google-credential').onclick = () => {
    ipcRenderer.send('set-google-credential');
  };

  // set img-visibility
  const imgVisibilityButtons = document.getElementsByClassName('img-visibility');
  for (let index = 0; index < imgVisibilityButtons.length; index++) {
    let isVisible = false;
    const element = imgVisibilityButtons[index];
    element.onclick = () => {
      const imgId = element.id;
      const inputId = imgId.replace('img-visibility', 'input');
      isVisible = !isVisible;
      if (isVisible) {
        document.getElementById(imgId).setAttribute('src', './img/ui/visibility_white_48dp.svg');
        document.getElementById(inputId).setAttribute('type', 'text');
      } else {
        document.getElementById(imgId).setAttribute('src', './img/ui/visibility_off_white_48dp.svg');
        document.getElementById(inputId).setAttribute('type', 'password');
      }
    };
  }

  // set unofficial api toggle button
  document.getElementById('p-unoffcia-api').onclick = () => {
    document.getElementById('div-unoffcia-api').classList.toggle('hide-toggle');
    document.getElementById('input-unofficial-api-url').scrollIntoView();
  };

  // readme
  document.getElementById('a-readme').onclick = () => {
    const path = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'text', 'readme', 'index.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // bug report
  document.getElementById('a-bug-report').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://forms.gle/1iX2Gq4G1itCy3UH9"');
  };

  // view response
  document.getElementById('a-view-response').onclick = () => {
    ipcRenderer.send(
      'execute-command',
      'explorer "https://docs.google.com/spreadsheets/d/1unaPwKFwJAQ9iSnNJ063BAjET5bRGybp5fxxvcG-Wr8/edit?usp=sharing"'
    );
  };

  /*
  // translation report
  document.getElementById('a-translation-report').onclick = () => {
    ipcRenderer.send(
      'execute-command',
      'explorer "https://github.com/winw1010/tataru-assistant-text#%E7%BF%BB%E8%AD%AF%E9%8C%AF%E8%AA%A4%E5%9B%9E%E5%A0%B1%E6%96%B9%E5%BC%8F"'
    );
  };
  */

  // github
  document.getElementById('a-github').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://github.com/winw1010/tataru-assistant"');
  };

  // author
  document.getElementById('a-author').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
  };

  // donate
  document.getElementById('a-donate').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://www.buymeacoffee.com/winw1010"');
  };

  // default
  document.getElementById('button-save-default-config').onclick = () => {
    saveDefaultConfig();
  };

  // save
  document.getElementById('button-save-config').onclick = () => {
    saveConfig();
  };
}

// read config
function readConfig() {
  const config = ipcRenderer.sendSync('get-config');
  const chatCode = ipcRenderer.sendSync('get-chat-code');
  const version = ipcRenderer.sendSync('get-version');

  // read options
  readOptions(config);

  // channel
  readChannel(config, chatCode);

  // about
  document.getElementById('span-version').innerText = version;
}

// save config
function saveConfig() {
  let config = ipcRenderer.sendSync('get-config');
  let chatCode = ipcRenderer.sendSync('get-chat-code');

  // save options
  saveOptions(config);

  // window backgroundColor
  let windowColor = document.getElementById('input-background-color').value;
  let windowTransparent = parseInt(document.getElementById('input-background-transparency').value).toString(16);
  config.indexWindow.backgroundColor = windowColor + windowTransparent.padStart(2, '0');

  // dialog backgroundColor
  let dialogColor = document.getElementById('input-dialog-color').value;
  let dialogTransparent = parseInt(document.getElementById('input-dialog-transparency').value).toString(16);
  config.dialog.backgroundColor = dialogColor + dialogTransparent.padStart(2, '0');

  // save channel
  saveChannel(config, chatCode);

  // set config
  ipcRenderer.sendSync('set-config', config);

  // set chat code
  ipcRenderer.sendSync('set-chat-code', chatCode);

  // reset app
  resetApp(config);

  // reset config
  readConfig();

  // show notification
  ipcRenderer.send('show-notification', '設定已儲存');
}

// save default config
function saveDefaultConfig() {
  // set default config
  const config = ipcRenderer.sendSync('set-default-config');

  // set default chat code
  ipcRenderer.sendSync('set-default-chat-code');

  // reset app
  resetApp(config);

  // reset config
  readConfig();

  // show notification
  ipcRenderer.send('show-notification', '已恢復預設值');
}

// reset app
function resetApp(config) {
  // load json
  ipcRenderer.send('load-json');

  // reset view
  ipcRenderer.send('send-index', 'reset-view', config);

  // change UI text
  ipcRenderer.send('change-ui-text');

  // set global shortcut
  ipcRenderer.send('set-global-shortcut');
}

// read GPT model list
async function readGptModelList() {
  const apiKey = document.getElementById('input-gpt-api-key').value;

  if (apiKey.length > 0) {
    const config = ipcRenderer.sendSync('get-config');
    const array = await ipcRenderer.invoke('get-gpt-model-list', apiKey);
    const selectGptModel = document.getElementById('select-gpt-model');

    if (array.length > 0) {
      let innerHTML = '';

      for (let index = 0; index < array.length; index++) {
        const modelId = array[index];
        const isDisabled = modelId.includes('#');
        innerHTML += `<option value="${modelId}" ${isDisabled ? 'disabled' : ''}>${modelId}</option>`;
      }

      selectGptModel.innerHTML = innerHTML;

      if (config.system.gptModel.length > 0) {
        selectGptModel.value = config.system.gptModel;
      }
    } else {
      selectGptModel.innerHTML = '<option value="none" selected>None</option>';
    }
  }
}

// set on input event
function setOnInputEvent(inputId = '', spanId = '') {
  document.getElementById(inputId).oninput = () => {
    document.getElementById(spanId).innerText = document.getElementById(inputId).value;
  };
}

// read channel
function readChannel(config, chatCode) {
  const channel = document.getElementById('div-channel-list');
  let newInnerHTML = '';

  for (let index = 0; index < chatCode.length; index++) {
    const element = chatCode[index];
    const checkboxId = `checkbox-${element.ChatCode}`;
    const colorId = `input-${element.ChatCode}-color`;
    const spanId = `span-${element.ChatCode}-color`;
    let checked, color;

    if (config.channel[element.ChatCode]) {
      checked = 'checked';
      color = config.channel[element.ChatCode];
    } else {
      checked = '';
      color = element.Color;
    }

    newInnerHTML += `
            <hr />
            <div class="row align-items-center">
                <div class="col">
                    <div class="form-check form-switch">
                        <input type="checkbox" class="form-check-input" role="switch" value="" id="${checkboxId}" ${checked} />
                        <label class="form-check-label" for="${checkboxId}">${element.Name}</label>
                    </div>
                </div>
                <div class="col-auto">
                    <span id="${spanId}" style="color:${color};">${color}</span>
                </div>
                <div class="col-auto">
                    <input type="color" class="form-control form-control-color" value="${color}" id="${colorId}" />
                </div>
            </div>
        `;
  }

  channel.innerHTML = newInnerHTML;

  for (let index = 0; index < chatCode.length; index++) {
    const element = chatCode[index];
    setOnInputEvent(`input-${element.ChatCode}-color`, `span-${element.ChatCode}-color`);
  }
}

function saveChannel(config = {}, chatCode = {}) {
  config.channel = {};

  // checked color
  const checkedArray = document.querySelectorAll('#div-channel input[type="checkbox"]:checked');
  for (let index = 0; index < checkedArray.length; index++) {
    const code = checkedArray[index].id.replaceAll('checkbox-', '');
    config.channel[code] = document.getElementById(`input-${code}-color`).value;
  }

  // all color
  const channelArray = document.querySelectorAll('#div-channel input[type="checkbox"]');
  for (let index = 0; index < channelArray.length; index++) {
    const code = channelArray[index].id.replaceAll('checkbox-', '');
    chatCode[index].Color = document.getElementById(`input-${code}-color`).value;
  }
}

function readOptions(config = {}) {
  getOptionList().forEach((value) => {
    const elementId = value[0][0];
    const elementProperty = value[0][1];
    const configIndex1 = value[1][0];
    const configIndex2 = value[1][1];
    const valueFunction = value[2];

    let configValue = config[configIndex1][configIndex2];
    if (valueFunction) {
      configValue = valueFunction(configValue);
    }

    document.getElementById(elementId)[elementProperty] = configValue;
  });
}

function saveOptions(config = {}) {
  getOptionList().forEach((value) => {
    const elementId = value[0][0];
    const elementProperty = value[0][1];
    const configIndex1 = value[1][0];
    const configIndex2 = value[1][1];

    if (configIndex2 !== 'backgroundColor') {
      config[configIndex1][configIndex2] = document.getElementById(elementId)[elementProperty];
    }
  });
}

function getOptionList() {
  return [
    // window
    [
      ['checkbox-top', 'checked'],
      ['indexWindow', 'alwaysOnTop'],
    ],
    [
      ['checkbox-shortcut', 'checked'],
      ['indexWindow', 'shortcut'],
    ],
    [
      ['checkbox-min-size', 'checked'],
      ['indexWindow', 'minSize'],
    ],
    [
      ['checkbox-hide-button', 'checked'],
      ['indexWindow', 'hideButton'],
    ],
    [
      ['checkbox-hide-dialog', 'checked'],
      ['indexWindow', 'hideDialog'],
    ],
    [
      ['input-hide-dialog', 'value'],
      ['indexWindow', 'hideDialogTimeout'],
    ],
    [
      ['span-background-color', 'innerText'],
      ['indexWindow', 'backgroundColor'],
      (value) => {
        return value.slice(0, 7);
      },
    ],
    [
      ['input-background-color', 'value'],
      ['indexWindow', 'backgroundColor'],
      (value) => {
        return value.slice(0, 7);
      },
    ],
    [
      ['span-background-transparency', 'innerText'],
      ['indexWindow', 'backgroundColor'],
      (value) => {
        return parseInt(value.slice(7), 16);
      },
    ],
    [
      ['input-background-transparency', 'value'],
      ['indexWindow', 'backgroundColor'],
      (value) => {
        return parseInt(value.slice(7), 16);
      },
    ],
    [
      ['span-speech-speed', 'innerText'],
      ['indexWindow', 'speechSpeed'],
    ],
    [
      ['input-speech-speed', 'value'],
      ['indexWindow', 'speechSpeed'],
    ],

    // font
    [
      ['select-font-weight', 'value'],
      ['dialog', 'weight'],
    ],
    [
      ['input-font-size', 'value'],
      ['dialog', 'fontSize'],
    ],
    [
      ['input-dialog-spacing', 'value'],
      ['dialog', 'spacing'],
    ],
    [
      ['input-dialog-radius', 'value'],
      ['dialog', 'radius'],
    ],
    [
      ['span-dialog-color', 'innerText'],
      ['dialog', 'backgroundColor'],
      (value) => {
        return value.slice(0, 7);
      },
    ],
    [
      ['input-dialog-color', 'value'],
      ['dialog', 'backgroundColor'],
      (value) => {
        return value.slice(0, 7);
      },
    ],
    [
      ['span-dialog-transparency', 'innerText'],
      ['dialog', 'backgroundColor'],
      (value) => {
        return parseInt(value.slice(7), 16);
      },
    ],
    [
      ['input-dialog-transparency', 'value'],
      ['dialog', 'backgroundColor'],
      (value) => {
        return parseInt(value.slice(7), 16);
      },
    ],

    // translation
    [
      ['checkbox-auto-change', 'checked'],
      ['translation', 'autoChange'],
    ],
    [
      ['checkbox-fix-translation', 'checked'],
      ['translation', 'fix'],
    ],
    [
      ['checkbox-skip-system', 'checked'],
      ['translation', 'skip'],
    ],
    [
      ['checkbox-skip-chinese', 'checked'],
      ['translation', 'skipChinese'],
    ],
    [
      ['select-engine', 'value'],
      ['translation', 'engine'],
    ],
    [
      ['select-from', 'value'],
      ['translation', 'from'],
    ],
    [
      ['select-from-player', 'value'],
      ['translation', 'fromPlayer'],
    ],
    [
      ['select-to', 'value'],
      ['translation', 'to'],
    ],

    // api
    [
      ['input-cohere-token', 'value'],
      ['system', 'cohereToken'],
    ],
    [
      ['input-gpt-api-key', 'value'],
      ['system', 'gptApiKey'],
    ],
    [
      ['select-gpt-model', 'value'],
      ['system', 'gptModel'],
    ],

    // unofficial api
    [
      ['checkbox-unofficial-api', 'checked'],
      ['system', 'UnofficialApi'],
    ],
    [
      ['input-unofficial-api-url', 'value'],
      ['system', 'unofficialApiUrl'],
    ],

    // system
    [
      ['select-app-language', 'value'],
      ['system', 'appLanguage'],
    ],
    [
      ['checkbox-auto-download-json', 'checked'],
      ['system', 'autoDownloadJson'],
    ],
    [
      ['checkbox-ssl-certificate', 'checked'],
      ['system', 'sslCertificate'],
    ],
  ];
}
