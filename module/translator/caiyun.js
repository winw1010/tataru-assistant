// axios
const axios = require('axios').default;

// start
async function translate(text, languageFrom, languageTo) {
    try {
        const postData = JSON.stringify({
            source: text,
            trans_type: `${languageFrom}2${languageTo}`,
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

        console.log('Caiyun:', response.data);
        return response.data.target;
    } catch (error) {
        console.log('Caiyun:', error);
        return '';
    }
}

exports.translate = translate;