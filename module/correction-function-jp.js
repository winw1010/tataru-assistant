'use strict';

// jp text function
function replaceText(text, array, search = 0, replacement = 1) {
    if (!Array.isArray(array)) {
        return text;
    }

    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        text = text.replaceAll(element[search], element[replacement]);
    }

    return text;
}

function replaceTextByCode(text, array, search = 0, replacement = 1) {
    if (!Array.isArray(array)) {
        return {
            text: text,
            table: []
        };
    }

    // set code
    let codeIndex = 0;
    let codeString = 'BCDFGHJKLMNPQRSTVWXYZ';

    // clear code
    for (let index = 0; index < text.length; index++) {
        codeString = codeString.replaceAll(text[index].toUpperCase(), '');
    }

    // create table
    let table = [];
    for (let index = 0; index < array.length && codeIndex < codeString.length; index++) {
        const element = array[index];

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

        if (text.includes(element[search] + 'ちゃん')) {
            text = text.replaceAll(element[search] + 'ちゃん', codeString[codeIndex]);
            table.push([codeString[codeIndex], '小' + element[replacement]]);
            codeIndex++;
        }

        /*
        if (text.includes(element[search] + 'たん')) {
            text = text.replaceAll(element[search] + 'たん', codeString[codeIndex]);
            table.push([codeString[codeIndex], '小' + element[replacement]]);
            codeIndex++;
        }
        */

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

    const result = {
        text: text,
        table: table
    }

    console.log('result:', result);

    return result;
}

function shouldTranslate(text) {
    const en = 'abcdefghijklmnopqrstuvwxyz';
    const marks = [
        '、', '…', '。', '？', '！', '♪', '・', '：', 'ー', '―', '-',
        '（', '）', '[', ']', '〔', '〕', '「', '」', '『', '』', ' ', '　'
    ];

    for (let index = 0; index < en.length; index++) {
        const item = en[index];
        text = text.replaceAll(item.toUpperCase(), '');
        text = text.replaceAll(item, '');
    }

    for (let index = 0; index < marks.length; index++) {
        text = text.replaceAll(marks[index], '');
    }

    return text !== '';
}

function genderFix(originalText, translatedText) {
    const femaleWord = [
        '女',
        '娘',
        '嬢',
        '母',
        'マザー',
        'ピクシー',
        'ティターニア'
    ];

    let isFemale = false;

    for (let index = 0; index < femaleWord.length; index++) {
        const word = femaleWord[index];

        if (originalText.includes(word)) {
            isFemale = true;
            break;
        }
    }

    if (!isFemale) {
        translatedText = translatedText
            .replaceAll('她', '他')
            .replaceAll('小姐', '')
            .replaceAll('女王', '王');
    }

    if (!originalText.includes('娘')) {
        translatedText = translatedText
            .replaceAll('女兒', '女孩');
    }

    return translatedText;
}

exports.replaceText = replaceText;
exports.replaceTextByCode = replaceTextByCode;
exports.shouldTranslate = shouldTranslate;
exports.genderFix = genderFix;