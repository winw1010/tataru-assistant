'use strict';

// electron
const { ipcRenderer } = require('electron');

// click through
let clickThrough = false;

// hide update button
let hideUpdateButton = true;

// timeout
let timeoutScrollIntoView = null;
let timeoutMoveToBottom = null;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
  setIPC();
  await setView();
  setEvent();
  setButton();
  startApp();
});

// set IPC
function setIPC() {
  // change UI text
  ipcRenderer.on('change-ui-text', async () => {
    const config = await ipcRenderer.invoke('get-config');
    document.dispatchEvent(new CustomEvent('change-ui-text', { detail: config }));
  });

  // reset view
  ipcRenderer.on('reset-view', (event, config) => {
    resetView(config);
  });

  // hide button
  ipcRenderer.on('hide-button', (event, value) => {
    hideButton(value.isMouseOut, value.hideButton);
  });

  // hide update button
  ipcRenderer.on('hide-update-button', (event, isHidden) => {
    hideUpdateButton = isHidden;
  });

  // add audio
  ipcRenderer.on('add-to-playlist', (event, urlList) => {
    document.dispatchEvent(new CustomEvent('add-to-playlist', { detail: urlList }));
  });

  // console log
  ipcRenderer.on('console-log', (event, text) => {
    console.log(text);
  });

  // add dialog
  ipcRenderer.on('add-dialog', (event, dialogData = {}) => {
    // get dialog
    let dialog = document.getElementById(dialogData.id);

    // check dialog
    if (!dialog) {
      dialog = addDialog(dialogData.id, dialogData.code);
      dialog.style.display = 'none';
    }
  });

  // update dialog
  ipcRenderer.on('update-dialog', (event, dialogData = {}, style = {}, scroll = true) => {
    // get dialog
    let dialog = document.getElementById(dialogData.id);

    // check dialog
    if (!dialog) {
      dialog = addDialog(dialogData.id, dialogData.code);
    }

    // display dialog
    dialog.style.display = 'block';

    // set dialog content
    if (dialogData.translatedName !== '') {
      dialogData.translatedName += '：</br>';
    }

    setDialogContent(dialog, dialogData.translatedName + dialogData.translatedText);

    // set dialog style
    setDialogStyle(dialog, style);

    // add click event
    if (dialog.className !== 'FFFF') {
      dialog.style.cursor = 'pointer';
      dialog.onclick = () => {
        ipcRenderer.send('restart-window', 'edit', dialogData.id);
      };
    }

    // navigate dialog
    if (scroll) {
      scrollIntoView(dialogData.id);
    }
  });

  // add notification
  ipcRenderer.on('add-notification', (event, id, code, text = '', style = {}) => {
    // create notification
    const dialog = addDialog(id, code);

    // set notification style
    setDialogStyle(dialog, style);

    // set notification content
    setDialogContent(dialog, text);

    // navigate notification
    scrollIntoView(id);
  });

  // remove dialog
  ipcRenderer.on('remove-dialog', (event, id) => {
    try {
      document.getElementById(id).remove();
    } catch (error) {
      error;
    }
  });

  // reset dialog style
  ipcRenderer.on('reset-dialog-style', (event, resetList = []) => {
    for (let index = 0; index < resetList.length; index++) {
      const element = resetList[index];
      setDialogStyle(document.getElementById(element.id), element.style);
    }
  });

  // hide dialog
  ipcRenderer.on('hide-dialog', (event, isHidden) => {
    document.getElementById('div-dialog').hidden = isHidden;
  });

  // clear dialog
  ipcRenderer.on('clear-dialog', () => {
    document.getElementById('div-dialog').innerHTML = '';
  });

  // move to bottom
  ipcRenderer.on('move-to-bottom', () => {
    moveToBottom();
  });
}

// set view
async function setView() {
  const config = await ipcRenderer.invoke('get-config');

  // reset view
  resetView(config);

  // set click through
  setClickThrough(config.indexWindow.clickThrough);

  // set speech
  setSpeech(config.indexWindow.speech);

  // first time check
  if (config.system.firstTime) {
    ipcRenderer.send('create-window', 'config', 'div-translation');
  }

  // change UI text
  ipcRenderer.send('change-ui-text');
}

// set event
function setEvent() {
  // move window
  document.addEventListener('move-window', (e) => {
    ipcRenderer.send('move-window', e.detail, false);
  });

  // drag click through
  document.getElementById('img-button-drag').addEventListener('mousedown', () => {
    clickThrough = false;
  });
  document.getElementById('img-button-drag').addEventListener('mouseup', async () => {
    clickThrough = await ipcRenderer.invoke('get-click-through-config');
  });

  // document click through
  document.addEventListener('mouseenter', () => {
    if (clickThrough) {
      ipcRenderer.send('set-click-through', true);
    } else {
      ipcRenderer.send('set-click-through', false);
    }
  });

  document.addEventListener('mouseleave', () => {
    ipcRenderer.send('set-click-through', false);
  });

  // button click through
  const buttonArray = document.getElementsByClassName('img-button');
  for (let index = 0; index < buttonArray.length; index++) {
    const element = buttonArray[index];

    element.addEventListener('mouseenter', () => {
      ipcRenderer.send('set-click-through', false);
    });

    element.addEventListener('mouseleave', () => {
      if (clickThrough) {
        ipcRenderer.send('set-click-through', true);
      } else {
        ipcRenderer.send('set-click-through', false);
      }
    });
  }
}

// set button
function setButton() {
  // config
  document.getElementById('img-button-config').onclick = () => {
    ipcRenderer.send('create-window', 'config');
  };

  // capture
  document.getElementById('img-button-capture').onclick = () => {
    ipcRenderer.send('create-window', 'capture');
  };

  // through
  document.getElementById('img-button-through').onclick = () => {
    setClickThrough(!clickThrough);
    ipcRenderer.send('set-click-through-config', clickThrough);
  };

  // update
  document.getElementById('img-button-update').onclick = () => {
    ipcRenderer.send('execute-command', 'explorer "https://github.com/winw1010/tataru-assistant/releases/latest/"');
  };

  // minimize
  document.getElementById('img-button-minimize').onclick = async () => {
    /*
    const config = await ipcRenderer.invoke('get-config');

    if (config.indexWindow.focusable) {
      ipcRenderer.send('minimize-window');
    }
    */
    ipcRenderer.send('minimize-window');
  };

  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-app');
  };

  // auto play
  document.getElementById('img-button-speech').onclick = async () => {
    const config = await ipcRenderer.invoke('get-config');
    config.indexWindow.speech = !config.indexWindow.speech;
    await ipcRenderer.invoke('set-config', config);
    ipcRenderer.send('mute-window', config.indexWindow.speech);
    setSpeech(config.indexWindow.speech);
  };

  // custom
  document.getElementById('img-button-custom').onclick = () => {
    ipcRenderer.send('create-window', 'custom');
  };

  // read log
  document.getElementById('img-button-read-log').onclick = () => {
    ipcRenderer.send('create-window', 'read-log');
  };

  // dictionary
  document.getElementById('img-button-dictionary').onclick = () => {
    ipcRenderer.send('create-window', 'dictionary');
  };

  // backspace
  document.getElementById('img-button-backspace').onclick = () => {
    try {
      document.getElementById('div-dialog').lastElementChild.remove();
    } catch (error) {
      console.log(error);
    }
  };

  // clear
  document.getElementById('img-button-clear').onclick = () => {
    document.getElementById('div-dialog').innerHTML = '';
  };
}

// start app
function startApp() {
  ipcRenderer.send('set-ua', navigator?.userAgentData?.brands, navigator?.userAgent);
  ipcRenderer.send('add-notification', 'VIEW_README');
  ipcRenderer.send('version-check');
  ipcRenderer.send('initialize-json');
}

// reset view
function resetView(config) {
  // restore window
  ipcRenderer.send('restore-window');

  // set always on top
  ipcRenderer.send('set-always-on-top', config.indexWindow.alwaysOnTop);

  // set focusable
  ipcRenderer.send('set-focusable', config.indexWindow.focusable);

  // set speech speed
  document.dispatchEvent(new CustomEvent('set-speech-speed', { detail: config.indexWindow.speechSpeed }));

  // set button
  document.querySelectorAll('.img-hidden').forEach((value) => {
    document.getElementById(value.id).hidden = config.indexWindow.hideButton;
  });

  // reset dialog style
  resetDialogStyle();

  // show dialog
  ipcRenderer.send('show-dialog');

  // set background color
  document.getElementById('div-dialog').style.backgroundColor = config.indexWindow.backgroundColor;

  // set min size
  ipcRenderer.send('set-min-size', config.indexWindow.minSize);
}

// add dialog
function addDialog(id = '', code = '') {
  const dialog = document.createElement('div');
  dialog.id = id;
  dialog.className = code;
  document.getElementById('div-dialog').append(dialog);
  return dialog;
}

// set dialog content
function setDialogContent(dialog, text = '') {
  if (dialog) {
    const content = document.createElement('span');
    content.innerHTML = text;
    dialog.innerHTML = content.outerHTML;
  }
}

// set dialog style
function setDialogStyle(dialog = null, style = {}) {
  if (dialog) {
    Object.keys(style).forEach((key) => {
      try {
        dialog.style[key] = style[key];
      } catch (error) {
        console.log(error);
      }
    });
  }
}

// reset dialog style
function resetDialogStyle() {
  const dialogCollection = document.getElementById('div-dialog').children;
  const resetList = [];

  for (let index = 0; index < dialogCollection.length; index++) {
    const element = dialogCollection[index];
    resetList.push({
      id: element.id,
      code: element.className,
    });
  }

  ipcRenderer.send('reset-dialog-style', resetList);
}

// scroll into view
function scrollIntoView(id = '') {
  clearTimeout(timeoutScrollIntoView);
  timeoutScrollIntoView = setTimeout(() => {
    document.getElementById(id).scrollIntoView();
  }, 200);
}

// move to bottom
function moveToBottom() {
  clearTimeout(timeoutMoveToBottom);
  timeoutMoveToBottom = setTimeout(() => {
    clearSelection();
    const div = document.getElementById('div-dialog');
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  }, 200);
}

// clear selection
function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

// hide button
function hideButton(isMouseOut, hideButton) {
  if (isMouseOut) {
    // hide
    document.querySelectorAll('.img-hidden').forEach((value) => {
      document.getElementById(value.id).hidden = hideButton;
    });
  } else {
    // show
    document.querySelectorAll('.img-hidden').forEach((value) => {
      document.getElementById(value.id).hidden = false;
    });

    // update button
    document.getElementById('img-button-update').hidden = hideUpdateButton;

    // show dialog
    ipcRenderer.send('show-dialog');
  }
}

// set click through button
function setClickThrough(value) {
  clickThrough = value;
  if (clickThrough) {
    document.getElementById('img-button-through').setAttribute('src', './img/ui/near_me_white_48dp.svg');
  } else {
    document.getElementById('img-button-through').setAttribute('src', './img/ui/near_me_disabled_white_48dp.svg');
  }
}

function setSpeech(value) {
  if (value) {
    document.getElementById('img-button-speech').setAttribute('src', './img/ui/volume_up_white_48dp.svg');
    document.dispatchEvent(new CustomEvent('start-playing'));
  } else {
    document.getElementById('img-button-speech').setAttribute('src', './img/ui/volume_off_white_48dp.svg');
    document.dispatchEvent(new CustomEvent('stop-playing'));
  }
}
