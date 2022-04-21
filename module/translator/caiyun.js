// axios
const axios = require('axios').default;

// language
const language = {
    'auto': 'auto',
    'japanese': 'ja',
    'english': 'en',
    'traditional-chinese': 'zh',
    'simplified-chinese': 'zh'
}

// start
async function translate(input) {
    try {
        const postData = JSON.stringify({
            source: input.text,
            trans_type: `${language[input.from]}2${language[input.to]}`,
            replaced: true,
            detect: true,
            media: 'text',
            request_id: '5a096eec830f7876a48aac47'
        });

        const response = await axios({
            method: 'post',
            url: 'http://api.interpreter.caiyunai.com/v1/translator',
            data: postData,
            headers: {
                'content-type': 'application/json',
                'x-authorization': 'token lqkr1tfixq1wa9kmj9po'
            }
        });

        console.log(response.data);
        return response.data.target;
    } catch (error) {
        console.log(error);
        return '';
    }
}

exports.translate = translate;