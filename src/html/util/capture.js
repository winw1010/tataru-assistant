'use strict';

// electron
const { ipcRenderer } = require('electron');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  setIPC();

  setView();
  setEvent();
  setButton();
});

// set IPC
function setIPC() {
  // change UI text
  ipcRenderer.on('change-ui-text', () => {
    const config = ipcRenderer.sendSync('get-config');
    document.dispatchEvent(new CustomEvent('change-ui-text', { detail: config }));
  });
}

// set view
function setView() {
  const config = ipcRenderer.sendSync('get-config');
  document.getElementById('checkbox-split').checked = config.captureWindow.split;
  document.getElementById('checkbox-edit').checked = config.captureWindow.edit;
  document.getElementById('select-type').value = config.captureWindow.type;
  showScreenshotButton(config);
  setCanvasSize();
}

// set event
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  // on resize
  window.onresize = () => {
    setCanvasSize();
  };

  // checkbox
  document.getElementById('checkbox-split').oninput = () => {
    let config = ipcRenderer.sendSync('get-config');
    config.captureWindow.split = document.getElementById('checkbox-split').checked;
    ipcRenderer.send('set-config', config);
  };

  document.getElementById('checkbox-edit').oninput = () => {
    let config = ipcRenderer.sendSync('get-config');
    config.captureWindow.edit = document.getElementById('checkbox-edit').checked;
    ipcRenderer.send('set-config', config);
  };

  // select
  document.getElementById('select-type').onchange = () => {
    let config = ipcRenderer.sendSync('get-config');
    config.captureWindow.type = document.getElementById('select-type').value;
    ipcRenderer.send('set-config', config);
    ipcRenderer.send('check-api', document.getElementById('select-type').value);
    showScreenshotButton(config);
  };

  // canvas event
  setCanvasEvent(document.getElementById('canvas-select'));
}

// set button
function setButton() {
  // screenshot
  document.getElementById('button-screenshot').onclick = () => {
    // minimize all windows
    ipcRenderer.send('minimize-all-windows');

    // get screen size
    const screenSize = getScreenSize();

    // start recognize
    ipcRenderer.send('start-recognize', screenSize, {
      x: 0,
      y: 0,
      width: screenSize.width,
      height: screenSize.height,
    });
  };

  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-window');
  };
}

// show screenshot button
function showScreenshotButton(config) {
  document.getElementById('button-screenshot').hidden = config.captureWindow.type !== 'google-vision';
}

// set canvas size
function setCanvasSize() {
  // get canvas
  const canvas = document.getElementById('canvas-select');

  // set size
  canvas.setAttribute('width', window.innerWidth);
  canvas.setAttribute('height', window.innerHeight);
}

// set canvas event
function setCanvasEvent() {
  // get canvas
  const canvas = document.getElementById('canvas-select');

  // set line width
  let lineWidth = 1;
  try {
    lineWidth = 0.1 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  } catch (error) {
    console.log(error);
  }

  // set mouse position
  let mousedownScreenPosition = { x: 0, y: 0 };
  let mouseupScreenPosition = { x: 0, y: 0 };
  let mousedownClientPosition = { x: 0, y: 0 };

  // on mouse down
  canvas.onmousedown = (event) => {
    // get mousedown screen position
    mousedownScreenPosition = ipcRenderer.sendSync('get-screen-position');

    // get mousedown client position
    mousedownClientPosition = {
      x: event.clientX,
      y: event.clientY,
    };

    // on mouse move
    canvas.onmousemove = (event) => {
      drawRectangle(mousedownClientPosition.x, mousedownClientPosition.y, event.clientX, event.clientY);
    };

    // on mouse up
    canvas.onmouseup = () => {
      // stop drawing
      canvas.onmouseup = null;
      canvas.onmousemove = null;

      // clear rectangle
      if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // get mouseup screen position
      mouseupScreenPosition = ipcRenderer.sendSync('get-screen-position');

      // get rectangle size
      let rectangleSize = getRectangleSize(
        mousedownScreenPosition.x,
        mousedownScreenPosition.y,
        mouseupScreenPosition.x,
        mouseupScreenPosition.y
      );

      // start recognize
      if (rectangleSize.width > 0 && rectangleSize.height > 0) {
        ipcRenderer.send('start-recognize', getScreenSize(), rectangleSize);
      }
    };
  };

  // draw rectangle
  function drawRectangle(startX, startY, endX, endY) {
    if (canvas.getContext) {
      // get rectangle size
      let rectangleSize = getRectangleSize(startX, startY, endX, endY);
      let ctx = canvas.getContext('2d');

      // clear rectangle
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw rectangle
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(rectangleSize.x, rectangleSize.y, rectangleSize.width, rectangleSize.height);
    }
  }
}

// get screen size
function getScreenSize() {
  return {
    width: window.screen.width,
    height: window.screen.height,
  };
}

// get rectangle size
function getRectangleSize(startX, startY, endX, endY) {
  return {
    x: startX > endX ? endX : startX,
    y: startY > endY ? endY : startY,
    width: mathAbs(endX - startX),
    height: mathAbs(endY - startY),
  };
}

// get abs
function mathAbs(number) {
  return number > 0 ? number : -number;
}
