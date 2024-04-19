'use strict';

{
  // play list
  let playlist = [];
  let playInterval = null;
  let playSpeed = 1;
  let isPlaying = false;
  let nowPlaying = null;

  // add url
  document.addEventListener('add-to-playlist', (event) => {
    if (isPlaying) playlist = playlist.concat(event.detail);
  });

  // set speech speed
  document.addEventListener('set-speech-speed', (event) => {
    const speed = parseFloat(event.detail);
    if (typeof speed === 'number' && !isNaN(speed)) playSpeed = speed;
  });

  // start playing
  document.addEventListener('start-playing', () => {
    isPlaying = true;

    clearInterval(playInterval);
    playInterval = setInterval(() => {
      if (nowPlaying) return;

      const url = playlist.shift();

      if (url && typeof url === 'string') {
        nowPlaying = new Audio(url);
        nowPlaying.currentTime = 0;
        nowPlaying.volume = 1;
        nowPlaying.playbackRate = playSpeed;

        nowPlaying.onpause = () => {
          nowPlaying = null;
        };

        nowPlaying.onended = () => {
          nowPlaying = null;
        };

        nowPlaying.onerror = () => {
          nowPlaying = null;
        };

        nowPlaying.play();
      }
    }, 1000);
  });

  // stop playing
  document.addEventListener('stop-playing', () => {
    clearInterval(playInterval);
    isPlaying = false;
    nowPlaying?.pause();
    nowPlaying = null;
    playlist = [];
  });
}
