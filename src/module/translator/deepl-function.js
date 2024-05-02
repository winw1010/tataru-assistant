const splitText = {
  jsonrpc: '2.0',
  method: 'LMT_split_text',
  params: {
    texts: [],
    commonJobParams: { mode: 'translate' },
    lang: {
      lang_user_selected: 'auto',
      preference: { weight: {}, default: 'default' },
    },
  },
  id: 50920014,
};

const handleJobs = {
  jsonrpc: '2.0',
  method: 'LMT_handle_jobs',
  params: {
    jobs: [],
    lang: {
      preference: { weight: {}, default: 'default' },
      source_lang_computed: 'JA',
      target_lang: 'ZH',
    },
    priority: 1,
    commonJobParams: { mode: 'translate', textType: 'plaintext', browserType: 1 },
    timestamp: 1658461983751,
  },
  id: 50920016,
};

// get split text
function getSplitText() {
  return JSON.parse(JSON.stringify(splitText));
}

// get handle jobs
function getHandleJobs() {
  return JSON.parse(JSON.stringify(handleJobs));
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
          id: index + 1,
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
function fixMethod(id = 0, text = '') {
  if ((id + 3) % 13 === 0 || (id + 5) % 29 === 0) {
    text = text.replace(`"method":"`, `"method" : "`);
  } else {
    text = text.replace(`"method":"`, `"method": "`);
  }

  return text;
}

// module exports
module.exports = {
  getSplitText,
  getHandleJobs,
  generateJobs,
  generateTimestamp,
  fixMethod,
};
