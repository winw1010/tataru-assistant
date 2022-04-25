'use strict';

// Communicate with main process
const { ipcRenderer } = require('electron');

// mouse
let isMouseDown = false;
let mousedownSP = { x: 0, y: 0 };
let mouseupSP = { x: 0, y: 0 };
let mousedownCP = { x: 0, y: 0 };

// canvas
let canvas;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setHTML();
});

// set html
function setHTML() {
    // F12
    document.addEventListener('keydown', (event) => {
        if (event.code === 'F12') {
            ipcRenderer.send('open-devtools');
        }
    });

    setView();
    setEvent();
    setButton();
}

// set view
function setView() {
    const config = ipcRenderer.sendSync('load-config');

    document.getElementById('checkbox_split').checked = config.captureWindow.split;
    document.getElementById('checkbox_edit').checked = config.captureWindow.edit;
    document.getElementById('select_type').value = config.captureWindow.type;

    canvas = document.getElementById('canvas_select');
    setCanvas();
}

// set event
function setEvent() {
    window.addEventListener('resize', function(event) {
        setCanvas();
    }, true);

    document.querySelectorAll('#div_upper_button input[type="checkBox"]').forEach((value) => {
        value.oninput = () => {
            ipcRenderer.send(
                'save-capture-config',
                document.getElementById('checkbox_split').checked,
                document.getElementById('checkbox_edit').checked
            );
        }
    });

    document.getElementById('select_type').onchange = () => {
        let config = ipcRenderer.sendSync('load-config');
        config.captureWindow.type = document.getElementById('select_type').value;
        ipcRenderer.send('save-config', config);
    }
}

// set button
function setButton() {
    // mouse event
    canvas.onmousedown = (event) => {
        // start drawing
        isMouseDown = true;

        // get mousedown screen position
        mousedownSP = {
            x: event.screenX,
            y: event.screenY
        };

        // get mousedown client position
        mousedownCP = {
            x: event.clientX,
            y: event.clientY
        };
    };

    canvas.onmouseup = (event) => {
        // stop drawing
        isMouseDown = false;

        // clear rectangle
        if (canvas.getContext) {
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // get mouseup screen position
        mouseupSP = {
            x: event.screenX,
            y: event.screenY
        };

        // get rectangle size
        let rectangleSize = getRectangleSize(mousedownSP.x, mousedownSP.y, mouseupSP.x, mouseupSP.y);

        if (rectangleSize.width > 0 && rectangleSize.height > 0) {
            ipcRenderer.send('start-screen-translation', rectangleSize);
        }
    };

    canvas.onmousemove = (event) => {
        document.getElementById('span_position').innerText = `X: ${event.screenX}, Y: ${event.screenY}`;

        if (isMouseDown) {
            drawRectangle(mousedownCP.x, mousedownCP.y, event.clientX, event.clientY);
        }
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };
}

// set canvas size
function setCanvas() {
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
}

// draw rectangle
function drawRectangle(startX, startY, endX, endY) {
    if (canvas.getContext) {
        // get rectangle size
        let rectangleSize = getRectangleSize(startX, startY, endX, endY);
        let ctx = canvas.getContext('2d');

        // clear rectangle
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw rectangle
        ctx.strokeStyle = 'aliceblue';
        ctx.lineWidth = 1;
        ctx.strokeRect(rectangleSize.x, rectangleSize.y, rectangleSize.width, rectangleSize.height);
    }
}

// get rectangle size
function getRectangleSize(startX, startY, endX, endY) {
    return {
        x: startX > endX ? endX : startX,
        y: startY > endY ? endY : startY,
        width: mathAbs(endX - startX),
        height: mathAbs(endY - startY)
    };
}

// get abs
function mathAbs(number) {
    return number > 0 ? number : -number;
}