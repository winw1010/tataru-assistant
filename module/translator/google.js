// google
const google = require('@hobbica98/google-translate-api');

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const res = await google(text, { from: languageFrom, to: languageTo });

        console.log('Google:', res);
        return res.text;
    } catch (error) {
        console.log('Google:', error);
        return '';
    }
}

exports.translate = translate;