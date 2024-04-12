'use strict';

{
  // play list
  let playlist = [];
  let nowPlaying = null;
  let playInterval = null;
  let isPlaying = false;

  // add url
  document.addEventListener('add-to-playlist', (event) => {
    if (isPlaying) playlist = playlist.concat(event.detail);
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
