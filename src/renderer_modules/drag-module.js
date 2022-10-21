'use strict';

onDocumentReady(() => {
    // set drag element
    document.getElementById('img_button_drag').onmousedown = (ev) => {
        ev = ev || window.event;
        ev.preventDefault();

        let clientX = ev.clientX;
        let clientY = ev.clientY;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        document.onmousemove = () => {
            getAPI('dragWindow')(clientX, clientY, windowWidth, windowHeight);
        };

        document.onmouseup = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };
    };
});
