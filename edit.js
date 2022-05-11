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
const { googleTable, getTableValue } = require('./module/translator/language-table');

// cf
const cf = require('./module/correction-function');

// drag module
const { setDragElement } = require('./module/drag-module');

// create log name
const { createLogName } = require('./module/dialog-module');

// child process
const { execSync } = require('child_process');

// Japanese character
const kana = /^[ァ-ヺぁ-ゖ]+$/gi;

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

    setView();
    setEvent();
    setButton();
});

// set view
function setView() {
    const config = ipcRenderer.sendSync('get-config');
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
                                const url = googleTTS.getAudioUrl(targetLog.text, { lang: getTableValue(targetLog.translation.from, googleTable) });
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
        let config = ipcRenderer.sendSync('get-config');
        config.translation.replace = document.getElementById('checkbox_replace').checked;
        ipcRenderer.send('set-config', config);
    };
}

// set button
function setButton() {
    // drag
    setDragElement(document.getElementById('img_button_drag'));

    // github
    document.getElementById('a_github').onclick = () => {
        try {
            execSync('explorer "https://github.com/winw1010/tataru-helper-node-text-ver.2.0.0#readme"');
        } catch (error) {
            console.log(error);
        }
    };

    // restart
    document.getElementById('button_restart').onclick = () => {
        const config = ipcRenderer.sendSync('get-config');

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

        ipcRenderer.send('send-preload', 'start-translation', dialogData, translation);
    };

    document.getElementById('button_read_json').onclick = () => {
        ipcRenderer.send('send-preload', 'read-json');
    };

    document.getElementById('button_view_temp').onclick = () => {
        try {
            execSync('start "" "json\\text_temp"');
        } catch (error) {
            console.log(error);
        }
    };

    // save custom
    document.getElementById('button_save_temp').onclick = () => {
        const textBefore = document.getElementById('textarea_before').value.replaceAll('\n', '').trim();
        const textAfter = document.getElementById('textarea_after').value.replaceAll('\n', '').trim();
        const type = document.getElementById('select_type').value;

        if (textBefore !== '' && textAfter !== '') {
            if (type === 'jp') {
                let jpTemp = cf.readJSONPure('text_temp', 'jpTemp.json');
                jpTemp = addTemp(textBefore, textAfter, type, jpTemp);
                cf.writeJSON('text_temp', 'jpTemp.json', jpTemp);
            } else if (type === 'overwrite') {
                let overwriteTemp = cf.readJSONPure('text_temp', 'overwriteTemp.json');
                overwriteTemp = addTemp(textBefore, textAfter, type, overwriteTemp);
                cf.writeJSON('text_temp', 'overwriteTemp.json', overwriteTemp);
            } else {
                let chTemp = cf.readJSONPure('text_temp', 'chTemp.json');
                chTemp = addTemp(textBefore, textAfter, type, chTemp);
                cf.writeJSON('text_temp', 'chTemp.json', chTemp);
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
                let jpTemp = cf.readJSONPure('text_temp', 'jpTemp.json');
                jpTemp = deleteTemp(textBefore, type, jpTemp);
                cf.writeJSON('text_temp', 'jpTemp.json', jpTemp);
            } else if (type === 'overwrite') {
                let overwriteTemp = cf.readJSONPure('text_temp', 'overwriteTemp.json');
                overwriteTemp = deleteTemp(textBefore, type, overwriteTemp);
                cf.writeJSON('text_temp', 'overwriteTemp.json', overwriteTemp);
            } else {
                let chTemp = cf.readJSONPure('text_temp', 'chTemp.json');
                chTemp = deleteTemp(textBefore, type, chTemp);
                cf.writeJSON('text_temp', 'chTemp.json', chTemp);
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
    if (textBefore.length < 3 && type !== 'jp' && type !== 'overwrite') {
        if (kana.test(textBefore)) {
            textBefore = textBefore + '#';
        }
    }

    const target = cf.sameAsArrayItem(textBefore, array);
    if (target) {
        array[target[1]] = (type !== 'jp' && type !== 'overwrite') ? [textBefore, textAfter, type] : [textBefore, textAfter];
    } else {
        array.push((type !== 'jp' && type !== 'overwrite') ? [textBefore, textAfter, type] : [textBefore, textAfter]);
    }

    return array;
}

function deleteTemp(textBefore, type, array) {
    let count = 0;

    if (textBefore.length < 3 && type !== 'jp' && type !== 'overwrite') {
        if (kana.test(textBefore)) {
            textBefore = textBefore + '#';
        }
    }

    for (let index = array.length - 1; index >= 0; index--) {
        const element = array[index];

        if (element[0] === textBefore) {
            array.splice(index, 1);
            count++;
        }
    }

    ipcRenderer.send('send-preload', 'show-notification', `共找到${count}個`);

    return array;
}