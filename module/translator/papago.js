// "puppeteer-papago-scraping": "^2.1.1",

// papago
const papagoTranslate = require('puppeteer-papago-scraping');

// language
const language = {
    'auto': 'detect',
    'japanese': 'ja',
    'english': 'en',
    'traditional-chinese': 'zh-CN',
    'simplified-chinese': 'zh-CN'
}

// translate
async function translate(input) {
    try {
        const translatedText = await papagoTranslate(input.text, language[input.to], language[input.from]);

        console.log(translatedText);
        return translatedText;
    } catch (error) {
        console.log(error);
        return '';
    }
};

exports.translate = translate;

/*
// broken
const Papago = require('nodepapago').default;

async function translate(input) {
    try {
        const res = await new Papago({
            parameter: {
                source: language[input.from],
                target: language[input.to],
                text: input.text
            }
        }).translate();

        console.log(res);
        return res;
    } catch (error) {
        console.log(error);
        return '';
    }
}
*/