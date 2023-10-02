'use strict';

// jp json
const jpJson = require('./jp-json');

// female words
const femaleWords = getFemaleWords();

// kana
const hiragana = getHiraganaString();
const katakana = getKatakanaString();

// jp text function
function replaceTextByCode(text = '', array = [], textType = 0) {
    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return {
            text: text,
            table: [],
        };
    }

    if (textType !== 2) {
        // miqo'te tribes
        // text = text.replace(/(?<![ァ-ヺー・＝])[ァ-ヺ]族(?![ァ-ヺー・＝#])/gi, '$&#');

        // 2 words name
        text = text.replace(/(?<![ァ-ヺー・＝])[ァ-ヺー]{2}(?![ァ-ヺー・＝#])/gi, '$&#');
    }

    // set parameters
    const nameFixArray = jpJson.getJpArray().title;
    const srcIndex = 0;
    const rplIndex = 1;
    let codeIndex = 0;
    let codeString = 'BCFGHJLMNPQRSTVWXYZ';
    let tempText = text;
    let tempTable = [];
    let table = [];

    // create temp table
    for (let index = 0; index < array.length; index++) {
        const element = array[index];

        // hira name
        if (element[srcIndex].length > 2) {
            const hiraElement = convertKana(element[srcIndex], 'hira');
            const hiraElement2 = hiraFix(hiraElement);

            if (tempText.includes('「' + hiraElement + '」')) {
                tempTable.push(['「' + hiraElement + '」', '「' + element[rplIndex] + '」']);
                tempText = tempText.replaceAll('「' + hiraElement + '」', '');
            }

            if (tempText.includes('『' + hiraElement + '』')) {
                tempTable.push(['『' + hiraElement + '』', '『' + element[rplIndex] + '』']);
                tempText = tempText.replaceAll('『' + hiraElement + '』', '');
            }

            if (tempText.includes('「' + hiraElement2 + '」')) {
                tempTable.push(['「' + hiraElement2 + '」', '「' + element[rplIndex] + '」']);
                tempText = tempText.replaceAll('「' + hiraElement2 + '」', '');
            }

            if (tempText.includes('『' + hiraElement2 + '』')) {
                tempTable.push(['『' + hiraElement2 + '』', '『' + element[rplIndex] + '』']);
                tempText = tempText.replaceAll('『' + hiraElement2 + '』', '');
            }
        }

        // brackets
        if (tempText.includes('「' + element[srcIndex] + '」')) {
            tempTable.push(['「' + element[srcIndex] + '」', '「' + element[rplIndex] + '」']);
            tempText = tempText.replaceAll('「' + element[srcIndex] + '」', '');
        }

        if (tempText.includes('『' + element[srcIndex] + '』')) {
            tempTable.push(['『' + element[srcIndex] + '』', '『' + element[rplIndex] + '』']);
            tempText = tempText.replaceAll('『' + element[srcIndex] + '』', '');
        }

        // normal
        if (tempText.includes(element[srcIndex])) {
            tempTable.push([element[srcIndex], element[rplIndex]]);
            tempText = tempText.replaceAll(element[srcIndex], '');
        }
    }

    // sort temp table
    tempTable = tempTable.sort((a, b) => b[0].length - a[0].length);

    // reset temp text
    tempText = text;
    for (let index = 0; index < tempTable.length; index++) {
        const element = tempTable[index];
        tempText += element[1];
    }

    // clear code
    const characters = tempText.match(/[a-z]/gi);
    if (characters) {
        for (let index = 0; index < characters.length; index++) {
            codeString = codeString.replaceAll(characters[index].toUpperCase(), '');
        }
    }

    // search and replace
    for (let eleIndex = 0; eleIndex < tempTable.length && codeIndex < codeString.length; eleIndex++) {
        const element = tempTable[eleIndex];

        for (let fixIndex = 0; fixIndex < nameFixArray.length; fixIndex++) {
            try {
                const nameFix = nameFixArray[fixIndex];
                const sorceName = nameFix[0][1] === 0 ? nameFix[0][0] + element[srcIndex] : element[srcIndex] + nameFix[0][0];
                const replaceName = nameFix[1][1] === 0 ? nameFix[1][0] + element[rplIndex] : element[rplIndex] + nameFix[1][0];

                if (nameFix[2]) {
                    const exceptionName = nameFix[2][1] === 0 ? nameFix[2][0] + element[srcIndex] : element[srcIndex] + nameFix[2][0];
                    if (text.includes(sorceName) && !text.includes(exceptionName)) {
                        text = text.replaceAll(sorceName, codeString[codeIndex]);
                        table.push([codeString[codeIndex], replaceName]);
                        codeIndex++;
                    }
                } else {
                    if (text.includes(sorceName)) {
                        text = text.replaceAll(sorceName, codeString[codeIndex]);
                        table.push([codeString[codeIndex], replaceName]);
                        codeIndex++;
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    // remove #
    text = text.replaceAll('#', '');

    const result = {
        text: text,
        table: table,
    };

    console.log('tempTable:', tempTable);
    console.log('codeString:', codeString);
    console.log('result:', result);

    return result;
}

function specialReplace(text = '', array = []) {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        text = text.replace(element[0], element[1]);
    }
    return text;
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

function hiraFix(text = '') {
    text = text.replace(/([あかさたなはまらがざだばぱやわ])ー/gi, '$1あ');
    text = text.replace(/([いきしちにひみりぎじぢびぴ])ー/gi, '$1い');
    text = text.replace(/([うくすつぬふむるぐずづぶぷゆ])ー/gi, '$1う');
    text = text.replace(/([えけせてねへめれげぜでべぺ])ー/gi, '$1え');
    text = text.replace(/([おこそとのほもろごぞどぼぽよを])ー/gi, '$1お');

    text = text.replace(/ゔぁ/gi, 'ば');
    text = text.replace(/ゔぃ/gi, 'び');
    text = text.replace(/ゔ/gi, 'ぶ');
    text = text.replace(/ゔぇ/gi, 'べ');
    text = text.replace(/ゔぉ/gi, 'ぼ');

    return text;
}

function canSkipTranslation(text = '') {
    return !/[ぁ-ゖァ-ヺ\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF]/gi.test(text);
}

function genderFix(originalText = '', translatedText = '') {
    const isFemale = new RegExp(femaleWords.join('|'), 'gi').test(originalText);

    if (!isFemale) {
        translatedText = translatedText.replaceAll('她', '他').replaceAll('小姐', '').replaceAll('女王', '王');
    }

    if (!originalText.includes('娘')) {
        translatedText = translatedText.replaceAll('女兒', '女孩');
    }

    return translatedText;
}

function isChinese(text = '', translation = {}) {
    return translation.skipChinese && /^[^ぁ-ゖァ-ヺ]+$/gi.test(text);
}

function getFemaleWords() {
    return ['女', '娘', '嬢', '母', 'マザー', 'ピクシー', 'ティターニア', 'クイーン'];
}

function getHiraganaString() {
    return 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ';
}

function getKatakanaString() {
    return 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ';
}

// module exports
module.exports = {
    replaceTextByCode,
    specialReplace,
    convertKana,
    reverseKana,
    canSkipTranslation,
    genderFix,
    isChinese,
};
