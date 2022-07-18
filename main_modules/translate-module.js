const baidu = require('./translator/baidu');
const youdao = require('./translator/youdao');
const caiyun = require('./translator/caiyun');
const google = require('./translator/google');

async function getTranslation(engine, option) {
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

        case 'Google':
            result = await google.exec(option);
            break;

        default:
            result = 'Engine is not available!';
            break;
    }

    return result;
}

exports.getTranslation = getTranslation;