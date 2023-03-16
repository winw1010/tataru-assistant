'use strict';
/* eslint-disable */

onDocumentReady(() => {
    // get config
    const config = ipcRendererSendSync('get-config');

    // play list
    let playlist = [];
    let nowPlaying = null;
    let playInterval = null;

    // add audio
    document.addEventListener('add-to-playlist', (event) => {
        const text = event.detail.text;
        const translation = event.detail.translation;

        if (translation.autoPlay && text !== '') {
            try {
                const languageCode = ipcRendererSendSync('get-language-code', translation.from, 'Google');
                const urls = ipcRendererSendSync('google-tts', { text: text, language: languageCode });

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

    // auto run
    if (config?.translation?.autoPlay) {
        document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_up_white_24dp.svg');
        document.dispatchEvent(new CustomEvent('start-playing'));
    } else {
        document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_off_white_24dp.svg');
    }
});
