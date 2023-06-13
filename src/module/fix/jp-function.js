'use strict';

// name fix array
const nameFixArray = getNameFixArray();

// female words
//const femaleWords = getFemaleWords();

// kana
const hiragana = getHiraganaString();
const katakana = getKatakanaString();

// jp text function
function replaceTextByCode(text, array, srcIndex = 0, rplIndex = 1) {
    if (text === '' || !Array.isArray(array) || !array.length > 0) {
        return {
            text: text,
            table: [],
        };
    }

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

            if (tempText.includes('「' + hiraElement + '」')) {
                tempTable.push(['「' + hiraElement + '」', '「' + element[rplIndex] + '」']);
                tempText = tempText.replaceAll('「' + hiraElement + '」', '');
            }

            if (tempText.includes('『' + hiraElement + '』')) {
                tempTable.push(['『' + hiraElement + '』', '『' + element[rplIndex] + '』']);
                tempText = tempText.replaceAll('『' + hiraElement + '』', '');
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

    // reset srcIndex and rplIndex
    srcIndex = 0;
    rplIndex = 1;

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
            ['氏', 1],
            ['', 0],
        ],
        [
            ['老', 1],
            ['', 0],
        ],
        [
            ['ちゃん', 1],
            ['', 0],
        ],
        [
            ['たち', 1],
            ['們', 1],
        ],
        [
            ['族', 1],
            ['族', 1],
        ],
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
            ['様式', 1],
            ['樣式', 1],
        ],
        [
            ['さま', 1],
            ['大人', 1],
        ],
        [
            ['様', 1],
            ['大人', 1],
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
            ['殿', 1],
            ['閣下', 1],
        ],
        [
            ['……なんとか', 1],
            ['……什麼來著', 1],
        ],
        [
            ['どもめ', 1],
            ['可惡的', 0],
        ],
        [
            ['め', 1],
            ['這傢伙', 1],
            ['めっちゃ', 1],
        ],
        [
            ['', 0],
            ['', 0],
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

// for testing
//replaceTextByCode('「タタル」。『タタル』。「たたる」。『たたる』。タタル。', [['タタル', '塔塔露']]);
//replaceTextByCode('「タタル」さん。『タタル』さん。「たたる」さん。『たたる』さん。タタルさん。', [['タタル', '塔塔露']]);
//replaceTextByCode('「タタル」お嬢さん。『タタル』お嬢さん。「たたる」お嬢さん。『たたる』お嬢さん。タタルお嬢さん。', [['タタル', '塔塔露']]);
