const { youdaoTranslator } = require('translators');

// language
const language = {
    'auto': 'auto',
    'japanese': 'ja',
    'english': 'en',
    'traditional-chinese': 'zh',
    'simplified-chinese': 'zh'
}

// translate
async function translate(input) {
    try {
        const res = await youdaoTranslator(input.text, language[input.from], language[input.to], {});

        console.log(res);
        return res;
    } catch (error) {
        console.log(error);
        return '';
    }
}

exports.translate = translate;