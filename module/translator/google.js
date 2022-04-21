// google
const google = require('@hobbica98/google-translate-api');

// language
const language = {
    'auto': 'auto',
    'japanese': 'ja',
    'english': 'en',
    'traditional-chinese': 'zh-TW',
    'simplified-chinese': 'zh-CN'
}

// translate
async function translate(input) {
    try {
        const res = await google(input.text, { from: language[input.from], to: language[input.to] });

        console.log(res);
        return res.text;
    } catch (error) {
        console.log(error);
        return '';
    }
}

exports.translate = translate;