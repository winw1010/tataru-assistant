'use strict';

// language table
const { getLanguageCode } = require('./engine-module');

// google tts
const { getAudioUrl } = require('../main_modules/translator/google-tts');

// play list
let playlist = [];
let nowPlaying = null;
let playInterval = null;

// add audio
function addToPlaylist(text, translation) {
    if (translation.autoPlay && text !== '') {
        try {
            const languageCode = getLanguageCode(translation.from, 'Google');
            const urls = getAudioUrl({ text: text, language: languageCode });

            for (let index = 0; index < urls.length; index++) {
                const url = urls[index];
                const audio = new Audio(url);

                // set audio event
                audio.onpause = () => {
                    nowPlaying = null;
                };

                audio.onended = () => {
                    nowPlaying = null;
                };

                audio.onerror = () => {
                    nowPlaying = null;
                };

                // add to playlist
                playlist.push(audio);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

// start playing
function startPlaying() {
    clearInterval(playInterval);

    playInterval = setInterval(() => {
        playNext();
    }, 1000);
}

// stop playing
function stopPlaying() {
    clearInterval(playInterval);

    try {
        nowPlaying.pause();
    } catch (error) {
        console.log(error);
    }

    nowPlaying = null;
    playlist = [];
}

// play next audio
function playNext() {
    try {
        if (!nowPlaying) {
            const audio = playlist.shift();

            if (audio) {
                nowPlaying = audio;
                audio.currentTime = 0;
                audio.play();
            }
        }
    } catch (error) {
        console.log(error);
        nowPlaying = null;
    }
}

// module exports
module.exports = {
    addToPlaylist,
    startPlaying,
    stopPlaying,
};
