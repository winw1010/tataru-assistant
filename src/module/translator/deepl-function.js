const splitText = {
  jsonrpc: '2.0',
  method: 'LMT_split_text',
  params: {
    texts: [],
    commonJobParams: { mode: 'translate', textType: 'plaintext' },
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
    commonJobParams: {
      quality: 'normal',
      regionalVariant: 'zh-Hans',
      mode: 'translate',
      browserType: 1,
      textType: 'plaintext',
    },
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

function getCookie() {
  return 'userCountry=TW; verifiedBot=false; dapUid=78d9df01-3f48-4da6-ade9-8ddcee5deb4d; releaseGroups=220.DF-1925.1.9_2455.DPAY-2828.2.2_3961.B2B-663.2.3_5030.B2B-444.2.7_8287.TC-1035.2.5_8393.DPAY-3431.2.2_8776.DM-1442.2.2_9824.AP-523.2.3_10382.DF-3962.1.2_10550.DWFA-884.2.2_11549.DM-1149.2.2_12498.DM-1867.2.3_12500.DF-3968.2.2_12645.DAL-1151.2.1_12687.TACO-153.2.2_12891.TACO-234.2.3_13132.DM-1798.2.2_13134.DF-3988.2.2_13135.DF-4076.2.2_13564.DF-4046.2.3_13870.DF-4078.2.2_13872.EXP-133.2.2_13913.TACO-235.2.2_14056.DF-4050.2.2_14097.DM-1916.2.2_14526.RI-246.2.7_14958.DF-4137.2.3_15325.DM-1418.2.7_15509.CEX-697.2.2_16021.DM-1471.2.2_16419.CEX-879.2.2_16420.CEX-736.2.2_16753.DF-4044.2.3_16754.DM-1769.1.2_17271.DF-4240.2.2_17272.WTT-1298.2.5_17685.DF-4246.2.2_17696.MTD-862.2.3_18115.DF-4260.2.2_18116.DF-4250.2.2_18131.DM-1931.2.2_18487.DF-4161.2.4_18488.DF-4244.2.2_18905.WDW-516.2.2_19666.DAL-1445.2.2_19672.DM-1959.2.3_20028.CEX-915.2.4_20040.B2B-1712.2.2_20042.DF-4302.2.3_20742.DF-4301.2.2_21296.DF-4320.2.2_21297.DM-1605.2.2_21298.WTT-1299.1.2_21301.B2B-1685.2.2_21302.EXP-282.2.1_21543.DF-4321.2.1_21554.DAL-1566.2.2_21556.DM-2121.2.1_21557.DM-1889.1.1_21588.AAEXP-19553.2.1_21589.AAEXP-19554.1.1_21590.AAEXP-19555.1.1_21591.AAEXP-19556.2.1_21592.AAEXP-19557.2.1_21593.AAEXP-19558.1.1_21594.AAEXP-19559.2.1_21595.AAEXP-19560.2.1_21596.AAEXP-19561.2.1_21597.AAEXP-19562.2.1_21598.AAEXP-19563.2.1_21599.AAEXP-19564.1.1_21600.AAEXP-19565.1.1_21601.AAEXP-19566.2.1_21602.AAEXP-19567.2.1_21603.AAEXP-19568.1.1_21604.AAEXP-19569.1.1_21605.AAEXP-19570.2.1_21606.AAEXP-19571.2.1_21607.AAEXP-19572.2.1_21608.AAEXP-19573.1.1_21609.AAEXP-19574.1.1_21610.AAEXP-19575.2.1_21611.AAEXP-19576.1.1_21612.AAEXP-19577.1.1_21613.AAEXP-19578.1.1_21614.AAEXP-19579.1.1_21615.AAEXP-19580.1.1_21616.AAEXP-19581.1.1_21617.AAEXP-19582.1.1_21618.AAEXP-19583.1.1_21619.AAEXP-19584.1.1_21620.AAEXP-19585.1.1_21621.AAEXP-19586.1.1_21622.AAEXP-19587.2.1_21623.AAEXP-19588.1.1_21624.AAEXP-19589.1.1_21625.AAEXP-19590.1.1_21626.AAEXP-19591.1.1_21627.AAEXP-19592.1.1_21628.AAEXP-19593.1.1_21629.AAEXP-19594.1.1_21630.AAEXP-19595.1.1_21631.AAEXP-19596.1.1_21632.AAEXP-19597.1.1_21633.AAEXP-19598.1.1_21634.AAEXP-19599.1.1_21635.AAEXP-19600.1.1_21636.AAEXP-19601.1.1_21637.AAEXP-19602.1.1_21638.AAEXP-19603.1.1_21639.AAEXP-19604.1.1_21640.AAEXP-19605.2.1_21641.AAEXP-19606.1.1_21642.AAEXP-19607.1.1_21643.AAEXP-19608.1.1_21644.AAEXP-19609.1.1_21645.AAEXP-19610.1.1_21646.AAEXP-19611.1.1_21647.AAEXP-19612.1.1_21648.AAEXP-19613.1.1_21649.AAEXP-19614.1.1_21650.AAEXP-19615.1.1_21828.CLAB-286.2.2_21830.B2B-1758.2.2; privacySettings=%7B%22v%22%3A2.1%2C%22t%22%3A1740621920416%2C%22m%22%3A%22LAX_AUTO%22%2C%22consent%22%3A%5B%22NECESSARY%22%2C%22PERFORMANCE%22%2C%22COMFORT%22%2C%22MARKETING%22%5D%7D; dapVn=1; LMTBID=v2|4703e1b2-bb16-4567-bd5d-83bedb79deba|c8c22884588790187364a437a1e55426; _ga=GA1.1.1044362514.1740621964; FPID=FPID2.2.eDhEaHk%2BoAO6NJU32G%2BXMzFNhsLc%2F59j%2FPqwWP4MErI%3D.1740621964; FPLC=IBgERZQGfZ7kUyna52t%2FujSRcXXO%2FcTIuiHWnWpKH1jt47%2Bi84RFcYRubtdxSydUL8%2FM8ceP9tYe3GgB7ylcEAH4zUxf72xuj0I8tak%2F9pc2%2FIsrYOOSIYbjUrDVpg%3D%3D; FPAU=1.2.1875217531.1740621961; _ga_66CXJP77N5=GS1.1.1740621963.1.1.1740621971.0.0.411348088; _uetsid=653a5030f4af11efa7ee89d3b5622e7d; _uetvid=653a3020f4af11ef81d3ebdfca788126; dapSid=%7B%22sid%22%3A%22def17afe-5782-44ed-b5e4-08d13f7dcefe%22%2C%22lastUpdate%22%3A1740621972%7D';
}

// module exports
module.exports = {
  getSplitText,
  getHandleJobs,
  generateJobs,
  generateTimestamp,
  fixMethod,
  getCookie,
};
