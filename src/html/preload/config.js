'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setContextBridge();
    setIPC();

    setView();
    setEvent();
    setButton();
});

// set context bridge
function setContextBridge() {
    contextBridge.exposeInMainWorld('myAPI', {
        getConfig: () => {
            return ipcRenderer.sendSync('get-config');
        },
        dragWindow: (clientX, clientY, windowWidth, windowHeight) => {
            return ipcRenderer.send('drag-window', clientX, clientY, windowWidth, windowHeight);
        },
    });
}

// set IPC
function setIPC() {
    // change UI text
    ipcRenderer.on('change-ui-text', () => {
        document.dispatchEvent(new CustomEvent('change-ui-text'));
    });

    // send data
    ipcRenderer.on('send-data', (event, idList) => {
        document.getElementById(idList[0]).checked = true;
        document.querySelectorAll('.setting_page').forEach((value) => {
            document.getElementById(value.id).hidden = true;
        });
        document.getElementById(idList[1]).hidden = false;
    });
}

// set view
function setView() {
    showConfig();
}

// set event
function setEvent() {
    // background color
    document.getElementById('color_background_color').oninput = () => {
        document.getElementById('span_background_color').innerText = document.getElementById('color_background_color').value.toString().toUpperCase();
    };

    // background transparency
    document.getElementById('range_background_transparency').oninput = () => {
        document.getElementById('span_background_transparency').innerText = document.getElementById('range_background_transparency').value;
    };

    // dialog color
    document.getElementById('color_dialog_color').oninput = () => {
        document.getElementById('span_dialog_color').innerText = document.getElementById('color_dialog_color').value.toString().toUpperCase();
    };

    // dialog transparency
    document.getElementById('range_dialog_transparency').oninput = () => {
        document.getElementById('span_dialog_transparency').innerText = document.getElementById('range_dialog_transparency').value;
    };
}

// set button
function setButton() {
    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };

    // page
    document.getElementsByName('btnradio').forEach((btnradio) => {
        btnradio.onclick = () => {
            document.querySelectorAll('.setting_page').forEach((page) => {
                document.getElementById(page.id).hidden = true;
            });
            document.getElementById(btnradio.value).hidden = false;
        };
    });

    // download json
    document.getElementById('button_download_json').onclick = () => {
        ipcRenderer.send('download-json');
    };

    // version check
    document.getElementById('button_version_check').onclick = () => {
        ipcRenderer.send('version-check');
    };

    // start sharlayan reader
    document.getElementById('button_start_sharlayan_reader').onclick = () => {
        ipcRenderer.send('start-sharlayan-reader');
    };

    // get google credential
    document.getElementById('a_get_credential').onclick = () => {
        const path = ipcRenderer.sendSync('get-root-path', 'src', 'json', 'text', 'readme', 'sub-google-api.html');
        ipcRenderer.send('execute-command', `explorer "${path}"`);
    };

    // set google credential
    document.getElementById('button_google_credential').onclick = () => {
        ipcRenderer.send('set-google-credential');
    };

    // readme
    document.getElementById('a_readme').onclick = () => {
        const path = ipcRenderer.sendSync('get-root-path', 'src', 'json', 'text', 'readme', 'index.html');
        ipcRenderer.send('execute-command', `explorer "${path}"`);
    };

    // bug report
    document.getElementById('a_bug_report').onclick = () => {
        ipcRenderer.send('execute-command', 'explorer "https://forms.gle/1iX2Gq4G1itCy3UH9"');
    };

    // translation report
    document.getElementById('a_translation_report').onclick = () => {
        ipcRenderer.send('execute-command', 'explorer "https://github.com/winw1010/tataru-helper-node-text-v2#%E7%BF%BB%E8%AD%AF%E9%8C%AF%E8%AA%A4%E5%9B%9E%E5%A0%B1%E6%96%B9%E5%BC%8F"');
    };

    // github
    document.getElementById('a_github').onclick = () => {
        ipcRenderer.send('execute-command', 'explorer "https://github.com/winw1010/tataru-helper-node-v2"');
    };

    // bahamut
    document.getElementById('a_bahamut').onclick = () => {
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

// get config
function showConfig() {
    const config = ipcRenderer.sendSync('get-config');
    const chatCode = ipcRenderer.sendSync('get-chat-code');
    const version = ipcRenderer.sendSync('get-version');

    // window
    document.getElementById('checkbox_top').checked = config.indexWindow.alwaysOnTop;

    document.getElementById('checkbox_focusable').checked = config.indexWindow.focusable;

    document.getElementById('checkbox_shortcut').checked = config.indexWindow.shortcut;

    document.getElementById('checkbox_min_size').checked = config.indexWindow.minSize;

    document.getElementById('checkbox_hide_button').checked = config.indexWindow.hideButton;

    document.getElementById('checkbox_hide_dialog').checked = config.indexWindow.hideDialog;
    document.getElementById('input_hide_dialog').value = config.indexWindow.hideDialogTimeout;

    document.getElementById('span_background_color').innerText = config.indexWindow.backgroundColor.slice(0, 7);
    document.getElementById('color_background_color').value = config.indexWindow.backgroundColor.slice(0, 7);

    document.getElementById('span_background_transparency').innerText = parseInt(config.indexWindow.backgroundColor.slice(7), 16);
    document.getElementById('range_background_transparency').value = parseInt(config.indexWindow.backgroundColor.slice(7), 16);

    // font
    document.getElementById('select_font_weight').value = config.dialog.weight;

    document.getElementById('input_font_size').value = config.dialog.fontSize;

    document.getElementById('input_dialog_spacing').value = config.dialog.spacing;

    document.getElementById('input_dialog_radius').value = config.dialog.radius;

    document.getElementById('span_dialog_color').innerText = config.dialog.backgroundColor.slice(0, 7);
    document.getElementById('color_dialog_color').value = config.dialog.backgroundColor.slice(0, 7);

    document.getElementById('span_dialog_transparency').innerText = parseInt(config.dialog.backgroundColor.slice(7), 16);
    document.getElementById('range_dialog_transparency').value = parseInt(config.dialog.backgroundColor.slice(7), 16);

    // channel
    loadChannel(config, chatCode);

    // translation
    document.getElementById('checkbox_auto_change').checked = config.translation.autoChange;

    document.getElementById('checkbox_text_fix').checked = config.translation.fix;

    document.getElementById('checkbox_skip_system').checked = config.translation.skip;

    document.getElementById('checkbox_skip_chinese').checked = config.translation.skipChinese;

    document.getElementById('select_engine').value = config.translation.engine;

    document.getElementById('select_from').value = config.translation.from;

    document.getElementById('select_from_player').value = config.translation.fromPlayer;

    document.getElementById('select_to').value = config.translation.to;

    // system
    document.getElementById('checkbox_auto_download_json').checked = config.system.autoDownloadJson;

    // about
    document.getElementById('span_version').innerText = version;
}

// save config
function saveConfig() {
    let config = ipcRenderer.sendSync('get-config');
    let chatCode = ipcRenderer.sendSync('get-chat-code');

    // window
    config.indexWindow.alwaysOnTop = document.getElementById('checkbox_top').checked;

    config.indexWindow.focusable = document.getElementById('checkbox_focusable').checked;

    config.indexWindow.shortcut = document.getElementById('checkbox_shortcut').checked;

    config.indexWindow.minSize = document.getElementById('checkbox_min_size').checked;

    config.indexWindow.hideButton = document.getElementById('checkbox_hide_button').checked;

    config.indexWindow.hideDialog = document.getElementById('checkbox_hide_dialog').checked;
    config.indexWindow.hideDialogTimeout = parseInt(document.getElementById('input_hide_dialog').value);

    config.indexWindow.backgroundColor = document.getElementById('color_background_color').value.toString().toUpperCase();

    let pt = parseInt(document.getElementById('range_background_transparency').value).toString(16).toUpperCase();
    config.indexWindow.backgroundColor += '' + pt.length < 2 ? '0' + '' + pt : pt;

    // font
    config.dialog.weight = document.getElementById('select_font_weight').value;

    config.dialog.fontSize = document.getElementById('input_font_size').value;

    config.dialog.spacing = document.getElementById('input_dialog_spacing').value;

    config.dialog.radius = document.getElementById('input_dialog_radius').value;

    config.dialog.backgroundColor = document.getElementById('color_dialog_color').value.toString().toUpperCase();

    let dt = parseInt(document.getElementById('range_dialog_transparency').value).toString(16).toUpperCase();
    config.dialog.backgroundColor += '' + dt.length < 2 ? '0' + '' + dt : dt;

    // channel
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

    // translation
    config.translation.autoChange = document.getElementById('checkbox_auto_change').checked;

    config.translation.fix = document.getElementById('checkbox_text_fix').checked;

    config.translation.skip = document.getElementById('checkbox_skip_system').checked;

    config.translation.skipChinese = document.getElementById('checkbox_skip_chinese').checked;

    config.translation.engine = document.getElementById('select_engine').value;

    config.translation.from = document.getElementById('select_from').value;

    config.translation.fromPlayer = document.getElementById('select_from_player').value;

    config.translation.to = document.getElementById('select_to').value;

    // system
    config.system.autoDownloadJson = document.getElementById('checkbox_auto_download_json').checked;

    // set config
    ipcRenderer.sendSync('set-config', config);

    // set chat code
    ipcRenderer.sendSync('set-chat-code', chatCode);

    // reset app
    resetApp(config);

    // reset config
    showConfig();

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
    showConfig();

    // show notification
    ipcRenderer.send('show-notification', '已恢復預設值');
}

// load channel
function loadChannel(config, chatCode) {
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
                <div class="col-6">
                    <div class="form-check form-switch">
                        <input type="checkbox" class="form-check-input" role="switch" value="" id="${checkboxId}" ${checked} />
                        <label class="form-check-label" for="${checkboxId}">${element.Name}</label>
                    </div>
                </div>
                <div class="col-auto">
                    <input type="color" class="form-control form-control-color" value="${color}" id="${colorId}" />
                </div>
                <div class="col-auto">
                    <span id="${spanId}" style="color:${color};">${color}</span>
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
