'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// child process
const { execSync } = require('child_process');

// drag module
const { setDragElement } = require('./module/drag-module');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // F12
    document.addEventListener('keydown', (event) => {
        if (event.code === 'F12') {
            ipcRenderer.send('open-devtools');
        }
    });

    setView();
    setEvent();
    setButton();

    getConfig();
});

// set view
function setView() {}

// set event
function setEvent() {
    // background color
    document.getElementById('color_background_color').oninput = () => {
        document.getElementById('span_background_color').innerText =
            document.getElementById('color_background_color').value.toString().toUpperCase();
    };

    // background transparency
    document.getElementById('range_background_transparency').oninput = () => {
        document.getElementById('span_background_transparency').innerText =
            document.getElementById('range_background_transparency').value;
    };

    // dialog color
    document.getElementById('color_dialog_color').oninput = () => {
        document.getElementById('span_dialog_color').innerText =
            document.getElementById('color_dialog_color').value.toString().toUpperCase();
    };

    // dialog transparency
    document.getElementById('range_dialog_transparency').oninput = () => {
        document.getElementById('span_dialog_transparency').innerText =
            document.getElementById('range_dialog_transparency').value;
    };
}

// set button
function setButton() {
    // drag
    setDragElement(document.getElementById('img_button_drag'));

    // page
    document.getElementById('button_radio_window').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            value.hidden = true;
        });
        document.getElementById('div_window').hidden = false;
    };

    document.getElementById('button_radio_font').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            value.hidden = true;
        });
        document.getElementById('div_font').hidden = false;
    };

    document.getElementById('button_radio_channel').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            value.hidden = true;
        });
        document.getElementById('div_channel').hidden = false;
    };

    document.getElementById('button_radio_translation').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            value.hidden = true;
        });
        document.getElementById('div_translation').hidden = false;
    };

    document.getElementById('button_radio_system').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            value.hidden = true;
        });
        document.getElementById('div_system').hidden = false;
    };

    document.getElementById('button_radio_about').onclick = () => {
        document.querySelectorAll('.setting_page').forEach((value) => {
            value.hidden = true;
        });
        document.getElementById('div_about').hidden = false;
    };

    // upper
    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };

    // content
    // download json
    document.getElementById('button_download_json').onclick = () => {
        ipcRenderer.send('send-preload', 'download-json');
    };

    // devtools
    document.getElementById('button_devtools').onclick = () => {
        ipcRenderer.send('open-preload-devtools');
    };

    // link
    document.getElementById('a_link').onclick = () => {
        try {
            execSync('explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
        } catch (error) {
            console.log(error);
        }
    };

    // report
    document.getElementById('a_report').onclick = () => {
        try {
            execSync('explorer "https://forms.gle/1iX2Gq4G1itCy3UH9"');
        } catch (error) {
            console.log(error);
        }
    };

    // github
    document.getElementById('a_github').onclick = () => {
        try {
            execSync('explorer "https://github.com/winw1010/tataru-helper-node-text-ver.2.0.0#readme"');
        } catch (error) {
            console.log(error);
        }
    };

    // donate
    document.getElementById('a_donate').onclick = () => {
        try {
            execSync('explorer "https://www.patreon.com/user?u=8274441"');
        } catch (error) {
            console.log(error);
        }
    };

    // lower
    // default
    document.getElementById('button_default').onclick = () => {
        // set default config
        ipcRenderer.send('set-default-config');

        // set default chat code
        ipcRenderer.send('set-default-chat-code');

        // reset view
        ipcRenderer.send('send-preload', 'reset-view', ipcRenderer.sendSync('get-config'));

        // read json
        ipcRenderer.send('send-preload', 'read-json');

        // restart
        ipcRenderer.send('create-window', 'config');
    };

    // save
    document.getElementById('button_save').onclick = () => {
        setConfig();
    };
}

// get config
function getConfig() {
    const config = ipcRenderer.sendSync('get-config');
    const chatCode = ipcRenderer.sendSync('get-chat-code');
    const version = ipcRenderer.sendSync('get-version');

    // window
    document.getElementById('checkbox_top').checked = config.preloadWindow.alwaysOnTop;

    document.getElementById('checkbox_advance').checked = config.preloadWindow.advance;

    document.getElementById('checkbox_hide_button').checked = config.preloadWindow.hideButton;

    document.getElementById('checkbox_hide_dialog').checked = config.preloadWindow.hideDialog;
    document.getElementById('input_hide_dialog').value = config.preloadWindow.hideDialogTimeout;

    document.getElementById('span_background_color').innerText = config.preloadWindow.backgroundColor.slice(0, 7);
    document.getElementById('color_background_color').value = config.preloadWindow.backgroundColor.slice(0, 7);

    document.getElementById('span_background_transparency').innerText = parseInt(config.preloadWindow.backgroundColor.slice(7), 16);
    document.getElementById('range_background_transparency').value = parseInt(config.preloadWindow.backgroundColor.slice(7), 16);

    // font
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

    document.getElementById('select_engine').value = config.translation.engine;

    document.getElementById('select_from').value = config.translation.from;

    document.getElementById('select_from_player').value = config.translation.fromPlayer;

    document.getElementById('select_to').value = config.translation.to;

    // system
    document.getElementById('input_text_hsot').value = config.server.host;

    document.getElementById('input_number_port').value = config.server.port;

    document.getElementById('checkbox_auto_download_json').checked = config.system.autoDownloadJson;

    // about
    document.getElementById('span_version').innerText = version;
}

// set config
function setConfig() {
    let config = ipcRenderer.sendSync('get-config');
    let chatCode = ipcRenderer.sendSync('get-chat-code');

    // window
    config.preloadWindow.alwaysOnTop = document.getElementById('checkbox_top').checked;

    config.preloadWindow.advance = document.getElementById('checkbox_advance').checked;

    config.preloadWindow.hideButton = document.getElementById('checkbox_hide_button').checked;

    config.preloadWindow.hideDialog = document.getElementById('checkbox_hide_dialog').checked;
    config.preloadWindow.hideDialogTimeout = document.getElementById('input_hide_dialog').value;

    config.preloadWindow.backgroundColor = document.getElementById('color_background_color').value.toString().toUpperCase();

    let pt = parseInt(document.getElementById('range_background_transparency').value).toString(16).toUpperCase();
    config.preloadWindow.backgroundColor += '' + pt.length < 2 ? '0' + '' + pt : pt;

    // font
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

    config.translation.engine = document.getElementById('select_engine').value;

    config.translation.from = document.getElementById('select_from').value;

    config.translation.fromPlayer = document.getElementById('select_from_player').value;

    config.translation.to = document.getElementById('select_to').value;

    // system
    config.server.host = document.getElementById('input_text_hsot').value;

    config.server.port = document.getElementById('input_number_port').value;

    config.system.autoDownloadJson = document.getElementById('checkbox_auto_download_json').checked;

    // reset view
    ipcRenderer.send('send-preload', 'reset-view', config);

    // set config
    ipcRenderer.send('set-config', config);

    // set chat code
    ipcRenderer.send('set-chat-code', chatCode);

    // read json
    ipcRenderer.send('send-preload', 'read-json');

    // restart server
    ipcRenderer.send('send-preload', 'start-server');

    // notification
    ipcRenderer.send('send-preload', 'show-notification', '設定已儲存');
}

// load channel
function loadChannel(config, chatCode) {
    const channel = document.getElementById('div_channel');
    channel.replaceChildren();

    for (let index = 0; index < chatCode.length; index++) {
        const element = chatCode[index];
        let checked, color;

        if (config.channel[element.ChatCode]) {
            checked = ' checked';
            color = config.channel[element.ChatCode];
        } else {
            checked = '';
            color = element.Color;
        }

        channel.innerHTML += `
            <input type="checkbox" value="" id="checkbox_${element.ChatCode}"${checked}>
            <label for="checkbox_${element.ChatCode}">
                ${element.Name}(<span id="span_${element.ChatCode}_color">${color}</span>)
            </label>
            <br>
            <input type="color" value="${color}" id="color_${element.ChatCode}_color">

            <br>
            <br>
        `;

        document.getElementById(`color_${element.ChatCode}_color`).oninput = () => {
            document.getElementById(`span_${element.ChatCode}_color`).innerText =
                document.getElementById(`color_${element.ChatCode}_color`).value.toString().toUpperCase();
        };
    }
}