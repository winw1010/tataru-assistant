const { addToQueue_JP } = require('./correction-module-jp');
const { addToQueue_EN } = require('./correction-module-en');

function correctionEntry(package, translation) {
    if (checkLanguage(package, translation, 'japanese')) {
        addToQueue_JP(package, translation);
    } else if (checkLanguage(package, translation, 'english')) {
        addToQueue_EN(package, translation);
    }
}

function checkLanguage(package, translation, language) {
    return (package.code == '000E' && translation.fromParty == language) ||
        (package.code != '000E' && translation.from == language);
}

exports.correctionEntry = correctionEntry;