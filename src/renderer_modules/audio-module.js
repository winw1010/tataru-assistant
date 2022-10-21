'use strict';
/* eslint-disable */

onDocumentReady(() => {
    // play list
    let playlist = [];
    let nowPlaying = null;
    let playInterval = null;

    // add audio
    document.addEventListener('add-to-playlist', (ev) => {
        const text = ev.detail.text;
        const translation = ev.detail.translation;

        if (translation.autoPlay && text !== '') {
            try {
                const languageCode = getAPI('getLanguageCode')(translation.from, 'Google');
                const urls = getAPI('googleTTS')({ text: text, language: languageCode });

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
    });

    // start playing
    document.addEventListener('start-playing', () => {
        clearInterval(playInterval);

        playInterval = setInterval(() => {
            playNext();
        }, 1000);
    });

    // stop playing
    document.addEventListener('stop-playing', () => {
        clearInterval(playInterval);

        try {
            nowPlaying.pause();
        } catch (error) {
            console.log(error);
        }

        nowPlaying = null;
        playlist = [];
    });

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
});
