'use strict';

// ipcRenderer
const { ipcRenderer } = require('electron');

// language table
const { getLanguageCode } = require('./engine-module');

// play list
let playlist = [];
let isPlaying = false;
let playInterval = null;

// add audio
function addToPlaylist(text, translation) {
    if (translation.autoPlay && text !== '') {
        try {
            const languageCode = getLanguageCode(translation.from, 'Google');
            const urls = ipcRenderer.sendSync('get-translation', 'GoogleTTS', { text: text, language: languageCode });

            for (let index = 0; index < urls.length; index++) {
                const url = urls[index];
                const audio = new Audio(url);
                audio.onended = () => {
                    isPlaying = false;
                };

                // add to playlist
                playlist.push(audio);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

// clear playlist
function clearPlaylist() {
    playlist = [];
}

// start/restart playing
function startPlaying() {
    clearInterval(playInterval);
    playInterval = setInterval(() => {
        playNext();
    }, 1000);
}

// play next audio
function playNext() {
    try {
        if (!isPlaying) {
            const audio = playlist.shift();

            if (audio) {
                isPlaying = true;
                audio.currentTime = 0;
                audio.play();
            }
        }
    } catch (error) {
        console.log(error);
        isPlaying = false;
    }
}

exports.addToPlaylist = addToPlaylist;
exports.clearPlaylist = clearPlaylist;
exports.startPlaying = startPlaying;
