'use strict';

const baidu = require('./translator/baidu');
const youdao = require('./translator/youdao');
const caiyun = require('./translator/caiyun');
const google = require('./translator/google');
const deepl = require('./translator/deepl');
const googleTTS = require('./translator/google-tts');

async function getTranslation(engine, option) {
    try {
        let result = '';

        switch (engine) {
            case 'Baidu':
                result = await baidu.exec(option);
                break;

            case 'Youdao':
                result = await youdao.exec(option);
                break;

            case 'Caiyun':
                result = await caiyun.exec(option);
                break;

            case 'DeepL':
                result = await deepl.exec(option);
                break;

            case 'Google':
                result = await google.exec(option);
                break;

            case 'GoogleTTS':
                result = googleTTS.getAudioUrl(option);
                break;

            default:
                result = 'Engine is not available!';
                break;
        }

        return result || '';
    } catch (error) {
        console.log(error);
        return '';
    }
}

exports.getTranslation = getTranslation;
