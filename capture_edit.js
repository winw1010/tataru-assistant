'use strict';

// fs
const { unlinkSync } = require('fs');

// path
const { resolve } = require('path');

// communicate with main process
const { ipcRenderer } = require('electron');

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
    document.getElementById('img_result').setAttribute('src', getPath('result.png'));
}

// set event
function setEvent() {
    ipcRenderer.on('send-data', (event, data) => {
        document.getElementById('textarea_screen_text').value = data;
    });
}

// set button
function setButton() {
    // drag
    setDragElement(document.getElementById("img_button_drag"));

    // submit
    document.getElementById('button_submit').onclick = () => {
        translate(document.getElementById('textarea_screen_text').value);
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };
}

function translate(text) {
    const config = ipcRenderer.sendSync('load-config');

    // set array
    let array = [];
    if (config.captureWindow.split) {
        array = text.split('\n');
    } else {
        array = [text.replaceAll(/\n/gi, '')];
    }

    // delete images
    deleteImages();

    // start translate
    const timestamp = new Date().getTime();
    for (let index = 0; index < array.length; index++) {
        if (array[index] !== '') {
            const dialogData = {
                id: 'id' + (timestamp + index),
                code: '003D',
                playerName: '',
                name: '',
                text: array[index],
                timestamp: (timestamp + index)
            }

            ipcRenderer.send('send-preload', 'start-translation', dialogData, config.translation);
        }
    }
}

// get path
function getPath(file) {
    return resolve(process.cwd(), 'trained_data', file);
}

// delete images
function deleteImages() {
    try {
        unlinkSync(getPath('screenshot.png'));
    } catch (error) {
        console.log(error);
    }

    try {
        unlinkSync(getPath('crop.png'));
    } catch (error) {
        console.log(error);
    }

    try {
        unlinkSync(getPath('result.png'));
    } catch (error) {
        console.log(error);
    }
}