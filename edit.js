'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// fs
const { readFileSync } = require('fs');

// json fixer
const jsonFixer = require('json-fixer');

// text to speech
const googleTTS = require('google-tts-api');

// language table
const { googleTable } = require('./module/translator/language-table');

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
    document.getElementById('select_restart_engine').value = config.translation.engine;
    document.getElementById('checkbox_replace').checked = config.translation.replace;
}

// set event
function setEvent() {
    ipcRenderer.on('send-data', (event, id) => {
        try {
            const milliseconds = parseInt(id.slice(2));
            const logFileList = [createLogName(milliseconds), createLogName(milliseconds + 86400000), createLogName(milliseconds - 86400000)];
            console.log('log files:', logFileList);

            if (logFileList.length > 0) {
                for (let index = 0; index < logFileList.length; index++) {
                    try {
                        const logFile = logFileList[index];
                        const log = jsonFixer(readFileSync('./json/log/' + logFile).toString()).data;


                        if (log[id]) {
                            targetLog = log[id];
                            console.log('log file:', logFile);
                            console.log('target log:', targetLog);

                            // text to speech
                            if (targetLog.text !== '') {
                                const url = googleTTS.getAudioUrl(targetLog.text, { lang: googleTable[targetLog.translation.from] });
                                console.log('TTS url:', url);

                                document.getElementById('div_audio').innerHTML = `
                                    <audio controls preload="metadata">
                                        <source src="${url}" type="audio/ogg">
                                        <source src="${url}" type="audio/mpeg">
                                    </audio>
                                `;
                            }

                            const dialog1 = document.getElementById('div_dialog1');
                            const dialog2 = document.getElementById('div_dialog2');

                            dialog1.replaceChildren();
                            if (targetLog.name !== '') {
                                dialog1.innerHTML = `<span>${targetLog.name}:</span><br><span>${targetLog.text}</span>`;
                            } else {
                                dialog1.innerHTML = `<span>${targetLog.text}</span>`;
                            }

                            dialog2.replaceChildren();
                            if (targetLog.translated_name !== '') {
                                dialog2.innerHTML = `<span>${targetLog.translated_name}:</span><br><span>${targetLog.translated_text}</span>`;
                            } else {
                                dialog2.innerHTML = `<span>${targetLog.translated_text}</span>`;
                            }

                            break;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                if (targetLog && targetLog.code !== 'FFFF') {
                    document.getElementById('div_restart').hidden = false;
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    document.getElementById('checkbox_replace').oninput = () => {
        let config = ipcRenderer.sendSync('load-config');
        config.translation.replace = document.getElementById('checkbox_replace').checked;
        ipcRenderer.send('save-config', config);
    };
}

// set button
function setButton() {
    // github
    document.getElementById('a_github').onclick = () => {
        exec('explorer "https://github.com/winw1010/tataru-helper-node-text-ver.2.0.0"');
    };

    // restart
    document.getElementById('button_restart').onclick = () => {
        const config = ipcRenderer.sendSync('load-config');

        if (!config.translation.replace) {
            const timestamp = new Date().getTime();
            targetLog.id = 'id' + timestamp;
            targetLog.timestamp = timestamp;
        }

        let dialogData = {
            id: targetLog.id,
            playerName: targetLog.player,
            code: targetLog.code,
            name: targetLog.name,
            text: targetLog.text,
            timestamp: targetLog.timestamp
        };

        let translation = config.translation;
        translation.engine = document.getElementById('select_restart_engine').value;

        ipcRenderer.send('send-preload', 'restart-translation', dialogData, translation);
    };

    document.getElementById('button_reload_json').onclick = () => {
        ipcRenderer.send('send-preload', 'read-json');
    };

    document.getElementById('button_view_temp').onclick = () => {
        exec('start "" "json\\text_temp"');
    };

    // save custom
    document.getElementById('button_save_temp').onclick = () => {
        const textBefore = document.getElementById('textarea_before').value.replaceAll('\n', '').trim();
        const textAfter = document.getElementById('textarea_after').value.replaceAll('\n', '').trim();
        const type = document.getElementById('select_type').value;

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
    };

    document.getElementById('button_delete_temp').onclick = () => {
        const textBefore = document.getElementById('textarea_before').value.replaceAll('\n', '').trim();
        const type = document.getElementById('select_type').value;

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
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };
}

function addTemp(textBefore, textAfter, type, array) {
    if (textBefore.length < 3) {
        textBefore = textBefore + '*';
    }

    if (sameAsArrayItem(textBefore, array)) {
        for (let index = 0; index < array.length; index++) {
            const item = array[index];

            if (item[0] === textBefore) {
                array[index] = (type !== 'jp' && type !== 'overwrite') ? [textBefore, textAfter, type] : [textBefore, textAfter];
                break;
            }
        }
    } else {
        array.push((type !== 'jp' && type !== 'overwrite') ? [textBefore, textAfter, type] : [textBefore, textAfter]);
    }

    return array;
}

function deleteTemp(textBefore, array) {
    let count = 0;

    if (textBefore.length < 3) {
        textBefore = textBefore + '*';
    }

    for (let index = array.length - 1; index >= 0; index--) {
        const item = array[index];

        if (item[0] === textBefore) {
            array.splice(index, 1);
            count++;
        }
    }

    ipcRenderer.send('send-preload', 'show-notification', `共找到${count}個`);

    return array;
}