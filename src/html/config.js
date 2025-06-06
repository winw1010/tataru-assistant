'use strict';

// electron
const { ipcRenderer } = require('electron');

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
async function setView() {
  document.getElementById('select-engine').innerHTML = await ipcRenderer.invoke('get-engine-select');

  document.getElementById('select-engine-alternate').innerHTML = await ipcRenderer.invoke('get-engine-select');

  document.getElementById('select-from').innerHTML = await ipcRenderer.invoke('get-source-select');

  document.getElementById('select-from-player').innerHTML = await ipcRenderer.invoke('get-player-source-select');

  document.getElementById('select-to').innerHTML = await ipcRenderer.invoke('get-target-select');

  //document.getElementById('select-app-language').innerHTML = await ipcRenderer.invoke('get-ui-select');

  await readConfig();

  const googleVisionType = document.getElementById('select-google-vision-type').value;
  document.getElementById('div-' + googleVisionType).hidden = false;

  // change UI text
  ipcRenderer.send('change-ui-text');
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

  // select-google-vision-type
  document.getElementById('select-google-vision-type').onchange = () => {
    const googleVisionType = document.getElementById('select-google-vision-type').value;
    const divs = document.getElementsByClassName('div-google-vision-type');

    for (let index = 0; index < divs.length; index++) {
      const element = divs[index];
      element.hidden = true;
    }

    document.getElementById('div-' + googleVisionType).hidden = false;
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

  // delete temp
  document.getElementById('button-delete-temp').onclick = () => {
    ipcRenderer.send('delete-temp');
  };

  // restart sharlayan reader
  document.getElementById('button-restart-sharlayan-reader').onclick = () => {
    ipcRenderer.send('restart-sharlayan-reader');
  };

  // version check
  document.getElementById('button-version-check').onclick = () => {
    ipcRenderer.send('version-check');
  };

  // fix reader
  document.getElementById('button-fix-reader').onclick = () => {
    ipcRenderer.send('fix-reader');
  };

  // get set google vision
  document.getElementById('a-set-google-vision').onclick = async () => {
    const path = await ipcRenderer.invoke('get-root-path', 'src', 'data', 'text', 'readme', 'sub-google-vision-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set cohere api
  document.getElementById('a-set-gemini-api').onclick = async () => {
    const path = await ipcRenderer.invoke('get-root-path', 'src', 'data', 'text', 'readme', 'sub-gemini-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set cohere api
  document.getElementById('a-set-cohere-api').onclick = async () => {
    const path = await ipcRenderer.invoke('get-root-path', 'src', 'data', 'text', 'readme', 'sub-cohere-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  document.getElementById('a-set-kimi-api').onclick = async () => {
    const path = await ipcRenderer.invoke('get-root-path', 'src', 'data', 'text', 'readme', 'sub-kimi-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set gpt api
  document.getElementById('a-set-gpt-api').onclick = async () => {
    const path = await ipcRenderer.invoke('get-root-path', 'src', 'data', 'text', 'readme', 'sub-gpt-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set LLM API
  document.getElementById('a-set-llm-api').onclick = async () => {
    const path = await ipcRenderer.invoke('get-root-path', 'src', 'data', 'text', 'readme', 'sub-llm-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // open google credential
  document.getElementById('button-google-credential').onclick = () => {
    ipcRenderer.send('set-google-credential');
  };

  // view google credential
  document.getElementById('button-google-credential-view').onclick = async () => {
    const path = await ipcRenderer.invoke('get-user-data-path', 'config');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
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

  // readme
  document.getElementById('a-readme').onclick = async () => {
    const path = await ipcRenderer.invoke('get-root-path', 'src', 'data', 'text', 'readme', 'index.html');
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
  document.getElementById('button-save-default-config').onclick = async () => {
    await saveDefaultConfig();
  };

  // save
  document.getElementById('button-save-config').onclick = async () => {
    await saveConfig();
  };
}

// read config
async function readConfig() {
  const config = await ipcRenderer.invoke('get-config');
  const chatCode = await ipcRenderer.invoke('get-chat-code');
  const version = await ipcRenderer.invoke('get-version');

  // read options
  readOptions(config);

  // channel
  readChannel(config, chatCode);

  // about
  document.getElementById('span-version').innerText = version;
}

// save config
async function saveConfig() {
  const config = await ipcRenderer.invoke('get-config');
  const chatCode = await ipcRenderer.invoke('get-chat-code');

  // save options
  saveOptions(config);

  // window backgroundColor
  const windowColor = document.getElementById('input-background-color').value;
  const windowTransparent = parseInt(document.getElementById('input-background-transparency').value).toString(16);
  config.indexWindow.backgroundColor = windowColor + windowTransparent.padStart(2, '0');

  // dialog backgroundColor
  const dialogColor = document.getElementById('input-dialog-color').value;
  const dialogTransparent = parseInt(document.getElementById('input-dialog-transparency').value).toString(16);
  config.dialog.backgroundColor = dialogColor + dialogTransparent.padStart(2, '0');

  // save channel
  saveChannel(config, chatCode);

  // set config
  await ipcRenderer.invoke('set-config', config);

  // set chat code
  await ipcRenderer.invoke('set-chat-code', chatCode);

  // reset app
  resetApp(config);

  // reset config
  await readConfig();

  // add notification
  ipcRenderer.send('add-notification', 'SETTINGS_SAVED');
}

// save default config
async function saveDefaultConfig() {
  // set default config
  const config = await ipcRenderer.invoke('set-default-config');

  // set default chat code
  await ipcRenderer.invoke('set-default-chat-code');

  // reset app
  resetApp(config);

  // reset config
  await readConfig();

  // add notification
  ipcRenderer.send('add-notification', 'RESTORED_TO_DEFAULT_SETTINGS');
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
    const labelId = `label-${element.ChatCode}`;
    const spanId = `span-${element.ChatCode}`;
    const inputId = `input-${element.ChatCode}`;
    const checked = config.channel[element.ChatCode] ? 'checked' : '';
    const color = element.Color;

    newInnerHTML += `
            <hr />
            <div class="row align-items-center">
                <div class="col">
                    <div class="form-check form-switch">
                        <input type="checkbox" class="form-check-input" role="switch" value="" id="${checkboxId}" ${checked} />
                        <label class="form-check-label" for="${checkboxId}" id="${labelId}">${element.Name}</label>
                    </div>
                </div>
                <div class="col-auto">
                    <span id="${spanId}" style="color:${color};">${color}</span>
                </div>
                <div class="col-auto">
                    <input type="color" class="form-control form-control-color" value="${color}" id="${inputId}" />
                </div>
            </div>
        `;
  }

  channel.innerHTML = newInnerHTML;

  for (let index = 0; index < chatCode.length; index++) {
    const element = chatCode[index];
    setOnInputEvent(`input-${element.ChatCode}`, `span-${element.ChatCode}`);
  }
}

function saveChannel(config = {}, chatCode = {}) {
  config.channel = {};

  // save checked name
  const checkedArray = document.querySelectorAll('#div-channel input[type="checkbox"]:checked');
  for (let index = 0; index < checkedArray.length; index++) {
    const code = checkedArray[index].id.replaceAll('checkbox-', '');
    const label = document.getElementById(`label-${code}`);

    if (label) {
      config.channel[code] = label.innerText;
    }
  }

  // save color
  const channelArray = document.querySelectorAll('#div-channel input[type="checkbox"]');
  for (let index = 0; index < channelArray.length; index++) {
    const code = channelArray[index].id.replaceAll('checkbox-', '');
    const input = document.getElementById(`input-${code}`);

    if (input) {
      chatCode[index].Color = input.value;
    }
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

    try {
      document.getElementById(elementId)[elementProperty] = configValue;
    } catch (error) {
      console.log(error);
    }
  });
}

function saveOptions(config = {}) {
  getOptionList().forEach((value) => {
    const elementId = value[0][0];
    const elementProperty = value[0][1];
    const configIndex1 = value[1][0];
    const configIndex2 = value[1][1];

    if (configIndex2 !== 'backgroundColor') {
      try {
        config[configIndex1][configIndex2] = document.getElementById(elementId)[elementProperty];
      } catch (error) {
        console.log(error);
      }
    }
  });
}

function getOptionList() {
  return [
    // window
    [
      ['checkbox-shortcut', 'checked'],
      ['indexWindow', 'shortcut'],
    ],
    [
      ['checkbox-top', 'checked'],
      ['indexWindow', 'alwaysOnTop'],
    ],
    [
      ['checkbox-focusable', 'checked'],
      ['indexWindow', 'focusable'],
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
      ['input-hide-dialog-timeout', 'value'],
      ['indexWindow', 'timeout'],
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
      ['select-engine-alternate', 'value'],
      ['translation', 'engineAlternate'],
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
    [
      ['input-translation-timeout', 'value'],
      ['translation', 'timeout'],
    ],

    // api
    [
      ['select-google-vision-type', 'value'],
      ['api', 'googleVisionType'],
    ],
    [
      ['input-google-vision-api-key', 'value'],
      ['api', 'googleVisionApiKey'],
    ],
    [
      ['input-gemini-api-key', 'value'],
      ['api', 'geminiApiKey'],
    ],
    [
      ['input-gemini-model', 'value'],
      ['api', 'geminiModel'],
    ],

    [
      ['input-gpt-api-key', 'value'],
      ['api', 'gptApiKey'],
    ],
    [
      ['input-gpt-model', 'value'],
      ['api', 'gptModel'],
    ],

    [
      ['input-cohere-token', 'value'],
      ['api', 'cohereToken'],
    ],
    [
      ['input-cohere-model', 'value'],
      ['api', 'cohereModel'],
    ],

    [
      ['input-kimi-token', 'value'],
      ['api', 'kimiToken'],
    ],
    [
      ['input-kimi-model', 'value'],
      ['api', 'kimiModel'],
    ],

    [
      ['input-llm-api-url', 'value'],
      ['api', 'llmApiUrl'],
    ],
    [
      ['input-llm-api-key', 'value'],
      ['api', 'llmApiKey'],
    ],
    [
      ['input-llm-model', 'value'],
      ['api', 'llmApiModel'],
    ],

    [
      ['input-ai-chat-enable', 'checked'],
      ['ai', 'useChat'],
    ],
    [
      ['input-ai-chat-length', 'value'],
      ['ai', 'chatLength'],
    ],
    [
      ['input-ai-temperature', 'value'],
      ['ai', 'temperature'],
    ],
    [
      ['textarea-ai-custom-translation-prompt', 'value'],
      ['ai', 'customTranslationPrompt'],
    ],

    // proxy
    [
      ['input-proxy-enable', 'checked'],
      ['proxy', 'enable'],
    ],
    [
      ['select-proxy-protocol', 'value'],
      ['proxy', 'protocol'],
    ],
    [
      ['input-proxy-hostname', 'value'],
      ['proxy', 'hostname'],
    ],
    [
      ['input-proxy-port', 'value'],
      ['proxy', 'port'],
    ],
    [
      ['input-proxy-username', 'value'],
      ['proxy', 'username'],
    ],
    [
      ['input-proxy-password', 'value'],
      ['proxy', 'password'],
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
