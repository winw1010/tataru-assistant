// baidu
const baidu = require("baidu-translate-api");

// language
const language = {
    'auto': 'auto',
    'japanese': 'jp',
    'english': 'en',
    'traditional-chinese': 'zh',
    'simplified-chinese': 'zh'
}

// translate
async function translate(input) {
    try {
        const res = await baidu(input.text, { from: language[input.from], to: language[input.to] });

        console.log(res);
        return res.trans_result.dst;
    } catch (error) {
        console.log(error);
        return '';
    }
}

/* debug
translate({
    text: '慎重に情報を精査しますので、次の作戦の方針が固まるまで、今しばらく待機をお願いいたします。',
    from: 'japanese',
    to: 'traditional-chinese'
});
*/

exports.translate = translate;