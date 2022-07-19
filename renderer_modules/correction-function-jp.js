'use strict';

// correction function
const cf = require('./correction-function');

// female words
const femaleWords = ['女', '娘', '嬢', '母', 'マザー', 'ピクシー', 'ティターニア'];

// kana
const hiragana =
    'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ';
const katakana =
    'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ';

// jp text function

function replaceTextByCode(text, array, search = 0, replacement = 1) {
    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return {
            text: text,
            table: [],
        };
    }

    // set code
    let codeIndex = 0;
    let codeString = 'BCFGHJLMNPQRSTVWXYZ';

    // clear code
    const characters = text.match(/[a-z]/gi);
    if (characters) {
        for (let index = 0; index < characters.length; index++) {
            codeString = codeString.replaceAll(characters[index].toUpperCase(), '');
        }
    }

    // set table
    const target = cf.includesArrayItem(text, array, search);
    let table = [];

    if (target) {
        for (let index = 0; index < target.length && codeIndex < codeString.length; index++) {
            const element = target[index];

            if (text.includes(element[search] + 'さん')) {
                text = text.replaceAll(element[search] + 'さん', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement]]);
                codeIndex++;
            }

            if (text.includes(element[search] + 'くん')) {
                text = text.replaceAll(element[search] + 'くん', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement]]);
                codeIndex++;
            }

            if (text.includes(element[search] + '君')) {
                text = text.replaceAll(element[search] + '君', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement]]);
                codeIndex++;
            }

            if (text.includes(element[search] + '氏')) {
                text = text.replaceAll(element[search] + '氏', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement]]);
                codeIndex++;
            }

            // たん
            if (text.includes(element[search] + 'ちゃん')) {
                text = text.replaceAll(element[search] + 'ちゃん', codeString[codeIndex]);
                table.push([codeString[codeIndex], '小' + element[replacement]]);
                codeIndex++;
            }

            if (text.includes(element[search] + 'たち')) {
                text = text.replaceAll(element[search] + 'たち', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '們']);
                codeIndex++;
            }

            if (text.includes(element[search] + 'お嬢ちゃん')) {
                text = text.replaceAll(element[search] + 'お嬢ちゃん', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '小姐']);
                codeIndex++;
            }

            if (text.includes(element[search] + 'お嬢さん')) {
                text = text.replaceAll(element[search] + 'お嬢さん', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '小姐']);
                codeIndex++;
            }

            if (text.includes(element[search] + 'お嬢様')) {
                text = text.replaceAll(element[search] + 'お嬢様', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '小姐']);
                codeIndex++;
            }

            if (text.includes(element[search] + '先輩')) {
                text = text.replaceAll(element[search] + '先輩', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '前輩']);
                codeIndex++;
            }

            if (text.includes(element[search] + 'さま')) {
                text = text.replaceAll(element[search] + 'さま', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '大人']);
                codeIndex++;
            }

            if (text.includes(element[search] + '様')) {
                text = text.replaceAll(element[search] + '様', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '大人']);
                codeIndex++;
            }

            if (text.includes(element[search] + '提督')) {
                text = text.replaceAll(element[search] + '提督', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '提督']);
                codeIndex++;
            }

            if (text.includes(element[search] + '総長')) {
                text = text.replaceAll(element[search] + '総長', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '總長']);
                codeIndex++;
            }

            if (text.includes(element[search] + '伯爵')) {
                text = text.replaceAll(element[search] + '伯爵', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '伯爵']);
                codeIndex++;
            }

            if (text.includes(element[search] + '卿')) {
                text = text.replaceAll(element[search] + '卿', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '閣下']);
                codeIndex++;
            }

            if (text.includes(element[search] + '陛下')) {
                text = text.replaceAll(element[search] + '陛下', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '陛下']);
                codeIndex++;
            }

            if (text.includes(element[search] + '猊下')) {
                text = text.replaceAll(element[search] + '猊下', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '陛下']);
                codeIndex++;
            }

            if (text.includes(element[search] + '殿下')) {
                text = text.replaceAll(element[search] + '殿下', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '殿下']);
                codeIndex++;
            }

            if (text.includes(element[search] + '殿様')) {
                text = text.replaceAll(element[search] + '殿様', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '殿下']);
                codeIndex++;
            }

            if (text.includes(element[search] + '殿')) {
                text = text.replaceAll(element[search] + '殿', codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement] + '閣下']);
                codeIndex++;
            }

            if (text.includes(element[search])) {
                text = text.replaceAll(element[search], codeString[codeIndex]);
                table.push([codeString[codeIndex], element[replacement]]);
                codeIndex++;
            }
        }
    }

    const result = {
        text: text,
        table: table,
    };

    console.log('result:', result);

    return result;
}

function convertKana(text = '', type = '') {
    switch (type) {
        case 'hira':
            for (let index = 0; index < katakana.length; index++) {
                text = text.replaceAll(katakana[index], hiragana[index]);
            }
            break;

        case 'kata':
            for (let index = 0; index < hiragana.length; index++) {
                text = text.replaceAll(hiragana[index], katakana[index]);
            }
            break;

        default:
            break;
    }

    return text;
}

function reverseKana(text = '') {
    let newString = '';
    for (let index = 0; index < text.length; index++) {
        const word = text[index];

        if (/[ぁ-ゖ]/.test(word)) {
            newString += convertKana(word, 'kata');
        } else if (/[ァ-ヺ]/.test(word)) {
            newString += convertKana(word, 'hira');
        } else {
            newString += word;
        }
    }

    return newString;
}

function canSkipTranslation(text) {
    // remove english word and marks
    text = text.replaceAll(/[^ぁ-ゖァ-ヺ\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF]/gi, '');

    return text === '';
}

function genderFix(originalText, translatedText) {
    const isFemale = new RegExp(femaleWords.join('|'), 'gi').test(originalText);

    if (!isFemale) {
        translatedText = translatedText.replaceAll('她', '他').replaceAll('小姐', '').replaceAll('女王', '王');
    }

    if (!originalText.includes('娘')) {
        translatedText = translatedText.replaceAll('女兒', '女孩');
    }

    return translatedText;
}

function isChinese(text) {
    return !/[ぁ-ゖァ-ヺ]/gi.test(text);
}

exports.replaceTextByCode = replaceTextByCode;
exports.convertKana = convertKana;
exports.reverseKana = reverseKana;
exports.canSkipTranslation = canSkipTranslation;
exports.genderFix = genderFix;
exports.isChinese = isChinese;
