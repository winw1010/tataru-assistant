'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

function setDragElement(element) {
    let clientX = 0,
        clientY = 0,
        clientWidth = 0,
        clientHeight = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        // get the mouse cursor position at startup:
        clientX = e.clientX;
        clientY = e.clientY;
        clientWidth = window.innerWidth;
        clientHeight = window.innerHeight;

        // call a function when mouse button is released:
        document.onmouseup = closeDragElement;

        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        // set the window's new position:
        ipcRenderer.send('drag-window', clientWidth, clientHeight, e.screenX - clientX, e.screenY - clientY);
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

exports.setDragElement = setDragElement;