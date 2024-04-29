'use strict';

// electron
const { ipcRenderer } = require('electron');

// click through
let clickThrough = false;

// mouse out check interval
let mouseOutCheckInterval = null;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  setIPC();

  setView();
  setEvent();
  setButton();

  startApp();
});

// set IPC
function setIPC() {
  // change UI text
  ipcRenderer.on('change-ui-text', () => {
    const config = ipcRenderer.sendSync('get-config');
    document.dispatchEvent(new CustomEvent('change-ui-text', { detail: config }));
  });

  // clear dialog
  ipcRenderer.on('clear-dialog', () => {
    document.getElementById('div-dialog').innerHTML = '';
  });

  // move to bottom
  ipcRenderer.on('move-to-bottom', () => {
    moveToBottom();
  });

  // reset view
  ipcRenderer.on('reset-view', (event, config) => {
    resetView(config);
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
    } else {
      setDialogContent(dialog, '...');
    }
  });

  // update dialog
  ipcRenderer.on('update-dialog', (event, dialogData = {}, style = {}, scroll = true) => {
    // get dialog
    let dialog = document.getElementById(dialogData.id);

    // check dialog
    if (!dialog) {
      dialog = addDialog(dialogData.id, dialogData.code);
    } else {
      dialog.style.display = 'block';
    }

    // set dialog content
    if (dialogData.translatedName !== '') {
      dialogData.translatedName += '：<br>';
    }

    setDialogContent(dialog, dialogData.translatedName + dialogData.translatedText);

    // set dialog style
    setStyle(dialog, style);

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
  ipcRenderer.on('add-notification', (event, text = '', style = {}) => {
    // set notification
    const timestamp = new Date().getTime();
    const id = 'sid' + timestamp;
    const code = 'FFFF';

    // create notification
    const dialog = addDialog(id, code);

    // set notification style
    setStyle(dialog, style);

    // set notification content
    setDialogContent(dialog, text);

    // set timeout
    setTimeout(() => {
      try {
        document.getElementById(id).remove();
      } catch (error) {
        //console.log(error);
      }
    }, 7000);

    // navigate notification
    scrollIntoView(id);
  });

  // hide dialog
  ipcRenderer.on('hide-dialog', (event, isHidden) => {
    document.getElementById('div-dialog').hidden = isHidden;
  });

  // hide update button
  ipcRenderer.on('hide-update-button', (event, isHidden) => {
    document.getElementById('img-button-update').hidden = isHidden;
  });

  // add audio
  ipcRenderer.on('add-to-playlist', (event, urlList) => {
    document.dispatchEvent(new CustomEvent('add-to-playlist', { detail: urlList }));
  });
}

// set view
function setView() {
  const config = ipcRenderer.sendSync('get-config');

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
  document.getElementById('img-button-drag').addEventListener('mouseup', () => {
    clickThrough = ipcRenderer.sendSync('get-click-through-config');
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
    ipcRenderer.send('execute-command', 'explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
  };

  // minimize
  document.getElementById('img-button-minimize').onclick = () => {
    let config = ipcRenderer.sendSync('get-config');

    if (config.indexWindow.focusable) {
      ipcRenderer.send('minimize-window');
    } else {
      ipcRenderer.send('add-notification', '在不可選取的狀態下無法縮小視窗');
    }
  };

  // close
  document.getElementById('img-button-close').onclick = () => {
    ipcRenderer.send('close-app');
  };

  // auto play
  document.getElementById('img-button-speech').onclick = () => {
    let config = ipcRenderer.sendSync('get-config');
    config.indexWindow.speech = !config.indexWindow.speech;
    ipcRenderer.send('set-config', config);
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
  ipcRenderer.send('add-notification', '查看使用說明: CTRL+F9');
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

  // start/restart mouse out check interval
  clearInterval(mouseOutCheckInterval);
  mouseOutCheckInterval = setInterval(() => {
    ipcRenderer
      .invoke('mouse-out-check')
      .then((value) => {
        hideButton(value.isMouseOut, value.hideButton);
      })
      .catch(console.log);
  }, 100);

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
  const content = document.createElement('span');
  content.innerHTML = text;
  dialog.innerHTML = content.outerHTML;
}

// scroll into view
function scrollIntoView(id = '') {
  setTimeout(() => {
    document.getElementById(id).scrollIntoView();
  }, 200);
}

// set style
function setStyle(element, style = {}) {
  Object.getOwnPropertyNames(style).forEach((key) => {
    try {
      element.style[key] = style[key];
    } catch (error) {
      console.log(error);
    }
  });
}

// reset dialog style
function resetDialogStyle() {
  const dialogCollection = document.getElementById('div-dialog').children;

  for (let index = 0; index < dialogCollection.length; index++) {
    const dialog = document.getElementById(dialogCollection[index].id);
    const style = ipcRenderer.sendSync('get-style', dialog.className);
    setStyle(dialog, style);

    if (index === 0) {
      dialog.style.marginTop = '0';
    }
  }
}

// move to bottom
function moveToBottom() {
  setTimeout(() => {
    clearSelection();
    let div = document.getElementById('div-dialog') || document.scrollingElement || document.body;
    div.scrollTop = div.scrollHeight;
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
