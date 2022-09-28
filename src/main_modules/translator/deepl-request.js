const splitText = {
    jsonrpc: '2.0',
    method: 'LMT_split_text',
    params: {
        texts: [],
        lang: {
            lang_user_selected: 'auto',
            preference: {
                weight: {},
                default: 'default',
            },
        },
    },
    id: 50920014,
};

const handleJobs = {
    jsonrpc: '2.0',
    method: 'LMT_handle_jobs',
    params: {
        jobs: [],
        lang: { preference: { weight: {}, default: 'default' }, source_lang_computed: 'JA', target_lang: 'ZH' },
        priority: 1,
        commonJobParams: { browserType: 1, formality: null },
        timestamp: 1658461983751,
    },
    id: 50920016,
};

// module exports
module.exports = { splitText, handleJobs };
