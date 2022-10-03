'use strict';

// electron
const { ipcRenderer } = require('electron');

// set drag element
function setDragElement(element) {
    element.onmousedown = (e) => {
        e = e || window.event;
        e.preventDefault();

        let clientX = e.clientX;
        let clientY = e.clientY;
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
