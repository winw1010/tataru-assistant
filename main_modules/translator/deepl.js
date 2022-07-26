'use strict';

// Cookie: https://www.deepl.com/translator
// Split Text: https://www2.deepl.com/jsonrpc?method=LMT_split_text
// Translate: https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs

// request module
const { startRequest } = require('./request-module');

// deepl request
const deeplRequest = require('./deepl-request');

// user agent
const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';

// RegExp
//const dapUidRegExp = /(?<target>dapUid=.*?)(?=;|$)/i;

// authentication
let authentication = null;

// exec
async function exec(option) {
    try {
        let result = '';

        // check authentication
        if (!authentication) {
            setAuthentication();
        }

        // split text
        const chunks = await splitText(option.text);

        // get result
        chunks && (result = await translate(authentication, chunks, option));

        // if chunks or result is null => reset authentication
        if (!chunks || !result) {
            throw 'No Response';
        }

        /*
        console.log({
            expiredDate: expireDate,
            cookie: cookie,
            authentication: authentication,
            response: response
        });
        */

        return result;
    } catch (error) {
        console.log(error);
        setAuthentication();
        return '';
    }
}

// set authentication
function setAuthentication() {
    authentication = {
        id: Math.floor(Math.random() * (100_000_000 - 1_000_000 + 1)) + 1_000_000,
    };
}

// split text
async function splitText(text) {
    const callback = function (response, chunk) {
        if (response.statusCode === 200) {
            const data = JSON.parse(chunk.toString());

            if (data.result) {
                return data.result.texts[0].chunks;
            }
        }
    };

    let postData = deeplRequest.splitText;
    postData.id = authentication.id++;
    postData.params.texts = [text];

    const postDataString = fixMethod(postData.id, JSON.stringify(postData));

    return await startRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'www2.deepl.com',
            path: '/jsonrpc?method=LMT_split_text',
        },
        headers: [
            ['accept', '*/*'],
            ['accept-encoding', 'gzip, deflate, br'],
            ['accept-language', 'zh-TW,zh;q=0.9'],
            ['content-type', 'application/json'],
            ['origin', 'https://www.deepl.com'],
            ['referer', 'https://www.deepl.com/'],
            ['sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'],
            ['sec-ch-ua-mobile', '?0'],
            ['sec-ch-ua-platform', '"Windows"'],
            ['sec-fetch-dest', 'empty'],
            ['sec-fetch-mode', 'cors'],
            ['sec-fetch-site', 'same-site'],
            ['user-agent', userAgent],
        ],
        data: postDataString,
        callback: callback,
    });
}

// translate
async function translate(authentication, chunks, option) {
    const callback = function (response, chunk) {
        if (response.statusCode === 200) {
            const data = JSON.parse(chunk.toString());

            if (data.result) {
                let result = '';
                const resultArray = data.result.translations;

                for (let index = 0; index < resultArray.length; index++) {
                    const element = resultArray[index].beams[0].sentences[0].text;
                    result += element || '';
                }

                return result;
            }
        }
    };

    let postData = deeplRequest.handleJobs;
    postData.id = authentication.id++;
    postData.params.jobs = generateJobs(chunks);
    postData.params.lang.source_lang_computed = option.from;
    postData.params.lang.target_lang = option.to;
    postData.params.timestamp = generateTimestamp(postData.params.jobs);

    const postDataString = fixMethod(postData.id, JSON.stringify(postData));

    return await startRequest({
        options: {
            method: 'POST',
            protocol: 'https:',
            hostname: 'www2.deepl.com',
            path: '/jsonrpc?method=LMT_handle_jobs',
        },
        headers: [
            ['accept', '*/*'],
            ['accept-encoding', 'gzip, deflate, br'],
            ['accept-language', 'zh-TW,zh;q=0.9'],
            ['content-type', 'application/json'],
            ['origin', 'https://www.deepl.com'],
            ['referer', 'https://www.deepl.com/'],
            ['sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'],
            ['sec-ch-ua-mobile', '?0'],
            ['sec-ch-ua-platform', '"Windows"'],
            ['sec-fetch-dest', 'empty'],
            ['sec-fetch-mode', 'cors'],
            ['sec-fetch-site', 'same-site'],
            ['user-agent', userAgent],
        ],
        data: postDataString,
        callback: callback,
    });
}

// generate jobs
function generateJobs(chunks) {
    let newChunks = chunks.map((x) => x.sentences);
    let jobs = [];

    for (let index = 0; index < newChunks.length; index++) {
        const sentence = newChunks[index];
        sentence.id = index;

        jobs.push({
            kind: 'default',
            sentences: [
                {
                    text: newChunks[index][0].text,
                    id: 0,
                    prefix: newChunks[index][0].prefix,
                },
            ],
            raw_en_context_before: newChunks[index - 1] ? [newChunks[index - 1][0].text] : [],
            raw_en_context_after: newChunks[index + 1] ? [newChunks[index + 1][0].text] : [],
            preferred_num_beams: 1,
        });
    }

    return jobs;
}

// generate timestamp
function generateTimestamp(jobs) {
    let iCount = 1;
    let currentTime = new Date().getTime();

    for (let index = 0; index < jobs.length; index++) {
        const sentence = jobs[index].sentences[0].text;
        iCount += sentence.split('i').length - 1;
    }

    return currentTime - (currentTime % iCount) + iCount;
}

// fix method
function fixMethod(id, text) {
    if ((id + 3) % 13 === 0 || (id + 5) % 29 === 0) {
        text = text.replace(`"method":"`, `"method" : "`);
    } else {
        text = text.replace(`"method":"`, `"method": "`);
    }

    return text;
}

exports.exec = exec;
