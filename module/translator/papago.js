// "puppeteer-papago-scraping": "^2.1.1",

// papago
const papagoTranslate = require('puppeteer-papago-scraping');

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const translatedText = await papagoTranslate(text, languageTo, languageFrom);

        console.log('Papago:', translatedText);
        return translatedText;
    } catch (error) {
        console.log('Papago:', error);
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