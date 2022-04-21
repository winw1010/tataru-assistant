// child process
const { exec } = require('child_process');

// child process
const { readFileSync, readdirSync } = require('fs');

// Communicate with main process
const { ipcRenderer } = require('electron');

// json fixer
const jsonFixer = require('json-fixer')

// Communicate with main process
const { showDialog } = require('./module/dialog-module');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // F12
    document.addEventListener('keydown', (event) => {
        if (event.code == 'F12') {
            ipcRenderer.send('open-devtools');
        }
    });

    setHTML();
});

// set html
function setHTML() {
    setView();
    setEvent();
    setButton();
}

// set view
function setView() {
    readLogList();
}

// set event
function setEvent() {}

// set button
function setButton() {
    // read
    $('#button_read').on('click', () => {
        const file = $('#select_log').val();
        readLog(file);
    });

    // view
    $('#button_view').on('click', () => {
        exec('start "" "json\\log"');
    });

    // close
    $('#img_button_close').on('click', () => {
        ipcRenderer.send('close-window');
    });
}

function readLogList() {
    try {
        const logList = readdirSync('./json/log');

        if (logList.length > 0) {
            $('#select_log').empty();

            for (let index = 0; index < logList.length; index++) {
                const item = logList[index];
                $('#select_log').append(`<option value="${item}">${item}</option>`);
            }

            $('#select_log option:last-child').prop('selected', true);
        }
    } catch (error) {
        console.log(error);
    }
}

function readLog(file) {
    if (file == '') {
        ipcRenderer.send('send-preload', 'show-notification', '檔案不存在');
        return;
    }

    try {
        const log = jsonFixer(readFileSync('./json/log/' + file).toString()).data;
        const logNames = Object.getOwnPropertyNames(log);

        if (logNames.length > 0) {
            for (let index = 0; index < logNames.length; index++) {
                const logItem = log[logNames[index]];

                if (logItem.code != 'FFFF') {
                    ipcRenderer.send('send-preload', 'append-log', logItem.id, logItem.code, logItem.translated_name, logItem.translated_text)
                }
            }

            showDialog;
        }
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-preload', 'show-notification', '無法讀取檔案');
    }
}