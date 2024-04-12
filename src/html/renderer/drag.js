'use strict';
/* eslint-disable */

// set drag element
document.getElementById('img-button-drag').onmousedown = (event) => {
  //event = event || window.event;
  event.preventDefault();

  let moveX = 0;
  let moveY = 0;
  let mouseX = event.screenX;
  let mouseY = event.screenY;
  let windowX = event.screenX - event.clientX;
  let windowY = event.screenY - event.clientY;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  document.onmousemove = (event) => {
    moveX = event.screenX - mouseX;
    moveY = event.screenY - mouseY;
    //window.moveTo(windowX + moveX, windowY + moveY);
    //window.resizeTo(windowWidth, windowHeight);
    const detail = {
      x: windowX + moveX,
      y: windowY + moveY,
      width: windowWidth,
      height: windowHeight,
    };
    document.dispatchEvent(new CustomEvent('move-window', { detail }));
  };

  document.onmouseup = () => {
    document.onmouseup = null;
    document.onmousemove = null;
  };
};
