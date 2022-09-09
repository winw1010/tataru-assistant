'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// drag module
const { setDragElement } = require('./renderer_modules/drag-module');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setEvent();
    setButton();
});

// set view
function setView() {
    const config = ipcRenderer.sendSync('get-config');
    document.getElementById('checkbox_split').checked = config.captureWindow.split;
    document.getElementById('checkbox_edit').checked = config.captureWindow.edit;
    document.getElementById('select_type').value = config.captureWindow.type;
    setCanvasSize(document.getElementById('canvas_select'));
    setBackground(config);
}

// set event
function setEvent() {
    // resize
    window.addEventListener(
        'resize',
        function () {
            setCanvasSize(document.getElementById('canvas_select'));
        },
        true
    );

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
    // drag
    setDragElement(document.getElementById('img_button_drag'));

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

// set canvas size
function setCanvasSize(canvas) {
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
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

// set canvas event
function setCanvasEvent(canvas) {
    // mouse
    let isMouseDown = false,
        mousedownScreenPosition = { x: 0, y: 0 },
        mouseupScreenPosition = { x: 0, y: 0 },
        mousedownClientPosition = { x: 0, y: 0 };

    // on mouse down
    canvas.onmousedown = (event) => {
        // start drawing
        isMouseDown = true;

        // get mousedown screen position
        mousedownScreenPosition = ipcRenderer.sendSync('get-screen-position');

        // get mousedown client position
        mousedownClientPosition = {
            x: event.clientX,
            y: event.clientY,
        };
    };

    // on mouse up
    canvas.onmouseup = (/*event*/) => {
        // stop drawing
        isMouseDown = false;

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

    // on mouse move
    canvas.onmousemove = (event) => {
        //document.getElementById('span_position').innerText = `X: ${event.screenX}, Y: ${event.screenY}`;
        if (isMouseDown) {
            drawRectangle(mousedownClientPosition.x, mousedownClientPosition.y, event.clientX, event.clientY);
        }
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
            ctx.lineWidth = 1;
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
