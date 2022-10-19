'use strict';

const myPackages = {
    // system
    childProcess: require('child_process'),
    electron: require('electron'),

    // main
    configModule: require('./config-module'),
    chatCodeModule: require('./chat-code-module'),
    fileModule: require('./file-module'),
    windowModule: require('./window-module'),

    // translate
    engineModule: require('./engine-module'),
    downloadModule: require('./download-module'),
    correctionFunctionEn: require('./correction-function-en'),
    correctionFunctionJp: require('./correction-function-jp'),
    correctionFunction: require('./correction-function'),
    correctionModuleEn: require('./correction-module-en'),
    correctionModuleJp: require('./correction-module-jp'),
    correctionModule: require('./correction-module'),
    translateModule: require('./translate-module'),

    // youdao
    youdao: require('./translator/youdao'),

    // baidu
    baidu: require('./translator/baidu'),
    baiduEncoder: require('./translator/baidu-encoder'),

    // caiyun
    caiyun: require('./translator/caiyun'),

    // papago
    papago: require('./translator/papago'),

    // deepl
    deepl: require('./translator/deepl'),
    deeplRequest: require('./translator/deepl-request'),

    // google
    google: require('./translator/google'),
    googleEncoder: require('./translator/google-encoder'),
    googleTTS: require('./translator/google-tts'),

    // zh convert
    zhConvert: require('./translator/zh-convert'),
    zhConvertList: require('./translator/zh-convert-list'),

    // request module
    requestModule: require('./translator/request-module'),
};

module.exports = myPackages;
