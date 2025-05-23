'use strict';

// electron
const { ipcRenderer } = require('electron');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
  setIPC();
  await setView();
  setEvent();
  setButton();
});

// set IPC
function setIPC() {
  // change UI text
  ipcRenderer.on('change-ui-text', async () => {
    const config = await ipcRenderer.invoke('get-config');
    document.dispatchEvent(new CustomEvent('change-ui-text', { detail: config }));
  });
}

// set view
async function setView() {
  const config = await ipcRenderer.invoke('get-config');
  document.getElementById('select-type').value = config.captureWindow.type;
  document.getElementById('select-from').innerHTML = await ipcRenderer.invoke('get-source-select');
  document.getElementById('select-from').value = config.translation.from;
  document.getElementById('checkbox-split').checked = config.captureWindow.split;
  document.getElementById('checkbox-edit').checked = config.captureWindow.edit;
  showScreenshotButton(config);
  setCanvasSize();

  // change UI text
  ipcRenderer.send('change-ui-text');
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
  document.getElementById('checkbox-split').oninput = async () => {
    const config = await ipcRenderer.invoke('get-config');
    config.captureWindow.split = document.getElementById('checkbox-split').checked;
    await ipcRenderer.invoke('set-config', config);
  };

  document.getElementById('checkbox-edit').oninput = async () => {
    const config = await ipcRenderer.invoke('get-config');
    config.captureWindow.edit = document.getElementById('checkbox-edit').checked;
    await ipcRenderer.invoke('set-config', config);
  };

  // select
  document.getElementById('select-type').onchange = async () => {
    const config = await ipcRenderer.invoke('get-config');
    config.captureWindow.type = document.getElementById('select-type').value;
    await ipcRenderer.invoke('set-config', config);
    showScreenshotButton(config);
  };

  // canvas event
  setCanvasEvent(document.getElementById('canvas-select'));
}

// set button
function setButton() {
  // screenshot
  document.getElementById('button-screenshot').onclick = async () => {
    // minimize all windows
    ipcRenderer.send('minimize-all-windows');

    // set capture data
    const captureData = await createData();

    // start recognize
    ipcRenderer.send('start-recognize', captureData);
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
  // set canvas
  const canvas = document.getElementById('canvas-select');

  // set size
  canvas.setAttribute('width', window.innerWidth);
  canvas.setAttribute('height', window.innerHeight);
}

// set canvas event
function setCanvasEvent() {
  // set canvas
  const canvas = document.getElementById('canvas-select');

  // set line width
  const lineWidth = getLineWidth();

  // set mouse position
  const screenMouseDown = { x: 0, y: 0 };
  const screenMouseUp = { x: 0, y: 0 };
  const clientMouseDown = { x: 0, y: 0 };

  // on mouse down
  canvas.onmousedown = async (event) => {
    // set mousedown screen position
    const mousePosition = await ipcRenderer.invoke('get-mouse-position');
    screenMouseDown.x = mousePosition.x;
    screenMouseDown.y = mousePosition.y;

    // set mousedown client position
    clientMouseDown.x = event.clientX;
    clientMouseDown.y = event.clientY;

    // on mouse move
    canvas.onmousemove = (event) => {
      drawRectangle(clientMouseDown.x, clientMouseDown.y, event.clientX, event.clientY);
    };

    // on mouse up
    canvas.onmouseup = async () => {
      // stop drawing
      canvas.onmouseup = null;
      canvas.onmousemove = null;

      // clear rectangle
      clearRectangle();

      // set mouseup screen position
      const mousePosition = await ipcRenderer.invoke('get-mouse-position');
      screenMouseUp.x = mousePosition.x;
      screenMouseUp.y = mousePosition.y;

      // set capture data
      const captureData = await createData();

      // set rectangle size
      captureData.rectangleSize = getRectangleSize(
        screenMouseDown.x,
        screenMouseDown.y,
        screenMouseUp.x,
        screenMouseUp.y
      );

      // fix position
      captureData.rectangleSize.x -= captureData.screenSize.x;
      captureData.rectangleSize.y -= captureData.screenSize.y;

      // start recognize
      if (captureData.rectangleSize.width > 0 && captureData.rectangleSize.height > 0) {
        ipcRenderer.send('start-recognize', captureData);
      }
    };
  };

  // draw rectangle
  function drawRectangle(startX, startY, endX, endY) {
    if (canvas.getContext) {
      // set rectangle size
      const rectangleSize = getRectangleSize(startX, startY, endX, endY);
      const ctx = canvas.getContext('2d');

      // clear rectangle
      clearRectangle();

      // draw rectangle
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(rectangleSize.x, rectangleSize.y, rectangleSize.width, rectangleSize.height);
    }
  }

  // clear rectangle
  function clearRectangle() {
    if (canvas.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// get line width
function getLineWidth() {
  let lineWidth = 1;

  try {
    lineWidth = 0.1 * parseInt(getComputedStyle(document.documentElement).fontSize);
  } catch (error) {
    console.log(error);
  }

  if (isNaN(lineWidth)) {
    lineWidth = 1;
  }

  return lineWidth;
}

// create data
async function createData() {
  return {
    type: document.getElementById('select-type').value,
    from: document.getElementById('select-from').value,
    split: document.getElementById('checkbox-split').checked,
    edit: document.getElementById('checkbox-edit').checked,
    screenSize: await ipcRenderer.invoke('get-screen-bounds'),
    rectangleSize: {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
    },
  };
}

// get rectangle size
function getRectangleSize(startX, startY, endX, endY) {
  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(startX - endX),
    height: Math.abs(startY - endY),
  };
}
