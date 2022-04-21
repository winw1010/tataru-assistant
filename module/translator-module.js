const baidu = require('./translator/baidu');
const caiyun = require('./translator/caiyun');
const youdao = require('./translator/youdao');
const google = require('./translator/google');

const enginelist = ['baidu', 'caiyun', 'youdao', 'google'];

async function translate(text, engine, lan1, lan2, autoChange = true) {
    // set input
    const input = {
        text: text,
        from: lan1,
        to: lan2
    };

    let response = '';

    response = await selectEngine(engine, input);

    // auto change
    if (response == '') {
        console.log('Response is empty.');

        if (autoChange) {
            for (let index = 0; index < enginelist.length; index++) {
                const item = enginelist[index];

                console.log('Use ' + item + '.');

                if (item != engine) {
                    response = await selectEngine(item, input);

                    if (response != '') {
                        break;
                    }
                }
            }
        }
    }

    return response;
}

async function selectEngine(engine, input) {
    let text = '';

    switch (engine) {
        case 'baidu':
            text = await baidu.translate(input);
            break;

        case 'caiyun':
            text = await caiyun.translate(input);
            break;

        case 'youdao':
            text = await youdao.translate(input);
            break;

        case 'google':
            text = await google.translate(input);
            break;

        default:
            text = await baidu.translate(input);
    }

    return await zhConvert(text, input.to);
}

async function zhConvert(text, lan2) {
    if (['traditional-chinese', 'simplified-chinese'].includes(lan2)) {
        const input = {
            text: text,
            from: lan2 == 'traditional-chinese' ? 'simplified-chinese' : 'traditional-chinese',
            to: lan2
        };

        const response = await google.translate(input);

        return response != '' ? response : text;
    } else {
        return text;
    }
}

exports.translate = translate;