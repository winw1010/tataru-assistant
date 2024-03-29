'use strict';

// electron
const { ipcRenderer } = require('electron');

let apiKeyVisibility = false;

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
    document.querySelectorAll('.setting_page').forEach((value) => {
      document.getElementById(value.id).hidden = true;
    });
    document.getElementById(divId).hidden = false;
  });
}

// set view
function setView() {
  document.getElementById('select_engine').innerHTML = ipcRenderer.sendSync('get-engine-select');

  document.getElementById('select_from').innerHTML = ipcRenderer.sendSync('get-source-select');

  document.getElementById('select_from_player').innerHTML = ipcRenderer.sendSync('get-source-select');

  document.getElementById('select_to').innerHTML = ipcRenderer.sendSync('get-target-select');

  document.getElementById('select-app-language').innerHTML = ipcRenderer.sendSync('get-ui-select');

  readConfig();
}

// set event
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  // background color
  document.getElementById('color_background_color').oninput = () => {
    document.getElementById('span_background_color').innerText = document
      .getElementById('color_background_color')
      .value.toString()
      .toUpperCase();
  };

  // background transparency
  document.getElementById('range_background_transparency').oninput = () => {
    document.getElementById('span_background_transparency').innerText = document.getElementById(
      'range_background_transparency'
    ).value;
  };

  // dialog color
  document.getElementById('color_dialog_color').oninput = () => {
    document.getElementById('span_dialog_color').innerText = document
      .getElementById('color_dialog_color')
      .value.toString()
      .toUpperCase();
  };

  // dialog transparency
  document.getElementById('range_dialog_transparency').oninput = () => {
    document.getElementById('span_dialog_transparency').innerText =
      document.getElementById('range_dialog_transparency').value;
  };
}

// set button
function setButton() {
  // close
  document.getElementById('img_button_close').onclick = () => {
    ipcRenderer.send('close-window');
  };

  // page
  document.getElementById('select-option').onchange = () => {
    const value = document.getElementById('select-option').value;
    document.querySelectorAll('.setting_page').forEach((page) => {
      document.getElementById(page.id).hidden = true;
    });
    document.getElementById(value).hidden = false;
  };

  // download json
  document.getElementById('button_download_json').onclick = () => {
    ipcRenderer.send('download-json');
  };

  // version check
  document.getElementById('button_version_check').onclick = () => {
    ipcRenderer.send('version-check');
  };

  // restart sharlayan reader
  document.getElementById('button_restart_sharlayan_reader').onclick = () => {
    ipcRenderer.send('restart-sharlayan-reader');
  };

  // get google credential
  document.getElementById('a_get_credential').onclick = () => {
    const path = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'text', 'readme', 'sub-google-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // get gpt api key
  document.getElementById('a_get_gpt_api_key').onclick = () => {
    const path = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'text', 'readme', 'sub-gpt-api.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // set google credential
  document.getElementById('button_google_credential').onclick = () => {
    ipcRenderer.send('set-google-credential');
  };

  // set google credential
  document.getElementById('img-api-key-visibility').onclick = () => {
    apiKeyVisibility = !apiKeyVisibility;
    if (apiKeyVisibility) {
      document.getElementById('img-api-key-visibility').setAttribute('src', './img/ui/visibility_white_48dp.svg');
      document.getElementById('input-gpt-api-key').setAttribute('type', 'text');
    } else {
      document.getElementById('img-api-key-visibility').setAttribute('src', './img/ui/visibility_off_white_48dp.svg');
      document.getElementById('input-gpt-api-key').setAttribute('type', 'password');
    }
  };

  // readme
  document.getElementById('a_readme').onclick = () => {
    const path = ipcRenderer.sendSync('get-root-path', 'src', 'data', 'text', 'readme', 'index.html');
    ipcRenderer.send('execute-command', `explorer "${path}"`);
  };

  // bug report
  document.getElementById('a_bug_report').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://forms.gle/1iX2Gq4G1itCy3UH9"');
  };

  // translation report
  document.getElementById('a_translation_report').onclick = () => {
    ipcRenderer.send(
      'execute-command',
      'explorer "https://github.com/winw1010/tataru-helper-node-text-v2#%E7%BF%BB%E8%AD%AF%E9%8C%AF%E8%AA%A4%E5%9B%9E%E5%A0%B1%E6%96%B9%E5%BC%8F"'
    );
  };

  // github
  document.getElementById('a_github').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://github.com/winw1010/tataru-helper-node-v2"');
  };

  // author
  document.getElementById('a_author').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
  };

  /*
  // donate
  document.getElementById('a_donate').onclick = () => {
      ipcRenderer.send('execute-command', 'explorer "https://www.google.com/"');
  };
  */

  // default
  document.getElementById('button_save_default_config').onclick = () => {
    saveDefaultConfig();
  };

  // save
  document.getElementById('button_save_config').onclick = () => {
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
  document.getElementById('span_version').innerText = version;
}

// save config
function saveConfig() {
  let config = ipcRenderer.sendSync('get-config');
  let chatCode = ipcRenderer.sendSync('get-chat-code');

  // save options
  saveOptions(config);

  // window backgroundColor
  let windowColor = document.getElementById('color_background_color').value;
  let windowTransparent = parseInt(document.getElementById('range_background_transparency').value).toString(16);
  config.indexWindow.backgroundColor = windowColor + windowTransparent.padStart(2, '0');

  // dialog backgroundColor
  let dialogColor = document.getElementById('color_dialog_color').value;
  let dialogTransparent = parseInt(document.getElementById('range_dialog_transparency').value).toString(16);
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

// read channel
function readChannel(config, chatCode) {
  const channel = document.getElementById('div_channel_list');
  let newInnerHTML = '';

  for (let index = 0; index < chatCode.length; index++) {
    const element = chatCode[index];
    const checkboxId = `checkbox_${element.ChatCode}`;
    const colorId = `color_${element.ChatCode}_color`;
    const spanId = `span_${element.ChatCode}_color`;
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
    const channelColor = document.getElementById(`color_${element.ChatCode}_color`);
    const channelSpan = document.getElementById(`span_${element.ChatCode}_color`);

    channelColor.oninput = () => {
      channelSpan.style.color = channelColor.value.toString();
      channelSpan.innerText = channelColor.value.toString().toUpperCase();
    };
  }
}

function saveChannel(config = {}, chatCode = {}) {
  config.channel = {};

  // app notification
  config.channel['FFFF'] = document.getElementById('color_0039_color').value.toUpperCase();

  // checked color
  const checkedArray = document.querySelectorAll('#div_channel input[type="checkbox"]:checked');
  for (let index = 0; index < checkedArray.length; index++) {
    const code = checkedArray[index].id.replaceAll('checkbox_', '').toUpperCase();
    config.channel[code] = document.getElementById(`color_${code}_color`).value.toUpperCase();
  }

  // all color
  const channelArray = document.querySelectorAll('#div_channel input[type="checkbox"]');
  for (let index = 0; index < channelArray.length; index++) {
    const code = channelArray[index].id.replaceAll('checkbox_', '').toUpperCase();
    chatCode[index].Color = document.getElementById(`color_${code}_color`).value.toUpperCase();
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
      ['checkbox_top', 'checked'],
      ['indexWindow', 'alwaysOnTop'],
    ],
    [
      ['checkbox_shortcut', 'checked'],
      ['indexWindow', 'shortcut'],
    ],
    [
      ['checkbox_min_size', 'checked'],
      ['indexWindow', 'minSize'],
    ],
    [
      ['checkbox_hide_button', 'checked'],
      ['indexWindow', 'hideButton'],
    ],
    [
      ['checkbox_hide_dialog', 'checked'],
      ['indexWindow', 'hideDialog'],
    ],
    [
      ['input_hide_dialog', 'value'],
      ['indexWindow', 'hideDialogTimeout'],
    ],
    [
      ['span_background_color', 'innerText'],
      ['indexWindow', 'backgroundColor'],
      (value) => {
        return value.slice(0, 7);
      },
    ],
    [
      ['color_background_color', 'value'],
      ['indexWindow', 'backgroundColor'],
      (value) => {
        return value.slice(0, 7);
      },
    ],
    [
      ['span_background_transparency', 'innerText'],
      ['indexWindow', 'backgroundColor'],
      (value) => {
        return parseInt(value.slice(7), 16);
      },
    ],
    [
      ['range_background_transparency', 'value'],
      ['indexWindow', 'backgroundColor'],
      (value) => {
        return parseInt(value.slice(7), 16);
      },
    ],

    // font
    [
      ['select_font_weight', 'value'],
      ['dialog', 'weight'],
    ],
    [
      ['input_font_size', 'value'],
      ['dialog', 'fontSize'],
    ],
    [
      ['input_dialog_spacing', 'value'],
      ['dialog', 'spacing'],
    ],
    [
      ['input_dialog_radius', 'value'],
      ['dialog', 'radius'],
    ],
    [
      ['span_dialog_color', 'innerText'],
      ['dialog', 'backgroundColor'],
      (value) => {
        return value.slice(0, 7);
      },
    ],
    [
      ['color_dialog_color', 'value'],
      ['dialog', 'backgroundColor'],
      (value) => {
        return value.slice(0, 7);
      },
    ],
    [
      ['span_dialog_transparency', 'innerText'],
      ['dialog', 'backgroundColor'],
      (value) => {
        return parseInt(value.slice(7), 16);
      },
    ],
    [
      ['range_dialog_transparency', 'value'],
      ['dialog', 'backgroundColor'],
      (value) => {
        return parseInt(value.slice(7), 16);
      },
    ],

    // translation
    [
      ['checkbox_auto_change', 'checked'],
      ['translation', 'autoChange'],
    ],
    [
      ['checkbox_text_fix', 'checked'],
      ['translation', 'fix'],
    ],
    [
      ['checkbox_skip_system', 'checked'],
      ['translation', 'skip'],
    ],
    [
      ['checkbox_skip_chinese', 'checked'],
      ['translation', 'skipChinese'],
    ],
    [
      ['select_engine', 'value'],
      ['translation', 'engine'],
    ],
    [
      ['select_from', 'value'],
      ['translation', 'from'],
    ],
    [
      ['select_from_player', 'value'],
      ['translation', 'fromPlayer'],
    ],
    [
      ['select_to', 'value'],
      ['translation', 'to'],
    ],

    // api
    [
      ['select-model', 'value'],
      ['system', 'gptModel'],
    ],
    [
      ['input-gpt-api-key', 'value'],
      ['system', 'gptApiKey'],
    ],

    // system
    [
      ['select-app-language', 'value'],
      ['system', 'appLanguage'],
    ],
    [
      ['checkbox_auto_download_json', 'checked'],
      ['system', 'autoDownloadJson'],
    ],
  ];
}
