'use strict';
/* eslint-disable */

onDocumentReady(() => {
    // npc channel
    const npcChannel = ['003D', '0044', '2AB9'];

    // log location
    const logLocation = ipcRendererSendSync('get-user-data-path', 'log');

    // dialog timeout
    let hideDialogTimeout = null;

    // append blank dialog
    document.addEventListener('append-blank-dialog', (ev) => {
        appendBlankDialog(ev.detail.id, ev.detail.code);
    });

    function appendBlankDialog(id, code) {
        if (document.getElementById(id)) {
            const dialog = document.getElementById(id);
            dialog.innerHTML = '<span>......</span>';
            return;
        }

        const dialog = document.createElement('div');
        dialog.setAttribute('id', id);
        dialog.setAttribute('class', code);
        dialog.style.display = 'none';
        setStyle(dialog);
        document.getElementById('div_dialog').append(dialog);

        if (document.querySelectorAll('#div_dialog div').length > 0) {
            document.getElementById(document.getElementById('div_dialog').firstElementChild.id).style.marginTop = '0';
        }
    }

    // update dialog
    document.addEventListener('update-dialog', (ev) => {
        updateDialog(ev.detail.id, ev.detail.name, ev.detail.text, ev.detail.dialogData, ev.detail.translation);
    });

    async function updateDialog(id, name, text, dialogData = null, translation = null) {
        // zh convert
        if (translation) {
            name = await ipcRendererInvoke('zh-convert', name, translation.to);
            text = await ipcRendererInvoke('zh-convert', text, translation.to);
        }

        // set dialog
        const dialog = document.getElementById(id);
        dialog.innerHTML = '';
        dialog.style.display = 'block';

        if (dialog.className !== 'FFFF') {
            dialog.style.cursor = 'pointer';
            dialog.onclick = () => {
                ipcRendererSend('restart-window', 'edit', id);
            };
        }

        // set content
        const spanName = document.createElement('span');
        spanName.innerHTML = name + '：<br>';

        const spanText = document.createElement('span');
        spanText.innerHTML = text;

        name !== '' ? dialog.append(spanName) : null;
        dialog.append(spanText);

        // show dialog
        showDialog();

        if (dialogData && translation) {
            // save dialog
            saveLog(id, name, text, dialogData, translation);
        }

        // move to dialog
        location.href = '#' + id;
    }

    // show notification
    document.addEventListener('show-notification', (ev) => {
        appendNotification(ev.detail.text);
    });

    async function appendNotification(text) {
        const config = ipcRendererSendSync('get-config');
        const timestamp = new Date().getTime();
        const id = 'id' + timestamp;
        const code = 'FFFF';

        // zh convert
        text = await ipcRendererInvoke('zh-convert', text, config.translation.to);

        appendBlankDialog(id, code);
        updateDialog(id, '', text).then(() => {
            // set timeout
            setTimeout(() => {
                try {
                    document.getElementById(id).remove();
                } catch (error) {
                    console.log(error);
                }
            }, 5000 + Math.floor(text.length / 20));
        });
    }

    // show dialog
    document.addEventListener('show-dialog', () => {
        showDialog();
    });

    function showDialog() {
        clearTimeout(hideDialogTimeout);
        hideDialogTimeout = null;

        const config = ipcRendererSendSync('get-config');
        const dialog = document.getElementById('div_dialog');
        dialog.hidden = false;

        if (config.indexWindow.hideDialog) {
            hideDialogTimeout = setTimeout(() => {
                dialog.hidden = true;
            }, config.indexWindow.hideDialogTimeout * 1000);
        }
    }

    // reset dialog style
    document.addEventListener('reset-dialog-style', () => {
        resetDialogStyle();
    });

    function resetDialogStyle() {
        const dialogs = document.querySelectorAll('#div_dialog div');
        if (dialogs.length > 0) {
            dialogs.forEach((value) => {
                setStyle(document.getElementById(value.id));
            });

            document.getElementById(dialogs[0].id).style.marginTop = '0';
        }
    }

    // set style
    function setStyle(dialog) {
        const config = ipcRendererSendSync('get-config');

        dialog.style.fontWeight = config.dialog.weight;
        dialog.style.color = config.channel[dialog.className]
            ? config.channel[dialog.className]
            : getColor(dialog.className);
        dialog.style.fontSize = config.dialog.fontSize + 'rem';
        dialog.style.marginTop = config.dialog.spacing + 'rem';
        dialog.style.borderRadius = config.dialog.radius + 'rem';
        dialog.style.backgroundColor = config.dialog.backgroundColor;
    }

    // get color
    function getColor(code) {
        const chatCode = getApi('getChatCode')('get-chat-code');
        let color = '#FFFFFF';

        for (let index = 0; index < chatCode.length; index++) {
            const element = chatCode[index];

            if (code === element.ChatCode) {
                color = element.Color;
                break;
            }
        }

        return color;
    }

    // save dialog
    function saveLog(id, name, text, dialogData, translation) {
        const item = {
            id: id,
            code: dialogData.code,
            player: dialogData.playerName,
            name: dialogData.name,
            text: dialogData.text,
            audio_text: dialogData.audioText,
            translated_name: name,
            translated_text: text,
            timestamp: dialogData.timestamp,
            datetime: new Date(dialogData.timestamp).toLocaleString(),
            translation: translation,
        };

        const filePath = ipcRendererSendSync('get-path', logLocation, createLogName(item.timestamp));
        let log = {};

        // read/create log file
        if (ipcRendererSendSync('file-checker', filePath)) {
            log = ipcRendererSendSync('json-reader', filePath, false);

            // fix old bug
            if (Array.isArray(log)) {
                log = {};
            }
        }

        // play audio at first time
        if (!log[item.id]) {
            if (npcChannel.includes(dialogData.code)) {
                document.dispatchEvent(
                    new CustomEvent('add-to-playlist', { detail: { text: dialogData.audioText, translation } })
                );
            }
        }

        // add/replcae log
        log[item.id] = item;

        // write log file
        try {
            ipcRendererSend('json-writer', filePath, log);
        } catch (error) {
            console.error(error);
        }
    }

    // create log name
    function createLogName(milliseconds = null) {
        const date = Number.isInteger(milliseconds) ? new Date(milliseconds) : new Date();
        let dateString = date.toLocaleDateString().split('/');

        if (dateString[1].length < 2) {
            dateString[1] = '0' + dateString[1];
        }

        if (dateString[2].length < 2) {
            dateString[2] = '0' + dateString[2];
        }

        return dateString.join('-') + '.json';
    }

    // move to bottom
    document.addEventListener('move-to-bottom', () => {
        moveToBottom();
    });

    function moveToBottom() {
        clearSelection();

        let div = document.getElementById('div_dialog') || document.scrollingElement || document.body;
        div.scrollTop = div.scrollHeight;
    }

    // clear selection
    function clearSelection() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    }
});
