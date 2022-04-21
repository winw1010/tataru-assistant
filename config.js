// Communicate with main process
const { ipcRenderer } = require('electron');

// child process
const { exec } = require('child_process');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setHTML();
    loadConfig();
});

// set html
function setHTML() {
    // F12
    document.addEventListener('keydown', (event) => {
        if (event.code == 'F12') {
            ipcRenderer.send('open-devtools');
        }
    });

    setView();
    setEvent();
    setButton();
}

// set view
function setView() {

}

// set event
function setEvent() {
    // background color
    $('#color_background_color').on('input', () => {
        $('#span_background_color').text($('#color_background_color').val().toString().toUpperCase());
    });

    // background transparency
    $('#range_background_transparency').on('input', () => {
        $('#span_background_transparency').text($('#range_background_transparency').val());
    });

    // dialog color
    $('#color_dialog_color').on('input', () => {
        $('#span_dialog_color').text($('#color_dialog_color').val().toString().toUpperCase());
    });

    // dialog transparency
    $('#range_dialog_transparency').on('input', () => {
        $('#span_dialog_transparency').text($('#range_dialog_transparency').val());
    });
}

// set button
function setButton() {
    // page button
    $('#button_radio_window').on('click', () => {
        $('.setting_page').prop('hidden', true);
        $('#div_window').prop('hidden', false);
    });

    $('#button_radio_font').on('click', () => {
        $('.setting_page').prop('hidden', true);
        $('#div_font').prop('hidden', false);
    });

    $('#button_radio_channel').on('click', () => {
        $('.setting_page').prop('hidden', true);
        $('#div_channel').prop('hidden', false);
    });

    $('#button_radio_translation').on('click', () => {
        $('.setting_page').prop('hidden', true);
        $('#div_translation').prop('hidden', false);
    });

    $('#button_radio_system').on('click', () => {
        $('.setting_page').prop('hidden', true);
        $('#div_system').prop('hidden', false);
    });

    $('#button_radio_about').on('click', () => {
        $('.setting_page').prop('hidden', true);
        $('#div_about').prop('hidden', false);
    });

    // upper button
    // close
    $('#img_button_close').on('click', () => {
        ipcRenderer.send('close-window');
    });

    // content button
    // download json
    $('#button_download_json').on('click', () => {
        ipcRenderer.send('send-preload', 'download-json');
    });

    // devtools
    $('#button_devtools').on('click', () => {
        ipcRenderer.send('open-preload-devtools');
    });

    // link
    $('#a_link').on('click', () => {
        exec('explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
    });

    // report
    $('#a_report').on('click', () => {
        exec('explorer "https://forms.gle/1iX2Gq4G1itCy3UH9"');
    });

    // github
    $('#a_github').on('click', () => {
        exec('explorer "https://github.com/winw1010/tataru-helper-node-text-ver.2.0.0"');
    });

    // donate
    $('#a_donate').on('click', () => {
        exec('explorer "https://www.patreon.com/user?u=8274441"');
    });

    // zhconvert
    $('#a_zhconvert').on('click', () => {
        exec('explorer "https://zhconvert.org/"');
    });

    // lower button
    // default
    $('#button_default').on('click', () => {
        // save config
        ipcRenderer.send('save-default-config');

        // save chat code
        ipcRenderer.send('save-default-chat-code');

        // reset view
        ipcRenderer.send('send-preload', 'reset-view', ipcRenderer.sendSync('load-config'));

        // read json
        ipcRenderer.send('send-preload', 'read-json');

        // restart
        ipcRenderer.send('create-window', 'config');
    });

    // save
    $('#button_save').on('click', () => {
        saveConfig();
    });
}

// load config
function loadConfig() {
    const config = ipcRenderer.sendSync('load-config');
    const chatCode = ipcRenderer.sendSync('load-chat-code');
    const version = ipcRenderer.sendSync('get-version');

    // window
    $('#checkbox_top').prop('checked', config.preloadWindow.alwaysOnTop);

    $('#checkbox_advance').prop('checked', config.preloadWindow.advance);

    $('#checkbox_hide_button').prop('checked', config.preloadWindow.hideButton);

    $('#checkbox_hide_dialog').prop('checked', config.preloadWindow.hideDialog);
    $('#input_hide_dialog').val(config.preloadWindow.hideDialogInterval);

    $('#span_background_color').text(config.preloadWindow.backgroundColor.slice(0, 7));
    $('#color_background_color').val(config.preloadWindow.backgroundColor.slice(0, 7));

    $('#span_background_transparency').text(parseInt(config.preloadWindow.backgroundColor.slice(7), 16));
    $('#range_background_transparency').val(parseInt(config.preloadWindow.backgroundColor.slice(7), 16));

    // font
    $('#input_font_size').val(config.dialog.fontSize);

    $('#input_dialog_spacing').val(config.dialog.spacing);

    $('#input_dialog_radius').val(config.dialog.radius);

    $('#span_dialog_color').text(config.dialog.backgroundColor.slice(0, 7));
    $('#color_dialog_color').val(config.dialog.backgroundColor.slice(0, 7));

    $('#span_dialog_transparency').text(parseInt(config.dialog.backgroundColor.slice(7), 16));
    $('#range_dialog_transparency').val(parseInt(config.dialog.backgroundColor.slice(7), 16));

    // channel
    loadChannel(config, chatCode);

    // translation
    $('#checkbox_auto_change').prop('checked', config.translation.autoChange);

    $('#checkbox_text_fix').prop('checked', config.translation.fix);

    $('#checkbox_skip_system').prop('checked', config.translation.skip);

    $('#select_engine').val(config.translation.engine);

    $('#select_from').val(config.translation.from);

    $('#select_from_party').val(config.translation.fromParty);

    $('#select_to').val(config.translation.to);

    // system
    $('#input_text_hsot').val(config.server.host);

    $('#input_number_port').val(config.server.port);

    $('#checkbox_auto_download_json').prop('checked', config.system.autoDownloadJson);

    // about
    $('#span_version').text(version);
}

// save config
function saveConfig() {
    let config = ipcRenderer.sendSync('load-config');
    let chatCode = ipcRenderer.sendSync('load-chat-code');

    // window
    config.preloadWindow.alwaysOnTop = $('#checkbox_top').prop('checked');

    config.preloadWindow.advance = $('#checkbox_advance').prop('checked');

    config.preloadWindow.hideButton = $('#checkbox_hide_button').prop('checked');

    config.preloadWindow.hideDialog = $('#checkbox_hide_dialog').prop('checked');
    config.preloadWindow.hideDialogInterval = $('#input_hide_dialog').val();

    config.preloadWindow.backgroundColor = $('#color_background_color').val().toString().toUpperCase();

    let pt = parseInt($('#range_background_transparency').val()).toString(16).toUpperCase();
    config.preloadWindow.backgroundColor += '' + pt.length < 2 ? '0' + '' + pt : pt;

    // font
    config.dialog.fontSize = $('#input_font_size').val();

    config.dialog.spacing = $('#input_dialog_spacing').val();

    config.dialog.radius = $('#input_dialog_radius').val();

    config.dialog.backgroundColor = $('#color_dialog_color').val();

    let dt = parseInt($('#range_dialog_transparency').val()).toString(16).toUpperCase();
    config.dialog.backgroundColor += '' + dt.length < 2 ? '0' + '' + dt : dt;

    // channel
    let checkedArray = $('#div_channel input[type="checkbox"]:checked');
    config.channel = {};

    // app notification
    config.channel['FFFF'] = $(`#color_0039_color`).val().toUpperCase();

    for (let index = 0; index < checkedArray.length; index++) {
        const code = checkedArray[index].id.replace('checkbox_', '').toUpperCase();
        config.channel[code] = $(`#color_${code}_color`).val().toUpperCase();
    }

    let channelArray = $('#div_channel input[type="checkbox"]');
    for (let index = 0; index < channelArray.length; index++) {
        const code = channelArray[index].id.replace('checkbox_', '').toUpperCase();
        chatCode[index].Color = $(`#color_${code}_color`).val().toUpperCase();
    }

    // translation
    config.translation.autoChange = $('#checkbox_auto_change').prop('checked');

    config.translation.fix = $('#checkbox_text_fix').prop('checked');

    config.translation.skip = $('#checkbox_skip_system').prop('checked');

    config.translation.engine = $('#select_engine').val();

    config.translation.from = $('#select_from').val();

    config.translation.fromParty = $('#select_from_party').val();

    config.translation.to = $('#select_to').val();

    // system
    config.server.host = $('#input_text_hsot').val();

    config.server.port = $('#input_number_port').val();

    config.system.autoDownloadJson = $('#checkbox_auto_download_json').prop('checked');

    // reset view
    ipcRenderer.send('send-preload', 'reset-view', config);

    // save config
    ipcRenderer.send('save-config', config);

    // save chat code
    ipcRenderer.send('save-chat-code', chatCode);

    // read json
    ipcRenderer.send('send-preload', 'read-json');

    // restart server
    ipcRenderer.send('send-preload', 'start-server');

    // notification
    ipcRenderer.send('send-preload', 'show-notification', '設定已儲存');
}

// load channel
function loadChannel(config, chatCode) {
    $('#div_channel').empty();

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

        $('#div_channel').append(`
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="checkbox_${element.ChatCode}"${checked}>
                <label class="form-check-label" for="checkbox_${element.ChatCode}">
                    ${element.Name}(<span id="span_${element.ChatCode}_color">${color}</span>)
                </label>
                <input type="color" class="form-control form-control-color" value="${color}" id="color_${element.ChatCode}_color">
            </div>

            <br>
        `);

        $(`#color_${element.ChatCode}_color`).on('input', () => {
            $(`#span_${element.ChatCode}_color`).text($(`#color_${element.ChatCode}_color`).val().toString().toUpperCase());
        });
    }
}