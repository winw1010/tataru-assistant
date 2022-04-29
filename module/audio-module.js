// text to speech
const googleTTS = require('google-tts-api');

// language table
const { googleTable } = require('./translator/language-table');

// play list
let playlist = [];
let isPlaying = false;
let playInterval = null;

// add audio
function addToPlaylist(dialogData, translation) {
    if (translation.autoPlay && dialogData.text !== '') {
        try {
            const url = googleTTS.getAudioUrl(dialogData.text, { lang: googleTable[translation.from] });
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
    try {
        clearInterval(playInterval);
        playInterval = null;
    } catch (error) {
        console.log(error);
    }

    playInterval = setInterval(() => {
        playNext();
    }, 1000);
}

// play next audio
function playNext() {
    try {
        if (!isPlaying) {
            isPlaying = true;
            const audio = playlist.shift();

            if (audio) {
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