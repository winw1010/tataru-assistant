'use strict';
/* eslint-disable */

{
    // set drag element
    document.getElementById('img_button_drag').onmousedown = (event) => {
        event = event || window.event;
        event.preventDefault();

        let clientX = event.clientX;
        let clientY = event.clientY;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        document.onmousemove = () => {
            dragWindow(clientX, clientY, windowWidth, windowHeight);
        };

        document.onmouseup = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };
    };
}
