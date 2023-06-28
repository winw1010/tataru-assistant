'use strict';

// name fix array
const nameFixArray = getNameFixArray();

// female words
//const femaleWords = getFemaleWords();

// kana
const hiragana = getHiraganaString();
const katakana = getKatakanaString();

// jp text function
function replaceTextByCode(text, array, textType = 0) {
    const srcIndex = 0;
    const rplIndex = 1;

    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return {
            text: text,
            table: [],
        };
    }

    // for 2 words name
    if (textType !== 2) text = text.replaceAll(/(?<![ァ-ヺ・ー＝])[ァ-ヺ]{2}(?![ァ-ヺ・ー＝])/gi, '$&#');

    // set parameters
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

    /*
    // fix temp table
    if (textType === 2) {
        for (let index = tempTable.length - 1; index >= 0; index--) {
            const element = tempTable[index][0];
            if (/^[ァ-ヺ]{1,2}$/gi.test(element)) {
                tempTable.splice(index, 1);
            }
        }
    }
    */

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

function hiraFix(text = '') {
    text = text.replaceAll(/([あかさたなはまらがざだばぱやわ])ー/gi, '$1あ');
    text = text.replaceAll(/([いきしちにひみりぎじぢびぴ])ー/gi, '$1い');
    text = text.replaceAll(/([うくすつぬふむるぐずづぶぷゆ])ー/gi, '$1う');
    text = text.replaceAll(/([えけせてねへめれげぜでべぺ])ー/gi, '$1え');
    text = text.replaceAll(/([おこそとのほもろごぞどぼぽよを])ー/gi, '$1お');

    text = text.replaceAll('ゔぁ', 'ば');
    text = text.replaceAll('ゔぃ', 'び');
    text = text.replaceAll('ゔ', 'ぶ');
    text = text.replaceAll('ゔぇ', 'べ');
    text = text.replaceAll('ゔぉ', 'ぼ');

    return text;
}

function canSkipTranslation(text) {
    return !/[ぁ-ゖァ-ヺ\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF]/gi.test(text);
}

function genderFix(originalText, translatedText) {
    /*
    const isFemale = new RegExp(femaleWords.join('|'), 'gi').test(originalText);

    if (!isFemale) {
        translatedText = translatedText.replaceAll('她', '他').replaceAll('小姐', '').replaceAll('女王', '王');
    }
    */

    if (!originalText.includes('娘')) {
        translatedText = translatedText.replaceAll('女兒', '女孩');
    }

    return translatedText;
}

function isChinese(text, translation) {
    return translation.skipChinese && /^[^ぁ-ゖァ-ヺ]+$/gi.test(text);
}

/*
function getFemaleWords() {
    return ['女', '娘', '嬢', '母', 'マザー', 'ピクシー', 'ティターニア', 'クイーン'];
}
*/

function getHiraganaString() {
    return 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ';
}

function getKatakanaString() {
    return 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ';
}

function getNameFixArray() {
    // first: source, second: replacement, third: exception
    // 0: front, 1: back
    return [
        // common
        [
            ['さん', 1],
            ['', 0],
        ],
        [
            ['さーん', 1],
            ['', 0],
        ],
        [
            ['さ～ん', 1],
            ['', 0],
        ],
        [
            ['くん', 1],
            ['', 0],
        ],
        [
            ['君', 1],
            ['', 0],
        ],
        [
            ['ちゃん', 1],
            ['', 0],
        ],
        [
            ['はん', 1],
            ['', 0],
        ],
        [
            ['たん', 1],
            ['', 0],
        ],
        [
            ['氏', 1],
            ['', 0],
        ],
        [
            ['坊', 1],
            ['', 0],
        ],
        [
            ['老', 1],
            ['', 0],
        ],
        [
            ['ごとき', 1],
            ['', 0],
        ],
        [
            ['さま', 1],
            ['大人', 1],
            ['さまざま', 1],
        ],
        [
            ['様', 1],
            ['大人', 1],
        ],
        [
            ['たち', 1],
            ['們', 1],
        ],
        [
            ['さんたち', 1],
            ['們', 1],
        ],
        [
            ['……なんとか', 1],
            ['……什麼來著', 1],
        ],
        [
            ['どもめ', 1],
            ['', 0],
        ],
        [
            ['め', 1],
            ['', 1],
            ['めっちゃ', 1],
        ],
        [
            ['', 0],
            ['', 0],
        ],

        // title
        [
            ['陛下', 1],
            ['陛下', 1],
        ],
        [
            ['猊下', 1],
            ['陛下', 1],
        ],
        [
            ['殿下', 1],
            ['殿下', 1],
        ],
        [
            ['殿様', 1],
            ['殿下', 1],
        ],
        [
            ['提督', 1],
            ['提督', 1],
        ],
        [
            ['総長', 1],
            ['總長', 1],
        ],
        [
            ['伯爵', 1],
            ['伯爵', 1],
        ],
        [
            ['卿', 1],
            ['閣下', 1],
        ],
        [
            ['殿', 1],
            ['閣下', 1],
        ],
        [
            ['どの', 1],
            ['閣下', 1],
        ],
        [
            ['先輩', 1],
            ['前輩', 1],
        ],
        [
            ['先生', 1],
            ['老師', 1],
        ],
        [
            ['大先生', 1],
            ['老師', 1],
        ],
        [
            ['ミスター・', 0],
            ['先生', 1],
        ],
        [
            ['不肖', 0],
            ['不才', 0],
        ],
        [
            ['族', 1],
            ['族', 1],
        ],

        // things
        [
            ['様式', 1],
            ['樣式', 1],
        ],
        [
            ['会社', 1],
            ['公司', 1],
        ],
        [
            ['社', 1],
            ['公司', 1],
            ['社会', 1],
        ],

        // male
        [
            ['お祖父様', 1],
            ['祖父', 1],
        ],
        [
            ['祖父さん', 1],
            ['祖父', 1],
        ],
        [
            ['王子', 1],
            ['王子', 1],
        ],
        [
            ['坊ちゃん', 1],
            ['少爺', 1],
        ],

        // female
        [
            ['姫様', 1],
            ['公主大人', 1],
        ],
        [
            ['姫', 1],
            ['公主', 1],
        ],
        [
            ['王女', 1],
            ['公主', 1],
        ],
        [
            ['女史', 1],
            ['女士', 1],
        ],
        [
            ['お嬢ちゃん', 1],
            ['小姐', 1],
        ],
        [
            ['お嬢さん', 1],
            ['小姐', 1],
        ],
        [
            ['お嬢様', 1],
            ['大小姐', 1],
        ],
    ].sort((a, b) => b[0][0].length - a[0][0].length);
}

// module exports
module.exports = {
    replaceTextByCode,
    convertKana,
    reverseKana,
    canSkipTranslation,
    genderFix,
    isChinese,
};
