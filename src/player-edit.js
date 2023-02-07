'use strict';

// electron
const { contextBridge, ipcRenderer } = require('electron');

// file module
const fileModule = {
    getPath: (...args) => {
        return ipcRenderer.sendSync('get-path', ...args);
    },
    getUserDataPath: (...args) => {
        return ipcRenderer.sendSync('get-user-data-path', ...args);
    },
    jsonReader: (filePath, returnArray) => {
        return ipcRenderer.sendSync('json-reader', filePath, returnArray);
    },
    jsonWriter: (filePath, data) => {
        ipcRenderer.send('json-writer', filePath, data);
    },
};

// temp location
const tempPath = fileModule.getUserDataPath('temp');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setContextBridge();
    setIPC();

    setView();
    setEvent();
    setButton();
});

// set context bridge
function setContextBridge() {
    contextBridge.exposeInMainWorld('myAPI', {
        ipcRendererSend: (channel, ...args) => {
            ipcRenderer.send(channel, ...args);
        },
        ipcRendererSendSync: (channel, ...args) => {
            return ipcRenderer.sendSync(channel, ...args);
        },
        ipcRendererInvoke: (channel, ...args) => {
            return ipcRenderer.invoke(channel, ...args);
        },
    });
}

// set IPC
function setIPC() {
    // change UI text
    ipcRenderer.on('change-ui-text', () => {
        document.dispatchEvent(new CustomEvent('change-ui-text'));
    });
}

// set view
function setView() {
    readPlayerData();
}

// set enevt
function setEvent() {}

// set button
function setButton() {
    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };

    // save player
    document.getElementById('button_save_player').onclick = () => {
        fileModule.jsonWriter(fileModule.getPath(tempPath, 'player.json'), getPlayerData());
        ipcRenderer.send('send-index', 'show-notification', '已儲存玩家名稱');
        ipcRenderer.send('load-json');
    };
}

// read player data
function readPlayerData() {
    let playerData = fileModule.jsonReader(fileModule.getPath(tempPath, 'player.json'));
    let retainerData = playerData.slice(3);

    if (playerData?.length > 0) {
        document.getElementById('input_text_player_first_name').value =
            playerData[0][0] !== 'N/A' ? playerData[0][0] : '';
        document.getElementById('input_text_player_last_name').value =
            playerData[1][0] !== 'N/A' ? playerData[1][0] : '';

        for (let index = 0; index < retainerData.length; index++) {
            document.getElementById('input_text_retainer_name' + index).value =
                retainerData[index][0] !== 'N/A' ? retainerData[index][0] : '';
        }
    }
}

// get player data
function getPlayerData() {
    let firstName = document.getElementById('input_text_player_first_name').value.trim();
    let lastName = document.getElementById('input_text_player_last_name').value.trim();

    firstName = firstName !== '' ? firstName : 'N/A';
    lastName = lastName !== '' ? lastName : 'N/A';

    // create player data
    let playerData = [];

    // set first name
    playerData.push([firstName, firstName]);

    // set last name
    playerData.push([lastName, lastName]);

    // set full name
    if (firstName !== 'N/A' && lastName !== 'N/A') {
        playerData.push([firstName + ' ' + lastName, firstName + ' ' + lastName]);
    } else {
        playerData.push(['N/A', 'N/A']);
    }

    // set retainer name
    for (let index = 0; index < 10; index++) {
        let retainerName = document.getElementById('input_text_retainer_name' + index).value.trim();
        retainerName = retainerName !== '' ? retainerName : 'N/A';
        playerData.push([retainerName, retainerName]);
    }

    return playerData;
}
