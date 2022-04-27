// baidu
const baidu = require("baidu-translate-api");

// translate
async function translate(text, languageFrom, languageTo) {
    try {
        const res = await baidu(text, { from: languageFrom, to: languageTo });

        console.log('Baidu:', res);
        return res.trans_result.dst;
    } catch (error) {
        console.log('Baidu:', error);
        return '';
    }
}

exports.translate = translate;