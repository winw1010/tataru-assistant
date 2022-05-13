'use strict';

// text to speech
const googleTTS = require('google-tts-api');

// language table
const { googleTable, getTableValue } = require('./translator/language-table');

// play list
let playlist = [];
let isPlaying = false;
let playInterval = null;

// add audio
function addToPlaylist(dialogData, translation) {
    if (translation.autoPlay && dialogData.text !== '') {
        try {
            const url = googleTTS.getAudioUrl(dialogData.text, { lang: getTableValue(translation.from, googleTable) });
            const audio = new Audio(url);
            audio.onended = () => {
                isPlaying = false;
            }

            // add to playlist
            playlist.push(audio);
        } catch (error) {
            console.log(error);
        }
    }
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
    }
}

exports.addToPlaylist = addToPlaylist;
exports.startPlaying = startPlaying;