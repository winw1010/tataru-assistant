'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// correction function
const { sameAsArrayItem } = require('./main_modules/correction-function');

// file module
const fm = require('./main_modules/file-module');

// language table
const { getLanguageCode } = require('./main_modules/engine-module');

// drag module
const { setDragElement } = require('./renderer_modules/drag-module');

// ui module
const { changeUIText } = require('./renderer_modules/ui-module');

// create log name
const { createLogName } = require('./renderer_modules/dialog-module');

// google tts
const { getAudioUrl } = require('./main_modules/translator/google-tts');

// Japanese character
const allKana = /^[ぁ-ゖァ-ヺ]+$/gi;

// log location
const logPath = fm.getUserDataPath('log');

// temp location
const tempPath = fm.getUserDataPath('temp');

// target log
let targetLog = null;

// google form
const formId = '1FAIpQLScj8LAAHzy_nTIbbJ1BSqNzyZy3w5wFrLxDVUMbY0BIAjaIAg';
const entry1 = 'entry.195796166';
const entry2 = 'entry.1834106335';
const entry3 = 'entry.2057890818';
const entry4 = 'entry.654133178';

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setEvent();
    setIPC();
    setButton();
});

// set view
function setView() {
    const config = ipcRenderer.sendSync('get-config');
    document.getElementById('select_restart_engine').value = config.translation.engine;
    document.getElementById('select_from').value = config.translation.from;
    document.getElementById('checkbox_replace').checked = config.translation.replace;
    changeUIText();
}

// set event
function setEvent() {
    document.getElementById('checkbox_replace').oninput = () => {
        let config = ipcRenderer.sendSync('get-config');
        config.translation.replace = document.getElementById('checkbox_replace').checked;
        ipcRenderer.send('set-config', config);
    };
}

// set IPC
function setIPC() {
    ipcRenderer.on('send-data', (event, id) => {
        try {
            const milliseconds = parseInt(id.slice(2));
            const logFileList = [
                createLogName(milliseconds),
                createLogName(milliseconds + 86400000),
                createLogName(milliseconds - 86400000),
            ];

            if (logFileList.length > 0) {
                for (let index = 0; index < logFileList.length; index++) {
                    try {
                        const filePath = fm.getPath(logPath, logFileList[index]);
                        const log = fm.jsonReader(filePath, false);
                        targetLog = log[id];

                        if (targetLog) {
                            break;
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

                if (targetLog) {
                    // show audio
                    showAudio();

                    // show text
                    showText();

                    // show restart
                    if (targetLog.code !== 'FFFF') {
                        document.getElementById('div_restart').hidden = false;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    });
}

// set button
function setButton() {
    // drag
    setDragElement(document.getElementById('img_button_drag'));

    // restart
    document.getElementById('button_restart_translate').onclick = () => {
        const config = ipcRenderer.sendSync('get-config');

        let dialogData = {
            id: targetLog.id,
            playerName: targetLog.player,
            code: targetLog.code,
            name: targetLog.name,
            text: targetLog.text,
            timestamp: targetLog.timestamp,
        };

        if (!config.translation.replace) {
            const timestamp = new Date().getTime();
            dialogData.id = 'id' + timestamp;
            dialogData.timestamp = timestamp;
        }

        let translation = config.translation;
        translation.from = document.getElementById('select_from').value;
        translation.fromPlayer = document.getElementById('select_from').value;
        translation.engine = document.getElementById('select_restart_engine').value;

        ipcRenderer.send('send-index', 'append-blank-dialog', dialogData.id, dialogData.code);
        ipcRenderer.send('start-translation', dialogData, translation);
    };

    // load json
    document.getElementById('button_read_json').onclick = () => {
        ipcRenderer.send('load-json');
    };

    // report translation
    document.getElementById('button_report_translation').onclick = () => {
        postForm();
    };

    // save custom
    document.getElementById('button_save_temp').onclick = () => {
        const textBefore = document.getElementById('textarea_before').value.replaceAll('\n', '').trim();
        const textAfter = document.getElementById('textarea_after').value.replaceAll('\n', '').trim();
        const type = document.getElementById('select_type').value;

        if (textBefore !== '' && textAfter !== '') {
            if (type === 'jp') {
                let jpTemp = fm.jsonReader(fm.getPath(tempPath, 'jpTemp.json'));
                jpTemp = addTemp(textBefore, textAfter, type, jpTemp);
                fm.jsonWriter(fm.getPath(tempPath, 'jpTemp.json'), jpTemp);
            } else if (type === 'overwrite') {
                let overwriteTemp = fm.jsonReader(fm.getPath(tempPath, 'overwriteTemp.json'));
                overwriteTemp = addTemp(textBefore, textAfter, type, overwriteTemp);
                fm.jsonWriter(fm.getPath(tempPath, 'overwriteTemp.json'), overwriteTemp);
            } else if (type === 'player' || type === 'retainer') {
                let playerTemp = fm.jsonReader(fm.getPath(tempPath, 'player.json'));
                playerTemp = addTemp(textBefore, textAfter, type, playerTemp);
                fm.jsonWriter(fm.getPath(tempPath, 'player.json'), playerTemp);
            } else {
                let chTemp = fm.jsonReader(fm.getPath(tempPath, 'chTemp.json'));
                chTemp = addTemp(textBefore, textAfter, type, chTemp);
                fm.jsonWriter(fm.getPath(tempPath, 'chTemp.json'), chTemp);
            }

            ipcRenderer.send('send-index', 'show-notification', '已儲存自訂翻譯');
            ipcRenderer.send('load-json');
        } else {
            ipcRenderer.send('send-index', 'show-notification', '「替換前(原文)」和「替換後(自訂翻譯)」不可為空白');
        }
    };

    // delete temp
    document.getElementById('button_delete_temp').onclick = () => {
        const textBefore = document.getElementById('textarea_before').value.replaceAll('\n', '').trim();
        const type = document.getElementById('select_type').value;

        if (textBefore !== '') {
            if (type === 'jp') {
                let jpTemp = fm.jsonReader(fm.getPath(tempPath, 'jpTemp.json'));
                jpTemp = deleteTemp(textBefore, type, jpTemp);
                fm.jsonWriter(fm.getPath(tempPath, 'jpTemp.json'), jpTemp);
            } else if (type === 'overwrite') {
                let overwriteTemp = fm.jsonReader(fm.getPath(tempPath, 'overwriteTemp.json'));
                overwriteTemp = deleteTemp(textBefore, type, overwriteTemp);
                fm.jsonWriter(fm.getPath(tempPath, 'overwriteTemp.json'), overwriteTemp);
            } else if (type === 'player' || type === 'retainer') {
                let playerTemp = fm.jsonReader(fm.getPath(tempPath, 'player.json'));
                playerTemp = deleteTemp(textBefore, type, playerTemp);
                fm.jsonWriter(fm.getPath(tempPath, 'player.json'), playerTemp);
            } else {
                let chTemp = fm.jsonReader(fm.getPath(tempPath, 'chTemp.json'));
                chTemp = deleteTemp(textBefore, type, chTemp);
                fm.jsonWriter(fm.getPath(tempPath, 'chTemp.json'), chTemp);
            }

            ipcRenderer.send('send-index', 'show-notification', '已刪除自訂翻譯');
            ipcRenderer.send('load-json');
        } else {
            ipcRenderer.send('send-index', 'show-notification', '「替換前(原文)」不可為空白');
        }
    };

    // view temp
    document.getElementById('button_view_temp').onclick = () => {
        try {
            ipcRenderer.send('execute-command', `start "" "${tempPath}"`);
        } catch (error) {
            console.log(error);
        }
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };
}

function showAudio() {
    const text = targetLog.audio_text ? targetLog.audio_text : targetLog.text;

    if (text !== '') {
        try {
            const languageCode = getLanguageCode(targetLog.translation.from, 'Google');
            const urls = getAudioUrl({ text: text, language: languageCode });
            console.log('TTS url:', urls);

            let innerHTML = '';
            for (let index = 0; index < urls.length; index++) {
                const url = urls[index];

                innerHTML += `
                    <audio controls preload="metadata">
                        <source src="${url}" type="audio/ogg">
                        <source src="${url}" type="audio/mpeg">
                    </audio>
                    <br>
                `;
            }

            document.getElementById('div_audio').innerHTML = innerHTML;
        } catch (error) {
            console.log(error);
        }
    }
}

function showText() {
    const text1 = document.getElementById('div_text1');
    const text2 = document.getElementById('div_text2');

    text1.innerHTML = `<span>${targetLog.name !== '' ? targetLog.name + ':<br>' : ''}${targetLog.text}</span>`;
    text2.innerHTML =
        `<span>${targetLog.translated_name !== '' ? targetLog.translated_name + ':<br>' : ''}` +
        `${targetLog.translated_text}</span>`;
}

function addTemp(textBefore, textAfter, type, array) {
    const list = ['jp', 'overwrite', 'player', 'retainer'];
    if (textBefore.length < 3 && !list.includes(type) && allKana.test(textBefore)) {
        textBefore = textBefore + '#';
    }

    const target = sameAsArrayItem(textBefore, array);
    if (target) {
        array[target[1]] = !list.includes(type) ? [textBefore, textAfter, type] : [textBefore, textAfter];
    } else {
        array.push(!list.includes(type) ? [textBefore, textAfter, type] : [textBefore, textAfter]);
    }

    return array;
}

function deleteTemp(textBefore, type, array) {
    const list = ['jp', 'overwrite', 'player', 'retainer'];
    let count = 0;

    if (textBefore.length < 3 && !list.includes(type) && allKana.test(textBefore)) {
        textBefore = textBefore + '#';
    }

    for (let index = array.length - 1; index >= 0; index--) {
        const element = array[index];

        if (element[0] === textBefore) {
            array.splice(index, 1);
            count++;
        }
    }

    ipcRenderer.send('send-index', 'show-notification', `共找到${count}個`);

    return array;
}

// post to form
function postForm() {
    try {
        const text1 = (targetLog.name !== '' ? targetLog.name + ': ' : '') + targetLog.text;
        const text2 =
            (targetLog.translated_name !== '' ? targetLog.translated_name + ': ' : '') + targetLog.translated_text;
        const path =
            `/forms/d/e/${formId}/formResponse?` +
            `${entry1}=待處理` +
            `&${entry2}=${targetLog.translation.engine}` +
            `&${entry3}=${text1}` +
            `&${entry4}=${text2}`;

        ipcRenderer.send('post-form', encodeURI(path));
        ipcRenderer.send('send-index', 'show-notification', '回報完成');
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', error);
    }
}
