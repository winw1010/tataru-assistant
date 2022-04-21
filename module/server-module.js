// communicate with main process
const { ipcRenderer } = require('electron');

// http
const http = require('http');

// cprrection module
const { correctionEntry } = require('./correction-module');

// text history
let textHistory = {};

// create server
const server = http.createServer(function(request, response) {
    if (request.method == 'POST') {
        request.on('data', function(data) {
            dataProcess(data);
        });

        request.on('end', function() {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end('POST completed');
        });
    } else if (request.method == 'GET') {
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
}

// data process
function dataProcess(data) {
    try {
        let config = ipcRenderer.sendSync('load-config');
        let package = JSON.parse(data.toString());
        let packageNames = Object.getOwnPropertyNames(package);

        if (dataCheck(packageNames)) {
            // check code
            if (package.text != '' && config.channel[package.code]) {
                console.warn('data:', data);

                // check text history
                if (textHistory[package.text] && new Date().getTime() - textHistory[package.text] < 5000) {
                    return;
                } else {
                    textHistory[package.text] = new Date().getTime();
                }

                // check id
                if (!package.id) {
                    package.id = 'id' + new Date().getTime();
                }

                // is system message
                if (isSystemMessage(package)) {
                    if (package.name != '' && package.name != '...') {
                        package.text = package.name + ': ' + package.text;
                        package.name = '';
                    }
                }

                // string correction
                correctionEntry(package, config.translation);
            } else {
                console.log('data:' + data);
                console.log('Chat code is not in list.');
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// package check
function dataCheck(jsonDataNames) {
    return jsonDataNames.includes('code') &&
        jsonDataNames.includes('playerName') &&
        jsonDataNames.includes('name') &&
        jsonDataNames.includes('text');
}

// name check
function isSystemMessage(jsonData) {
    return jsonData.code == '0039' ||
        jsonData.code == '0839' ||
        jsonData.code == '0003' ||
        jsonData.code == '0038' ||
        jsonData.code == '003C' ||
        jsonData.code == '0048' ||
        jsonData.code == '001D' ||
        jsonData.code == '001C';
}

exports.startServer = startServer;