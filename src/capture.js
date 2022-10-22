'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setContextBridge();
    setIPC();

    setView();
    setEvent();
    setButton();
});

// set context bridge
function setContextBridge() {
    contextBridge.exposeInMainWorld('myAPI', {
        dragWindow: (...args) => {
            ipcRenderer.send('drag-window', ...args);
        },
        getConfig: () => {
            return ipcRenderer.sendSync('get-config');
        },
    });
}

// set IPC
function setIPC() {
    // change UI text
    ipcRenderer.on('change-ui-text', () => {
        document.dispatchEvent(new CustomEvent('change-ui-text'));
    });
}

// set view
function setView() {
    const config = ipcRenderer.sendSync('get-config');
    document.getElementById('checkbox_split').checked = config.captureWindow.split;
    document.getElementById('checkbox_edit').checked = config.captureWindow.edit;
    document.getElementById('select_type').value = config.captureWindow.type;
    setBackground(config);
    setCanvasSize();
}

// set event
function setEvent() {
    // on resize
    window.onresize = () => {
        setCanvasSize();
    };

    // checkbox
    document.getElementById('checkbox_split').oninput = () => {
        let config = ipcRenderer.sendSync('get-config');
        config.captureWindow.split = document.getElementById('checkbox_split').checked;
        ipcRenderer.send('set-config', config);
    };

    document.getElementById('checkbox_edit').oninput = () => {
        let config = ipcRenderer.sendSync('get-config');
        config.captureWindow.edit = document.getElementById('checkbox_edit').checked;
        ipcRenderer.send('set-config', config);
    };

    // select
    document.getElementById('select_type').onchange = () => {
        let config = ipcRenderer.sendSync('get-config');
        config.captureWindow.type = document.getElementById('select_type').value;
        ipcRenderer.send('set-config', config);

        setBackground(config);
    };

    // canvas event
    setCanvasEvent(document.getElementById('canvas_select'));
}

// set button
function setButton() {
    // screenshot
    document.getElementById('button_screenshot').onclick = () => {
        // minimize all windows
        ipcRenderer.send('minimize-all-windows');

        // start screen translation
        const displayBounds = ipcRenderer.sendSync('get-dispaly-bounds');
        ipcRenderer.send(
            'start-screen-translation',
            getRectangleSize(
                displayBounds.x,
                displayBounds.y,
                displayBounds.x + displayBounds.width,
                displayBounds.y + displayBounds.height
            )
        );
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };
}

// set background color
function setBackground(config) {
    if (config.captureWindow.type === 'google') {
        document.getElementsByTagName('body')[0].style.backgroundColor = '#00000000';
        document.getElementById('button_screenshot').hidden = false;
    } else {
        document.getElementsByTagName('body')[0].style.backgroundColor = '#00000022';
        document.getElementById('button_screenshot').hidden = true;
    }
}

// set canvas size
function setCanvasSize() {
    // get canvas
    const canvas = document.getElementById('canvas_select');

    // set size
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
}

// set canvas event
function setCanvasEvent() {
    // get canvas
    const canvas = document.getElementById('canvas_select');

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
    canvas.onmousedown = (ev) => {
        // get mousedown screen position
        mousedownScreenPosition = ipcRenderer.sendSync('get-screen-position');

        // get mousedown client position
        mousedownClientPosition = {
            x: ev.clientX,
            y: ev.clientY,
        };

        // on mouse move
        canvas.onmousemove = (ev) => {
            drawRectangle(mousedownClientPosition.x, mousedownClientPosition.y, ev.clientX, ev.clientY);
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

            // start screen translation
            if (rectangleSize.width > 0 && rectangleSize.height > 0) {
                ipcRenderer.send('start-screen-translation', rectangleSize);
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
