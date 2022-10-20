'use strict';

const myPackages = {
    // main
    childProcess: require('child_process'),
    fileSystem: require('fs'),
    path: require('path'),
    electron: require('electron'),
    cryptoJS: require('crypto-js'),

    // system
    chatCodeModule: require('./system/chat-code-module'),
    configModule: require('./system/config-module'),
    engineModule: require('./system/engine-module'),
    fileModule: require('./system/file-module'),
    requestModule: require('./system/request-module'),
    translateModule: require('./system/translate-module'),
    windowModule: require('./system/window-module'),

    // correction
    correctionFunctionEn: require('./correction/correction-function-en'),
    correctionFunctionJp: require('./correction/correction-function-jp'),
    correctionFunction: require('./correction/correction-function'),
    correctionModuleEn: require('./correction/correction-module-en'),
    correctionModuleJp: require('./correction/correction-module-jp'),
    correctionModule: require('./correction/correction-module'),
    downloadModule: require('./correction/download-module'),

    // translator
    baiduEncoder: require('./translator/baidu-encoder'),
    baidu: require('./translator/baidu'),
    caiyun: require('./translator/caiyun'),
    deeplRequest: require('./translator/deepl-request'),
    deepl: require('./translator/deepl'),
    googleEncoder: require('./translator/google-encoder'),
    googleTTS: require('./translator/google-tts'),
    google: require('./translator/google'),
    papago: require('./translator/papago'),
    youdao: require('./translator/youdao'),
    zhConvertTable: require('./translator/zh-convert-table'),
    zhConvert: require('./translator/zh-convert'),
};

module.exports = myPackages;
