'use strict';

// fs
const { unlinkSync } = require('fs');

// path
const { resolve } = require('path');

// Communicate with main process
const { ipcRenderer } = require('electron');

// axios
const axios = require('axios').default;

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
function setView() {}

// set event
function setEvent() {
    ipcRenderer.on('send-data', (event, data) => {
        $('#textarea_screen_text').val(data);
    });
}

// set button
function setButton() {
    // submit
    $('#button_submit').on('click', () => {
        translate($('#textarea_screen_text').val().toString());
    });

    // close
    $('#img_button_close').on('click', () => {
        ipcRenderer.send('close-window');
    });
}

function translate(result) {
    const config = ipcRenderer.sendSync('load-config');

    // set array
    let array = [];
    if (config.captureWindow.split) {
        array = result.split('\n');
    } else {
        array = [result.replace(/\n/g, ' ')];
    }

    // delete images
    deleteImages();

    // start translate
    for (let index = 0; index < array.length; index++) {
        if (array[index] !== '') {
            let data = {
                code: '003D',
                playerName: '',
                name: '',
                text: array[index]
            }

            setTimeout(() => {
                post(data);
            }, index * 200);
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
        unlinkSync(getPath('gray.png'));
    } catch (error) {
        console.log(error);
    }

    try {
        unlinkSync(getPath('result.png'));
    } catch (error) {
        console.log(error);
    }
}

// post
function post(data) {
    const config = ipcRenderer.sendSync('load-config');
    const host = config.server.host;
    const port = config.server.port;

    axios({
            method: 'post',
            url: `http://${host}:${port}`,
            data: data
        })
        .then(function(response) {
            console.log(response);
        })
        .catch(function(error) {
            console.log(error);
        });
}