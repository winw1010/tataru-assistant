'use strict';

// Cookie: https://www.deepl.com/translator
// Split Text: https://www2.deepl.com/jsonrpc?method=LMT_split_text
// Translate: https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs

// deepl request
const deeplRequest = require('./deepl-request');

// axios module
const axiosModule = require('../system/axios-module');

// RegExp
const dapUidRegExp = /(?<target>dapUid=.*?)(?=;|$)/is;

// expire date
let expiryDate = 0;

// cookie
let cookie = '';

// authentication
let authentication = {};

// exec
async function exec(option) {
    try {
        let result = '';

        // check expire date
        if (new Date().getTime() >= expiryDate) {
            await initialize();
        }

        // split text
        const chunks = await splitText(option.text);

        // get result
        chunks && (result = await translate(cookie, authentication, option, chunks));

        return result;
    } catch (error) {
        console.log(error);
        expiryDate = 0;
        return '';
    }
}

// initialize
async function initialize() {
    // set cookie
    await setCookie();

    // set authentication
    setAuthentication();
}

// set cookie
async function setCookie() {
    const response = dapUidRegExp.exec(await axiosModule.getCookie('https://www.deepl.com/translator'))?.groups?.target;

    if (response) {
        cookie = response;
        expiryDate = axiosModule.getExpiryDate();
    } else {
        throw 'ERROR: setCookie';
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
    let postData = deeplRequest.splitText;
    postData.id = authentication.id++;
    postData.params.texts = [text];

    const postDataString = fixMethod(postData.id, JSON.stringify(postData));

    const response = (
        await axiosModule.post('https://www2.deepl.com/jsonrpc?method=LMT_split_text', postDataString, {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'zh-TW,zh;q=0.9',
                'content-type': 'application/json',
                origin: 'https://www.deepl.com',
                referer: 'https://www.deepl.com/',
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': axiosModule.getUserAgent(),
            },
        })
    )?.result?.texts[0]?.chunks;

    if (response) {
        return response;
    } else {
        throw 'ERROR: splitText';
    }
}

// translate
async function translate(cookie, authentication, option, chunks) {
    let postData = deeplRequest.handleJobs;
    postData.id = authentication.id++;
    postData.params.jobs = generateJobs(chunks);
    postData.params.lang.source_lang_computed = option.from;
    postData.params.lang.target_lang = option.to;
    postData.params.timestamp = generateTimestamp(postData.params.jobs);

    const postDataString = fixMethod(postData.id, JSON.stringify(postData));

    const response = (
        await axiosModule.post('https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs', postDataString, {
            headers: {
                accept: '*/*',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'zh-TW,zh;q=0.9',
                'content-type': 'application/json',
                cookie: cookie,
                origin: 'https://www.deepl.com',
                referer: 'https://www.deepl.com/',
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': axiosModule.getUserAgent(),
            },
        })
    )?.result?.translations;

    if (response) {
        let result = '';

        for (let index = 0; index < response.length; index++) {
            result += response[index]?.beams[0]?.sentences[0]?.text || '';
        }

        return result;
    } else {
        throw 'ERROR: translate';
    }
}

// generate jobs
function generateJobs(chunks) {
    let newChunks = chunks.map((x) => x.sentences[0]);
    let jobs = [];

    for (let index = 0; index < newChunks.length; index++) {
        jobs.push({
            kind: 'default',
            sentences: [
                {
                    text: newChunks[index].text,
                    id: index,
                    prefix: newChunks[index].prefix,
                },
            ],
            raw_en_context_before: newChunks[index - 1] ? [newChunks[index - 1].text] : [],
            raw_en_context_after: newChunks[index + 1] ? [newChunks[index + 1].text] : [],
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
        const sentence = jobs[index]?.sentences[0]?.text || '';
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

// module exports
module.exports = { exec };
