'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// http
const http = require('http');

// text history
let textHistory = {};

// server queue
let serverQueueItem = [];
let serverQueueInterval = null;

// create server
const server = http.createServer(function(request, response) {
    if (request.method === 'POST') {
        request.on('data', function(data) {
            serverQueueItem.push(data);
        });

        request.on('end', function() {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end('POST completed');
        });
    } else if (request.method === 'GET') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end('GET is not supported');
    }
});

server.on('listening', () => {
    console.log('Opened server on', server.address());
});

server.on('error', (err) => {
    ipcRenderer.send('send-preload', 'show-notification', err.message);
    server.close();
});

// start server
function startServer() {
    const config = ipcRenderer.sendSync('load-config');
    const host = config.server.host;
    const port = config.server.port;

    server.close();
    server.listen(port, host);

    startServerQueue();
}

function startServerQueue() {
    try {
        clearInterval(serverQueueInterval);
        serverQueueInterval = null;
    } catch (error) {
        console.log(error);
    }

    serverQueueInterval = setInterval(() => {
        const item = serverQueueItem.shift();

        if (item) {
            dataProcess(item);
        }
    }, 100);
}

// data process
function dataProcess(data) {
    try {
        const config = ipcRenderer.sendSync('load-config');
        let dialogData = JSON.parse(data.toString());

        if (dataCheck(dialogData)) {
            // check code
            if (dialogData.text !== '' && config.channel[dialogData.code]) {
                // history check
                if (textHistory[dialogData.text] && new Date().getTime() - textHistory[dialogData.text] < 5000) {
                    return;
                } else {
                    textHistory[dialogData.text] = new Date().getTime();
                }

                // set id and timestamp
                const timestamp = new Date().getTime();
                dialogData.id = 'id' + timestamp;
                dialogData.timestamp = timestamp;

                // system message process
                if (isSystemMessage(dialogData)) {
                    if (dialogData.name !== '' && dialogData.name !== '...') {
                        dialogData.text = dialogData.name + ': ' + dialogData.text;
                        dialogData.name = '';
                    }
                }

                // start correction
                ipcRenderer.send('send-preload', 'start-translation', dialogData, config.translation);

                // show data
                console.warn('data:', dialogData);
            } else {
                // show data
                console.log('data:', dialogData);
                console.log('Chat code is not in list.');
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// dialog data check
function dataCheck(dialogData) {
    const names = Object.getOwnPropertyNames(dialogData);

    return names.includes('code') &&
        names.includes('playerName') &&
        names.includes('name') &&
        names.includes('text');
}

// channel check
function isSystemMessage(dialogData) {
    const systemChannel = [
        '0039',
        '0839',
        '0003',
        '0038',
        '003C',
        '0048',
        '001D',
        '001C',
    ];

    return systemChannel.includes(dialogData.code);
}

exports.startServer = startServer;