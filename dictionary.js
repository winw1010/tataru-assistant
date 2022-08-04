'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// engine module
const { getOption, getLanguageCode } = require('./renderer_modules/engine-module');

// drag module
const { setDragElement } = require('./renderer_modules/drag-module');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setIPC();
    setButton();
});

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
}

// set IPC
function setIPC() {}

// set button
function setButton() {
    // drag
    setDragElement(document.getElementById('img_button_drag'));

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };

    // translate
    document.getElementById('button_translate').onclick = () => {
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

            // get translated text
            const translatedText = getTranslation(engine, option);

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
        } else {
            document.getElementById('span_translated_text').innerText = '翻譯文字不可空白';
            document.getElementById('div_audio').innerHTML = '';
        }
    };
}

// get translation
function getTranslation(engine, option) {
    let translatedText = ipcRenderer.sendSync('get-translation', engine, option);
    console.log(engine + ':', translatedText);

    return translatedText;
}

// get audio html
function getAudioHtml(text, language) {
    if (text !== '') {
        try {
            const languageCode = getLanguageCode(language, 'Google');
            const urls = ipcRenderer.sendSync('get-translation', 'GoogleTTS', { text: text, language: languageCode });
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
