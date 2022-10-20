'use strict';

// punctuations
const punctuations = {
    first: /。|！|？|\.|!|\?/i,
    second: /、|,/i,
    third: /\u3000| /i,
};

// play list
let playlist = [];
let nowPlaying = null;
let playInterval = null;

// add to play list
function addToPlaylist(text, translation) {
    playlist.push({ text, translation });
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
            const element = playlist.shift();
        }
    } catch (error) {
        console.log(error);
        nowPlaying = null;
    }
}

// create audio
function createAudio(params) {}

// get google speech url
function getGoogleSpeechUrl(option = { text: '', language: 'en' }) {
    let startIndex = 0;
    let textArray = [option.text ? option.text : ''];
    let urlArray = [];

    while (textArray[startIndex].length >= 200) {
        const result = splitText(textArray[startIndex]);

        textArray[startIndex] = result[0].trim();
        textArray.push(result[1].trim());

        startIndex++;
    }

    for (let index = 0; index < textArray.length; index++) {
        const text = textArray[index];

        if (text.length > 0) {
            const path =
                `/translate_tts?ie=UTF-8&q=${text}&tl=${option.language}&total=1&idx=0` +
                `&textlen=${text.length}&client=tw-ob&prev=input&ttsspeed=1`;
            urlArray.push(`https://translate.google.com` + encodeURI(path));
        }
    }

    return urlArray;
}

// split text
function splitText(text = '') {
    for (let index = 199; index >= 0; index--) {
        const char = text[index];
        if (punctuations.first.test(char)) {
            return [text.slice(0, index + 1), text.slice(index + 1)];
        }
    }

    for (let index = 199; index >= 0; index--) {
        const char = text[index];
        if (punctuations.second.test(char)) {
            return [text.slice(0, index + 1), text.slice(index + 1)];
        }
    }

    for (let index = 199; index >= 0; index--) {
        const char = text[index];
        if (punctuations.third.test(char)) {
            return [text.slice(0, index + 1), text.slice(index + 1)];
        }
    }

    return [text.slice(0, 200), text.slice(200)];
}
