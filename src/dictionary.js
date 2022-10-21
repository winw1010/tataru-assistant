'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

// engine module
const { getOption, getLanguageCode } = require('./main_modules/system/engine-module');

// google tts
const { getAudioUrl } = require('./main_modules/translator/google-tts');

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
        dragWindow: (...args) => {
            ipcRenderer.send('drag-window', ...args);
        },
        getConfig: () => {
            return ipcRenderer.sendSync('get-config');
        },
    });
}

// set IPC
function setIPC() {
    // change UI text
    ipcRenderer.on('change-ui-text', () => {
        document.dispatchEvent(new CustomEvent('change-ui-text'));
    });
}

// set view
function setView() {
    const config = ipcRenderer.sendSync('get-config');
    document.getElementById('select_engine').value = config.translation.engine;
    document.getElementById('select_from').value = /chinese/i.test(config.translation.to)
        ? 'Chinese'
        : config.translation.to;
    document.getElementById('select_to').value = /chinese/i.test(config.translation.from)
        ? 'Chinese'
        : config.translation.from;
    document.dispatchEvent(new CustomEvent('change-ui-text'));
}

// set enevt
function setEvent() {}

// set button
function setButton() {
    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };

    // exchange
    document.getElementById('button_exchange').onclick = () => {
        const valueFrom = document.getElementById('select_from').value;
        document.getElementById('select_from').value = document.getElementById('select_to').value;
        document.getElementById('select_to').value = valueFrom;
    };

    // translate
    document.getElementById('button_translate').onclick = () => {
        document.getElementById('span_translated_text').innerText = '...';
        document.getElementById('div_audio').innerHTML = '';

        if (document.getElementById('textarea_original_text').value.trim() !== '') {
            // set engine
            const engine = document.getElementById('select_engine').value;

            // set option
            const option = getOption(
                engine,
                document.getElementById('select_from').value,
                document.getElementById('select_to').value,
                document.getElementById('textarea_original_text').value
            );

            // translate text
            ipcRenderer
                .invoke('get-translation', engine, option)
                .then((translatedText) => {
                    // show translated text
                    if (translatedText !== '') {
                        document.getElementById('span_translated_text').innerText = translatedText;
                        document.getElementById('div_audio').innerHTML = getAudioHtml(
                            translatedText,
                            document.getElementById('select_to').value
                        );
                    } else {
                        document.getElementById('span_translated_text').innerText = '翻譯失敗，請稍後再試';
                        document.getElementById('div_audio').innerHTML = '';
                    }
                })
                .catch(console.log);
        } else {
            document.getElementById('span_translated_text').innerText = '翻譯文字不可空白';
            document.getElementById('div_audio').innerHTML = '';
        }
    };
}

// get audio html
function getAudioHtml(text, language) {
    if (text !== '') {
        try {
            const languageCode = getLanguageCode(language, 'Google');
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

            return innerHTML;
        } catch (error) {
            console.log(error);
            return '';
        }
    }
}
