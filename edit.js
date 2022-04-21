'use strict';

// Communicate with main process
const { ipcRenderer } = require('electron');

// fs
const { readFileSync } = require('fs');

// json fixer
const jsonFixer = require('json-fixer')

// cf
const { readJSONPure, writeJSON, sameAsArrayItem } = require('./module/correction-function');

// create log name
const { createLogName } = require('./module/dialog-module');

// child process
const { exec } = require('child_process');

// target log
let targetLog = null;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // F12
    document.addEventListener('keydown', (event) => {
        if (event.code === 'F12') {
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
    const config = ipcRenderer.sendSync('load-config');
    $('#select_restart_language').val(config.translation.engine);
    $('#checkbox_replace').prop('checked', config.translation.replace);
}

// set event
function setEvent() {
    ipcRenderer.on('send-data', (event, id) => {
        try {
            const milliseconds = parseInt(id.slice(2));
            const logFileList = [createLogName(milliseconds), createLogName(milliseconds + 86400000), createLogName(milliseconds - 86400000)];
            console.log(logFileList);

            if (logFileList.length > 0) {
                for (let index = 0; index < logFileList.length; index++) {
                    try {
                        const logFile = logFileList[index];
                        const log = jsonFixer(readFileSync('./json/log/' + logFile).toString()).data;

                        console.log(logFile);
                        console.log(log);

                        if (log[id]) {
                            targetLog = log[id];

                            let dialog1, dialog2;

                            if (targetLog.name !== '') {
                                dialog1 = $(`<span>${targetLog.name}:</span><br><span>${targetLog.text}</span>`);
                            } else {
                                dialog1 = $('<span>').text(targetLog.text);
                            }

                            if (targetLog.translated_name !== '') {
                                dialog2 = $(`<span>${targetLog.translated_name}:</span><br><span>${targetLog.translated_text}</span>`);
                            } else {
                                dialog2 = $('<span>').text(targetLog.translated_text);
                            }

                            $('#div_dialog1').empty().append(dialog1);
                            $('#div_dialog2').empty().append(dialog2);

                            break;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                if (targetLog && targetLog.code !== 'FFFF') {
                    $('#div_restart').prop('hidden', false);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    $('#checkbox_replace').on('input', () => {
        let config = ipcRenderer.sendSync('load-config');
        config.translation.replace = $('#checkbox_replace').prop('checked');
        ipcRenderer.send('save-config', config);
    });
}

// set button
function setButton() {
    // github
    $('#a_github').on('click', () => {
        exec('explorer "https://github.com/winw1010/tataru-helper-node-text-ver.2.0.0"');
    });

    // restart
    $('#button_restart').on('click', () => {
        const config = ipcRenderer.sendSync('load-config');

        if (!config.translation.replace) {
            targetLog.id = 'id' + new Date().getTime();
        }

        let dialogData = {
            id: targetLog.id,
            playerName: targetLog.player,
            code: targetLog.code,
            name: targetLog.name,
            text: targetLog.text
        };

        let translation = config.translation;
        translation.engine = $('#select_restart_language').val();

        ipcRenderer.send('send-preload', 'restart-translation', dialogData, translation);
    });

    $('#button_reload_json').on('click', () => {
        ipcRenderer.send('send-preload', 'read-json');
    });

    $('#button_view_temp').on('click', () => {
        exec('start "" "json\\text_temp"');
    });

    // save custom
    $('#button_save_temp').on('click', () => {
        const textBefore = $('#textarea_before').val().replaceAll('\n', '').trim();
        const textAfter = $('#textarea_after').val().replaceAll('\n', '').trim();
        const type = $('#select_type').val();

        if (textBefore !== '' && textAfter !== '') {
            if (type === 'jp') {
                let jpTemp = readJSONPure('text_temp', 'jpTemp.json');
                jpTemp = addTemp(textBefore, textAfter, type, jpTemp);
                writeJSON('text_temp', 'jpTemp.json', jpTemp);
            } else if (type === 'overwrite') {
                let overwriteTemp = readJSONPure('text_temp', 'overwriteTemp.json');
                overwriteTemp = addTemp(textBefore, textAfter, type, overwriteTemp);
                writeJSON('text_temp', 'overwriteTemp.json', overwriteTemp);
            } else {
                let chTemp = readJSONPure('text_temp', 'chTemp.json');
                chTemp = addTemp(textBefore, textAfter, type, chTemp);
                writeJSON('text_temp', 'chTemp.json', chTemp);
            }

            ipcRenderer.send('send-preload', 'show-notification', '已儲存自訂翻譯');
            ipcRenderer.send('send-preload', 'read-json');
        } else {
            ipcRenderer.send('send-preload', 'show-notification', '「替換前(原文)」和「替換後(自訂翻譯)」不可為空白');
        }
    });

    $('#button_delete_temp').on('click', () => {
        const textBefore = $('#textarea_before').val().replaceAll('\n', '').trim();
        const type = $('#select_type').val();

        if (textBefore !== '') {
            if (type === 'jp') {
                let jpTemp = readJSONPure('text_temp', 'jpTemp.json');
                jpTemp = deleteTemp(textBefore, jpTemp);
                writeJSON('text_temp', 'jpTemp.json', jpTemp);
            } else if (type === 'overwrite') {
                let overwriteTemp = readJSONPure('text_temp', 'overwriteTemp.json');
                overwriteTemp = deleteTemp(textBefore, overwriteTemp);
                writeJSON('text_temp', 'overwriteTemp.json', overwriteTemp);
            } else {
                let chTemp = readJSONPure('text_temp', 'chTemp.json');
                chTemp = deleteTemp(textBefore, chTemp);
                writeJSON('text_temp', 'chTemp.json', chTemp);
            }

            ipcRenderer.send('send-preload', 'show-notification', '已刪除自訂翻譯');
            ipcRenderer.send('send-preload', 'read-json');
        } else {
            ipcRenderer.send('send-preload', 'show-notification', '「替換前(原文)」不可為空白');
        }
    });

    // close
    $('#img_button_close').on('click', () => {
        ipcRenderer.send('close-window');
    });
}

function addTemp(textBefore, textAfter, type, array) {
    if (textBefore.length < 3) {
        textBefore = textBefore + '*';
    }

    if (sameAsArrayItem(textBefore, array)) {
        for (let index = 0; index < array.length; index++) {
            const item = array[index];

            if (item[0] === textBefore) {
                if (type !== 'jp' && type !== 'overwrite') {
                    array[index] = [textBefore, textAfter, type];
                } else {
                    array[index] = [textBefore, textAfter];
                }

                break;
            }
        }
    } else {
        array.push([textBefore, textAfter, type]);
    }

    return array;
}

function deleteTemp(textBefore, array) {
    if (textBefore.length < 3) {
        textBefore = textBefore + '*';
    }

    for (let index = array.length - 1; index >= 0; index--) {
        const item = array[index];

        if (item[0] === textBefore) {
            array.splice(index, 1);
        }
    }

    return array;
}