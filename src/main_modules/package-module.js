'use strict';

const myPackages = {
    childProcess: require('child_process'),
    electron: require('electron'),

    fileModule: require('./file-module'),
    downloadGitRepo: require('./download-module'),
    configModule: require('./config-module'),
    chatCodeModule: require('./chat-code-module'),
    translateModule: require('./translate-module'),
    windowModule: require('./window-module'),
    correctionModule: require('./correction-module'),
    correctionModuleEn: require('./correction-module-en'),
    correctionModuleJp: require('./correction-module-jp'),

    requestModule: require('./translator/request-module'),
};

module.exports = myPackages;
