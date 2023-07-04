'use strict';
/* eslint-disable */

{
    // play list
    let playlist = [];
    let nowPlaying = null;
    let playInterval = null;
    let isPlaying = false;

    // add audio
    document.addEventListener('add-to-playlist', (event) => {
        if (!isPlaying) return;

        try {
            const urlList = event.detail.urlList;

            for (let index = 0; index < urlList.length; index++) {
                const url = urlList[index];
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
    });

    // start playing
    document.addEventListener('start-playing', () => {
        clearInterval(playInterval);

        playInterval = setInterval(() => {
            playNext();
        }, 1000);

        isPlaying = true;
    });

    // stop playing
    document.addEventListener('stop-playing', () => {
        clearInterval(playInterval);

        try {
            nowPlaying.pause();
        } catch (error) {
            console.log(error);
        }

        isPlaying = false;
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
}
