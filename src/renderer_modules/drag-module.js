'use strict';

// electron
const { ipcRenderer } = require('electron');

// set drag element
function setDragElement(element) {
    element.onmousedown = (ev) => {
        ev = ev || window.event;
        ev.preventDefault();

        let clientX = ev.clientX;
        let clientY = ev.clientY;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        document.onmousemove = () => {
            ipcRenderer.send('drag-window', clientX, clientY, windowWidth, windowHeight);
        };

        document.onmouseup = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };
    };
}

// module exports
module.exports = {
    setDragElement,
};
