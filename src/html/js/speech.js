'use strict';

{
  // tts object
  const tts = {
    list: [],
    interval: null,
    speed: 1,
    enable: false,
    isPlaying: false,
    audio: null,
  };

  // add url
  document.addEventListener('add-to-playlist', (event) => {
    if (tts.enable) tts.list = tts.list.concat(event.detail);
  });

  // set speech speed
  document.addEventListener('set-speech-speed', (event) => {
    const speed = parseFloat(event.detail);
    if (typeof speed === 'number' && !isNaN(speed)) tts.speed = speed;
  });

  // start playing
  document.addEventListener('start-playing', () => {
    tts.enable = true;
    setPlayInterval();
  });

  // stop playing
  document.addEventListener('stop-playing', () => {
    clearInterval(tts.interval);
    tts.enable = false;
    tts.list = [];

    try {
      tts.audio.pause();
    } catch (error) {
      console.log(error);
    }
  });

  function setPlayInterval() {
    clearInterval(tts.interval);
    tts.interval = setInterval(() => {
      if (tts.isPlaying) return;

      const url = tts.playlist.shift();

      if (url) {
        try {
          tts.audio = new Audio(url);
          tts.audio.currentTime = 0;
          tts.audio.volume = 1;
          tts.audio.playbackRate = tts.speed;

          tts.audio.onplay = () => {
            tts.isPlaying = true;
          };

          tts.audio.onpause = () => {
            tts.isPlaying = false;
          };

          tts.audio.onended = () => {
            tts.isPlaying = false;
          };

          tts.audio.onerror = () => {
            tts.isPlaying = false;
          };

          tts.audio.play();
        } catch (error) {
          console.log(error);
        }
      }
    }, 1000);
  }
}
