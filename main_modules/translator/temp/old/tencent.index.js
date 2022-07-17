var languageList = {
    "auto": "自动识别",
    "zh": "中文",
    "en": "英语",
    "jp": "日语",
    "kr": "韩语",
    "fr": "法语",
    "es": "西班牙语",
    "it": "意大利语",
    "de": "德语",
    "tr": "土耳其语",
    "ru": "俄语",
    "pt": "葡萄牙语",
    "vi": "越南语",
    "id": "印尼语",
    "th": "泰语",
    "ms": "马来西亚语",
    "ar": "阿拉伯语",
    "hi": "印地语"
};

var translateText = function (option) {
    var opt = {
        type: 'input' //
    };
    _.extend(opt, option);

    //todo : 获取原文
    var sourceText = $$textpanelModule.getSourceText();
    //todo : 获取语种
    var languageMap = $$languageModule.getLanguage();
    // $$log.log('languageMap: ', languageMap);
    //todo : 翻译
    // console.log('原文： ', sourceText, '\n 语种: ', languageMap);

    var ticket = $$tools.getCookie(ticketName);
    var randstr = $$tools.getCookie(randstrName);

    var postData = {
        source: languageMap.source,
        target: languageMap.target,
        sourceText: sourceText,
        qtv: qtv || '',
        qtk: qtk || '',
        ticket: ticket || '',
        randstr: randstr || '',
    };

    if (languageMap.autoSource) {
        postData.source = 'auto';
    }

    if ($.trim(postData.sourceText) === '') {
        $$dictModule.hide();
        $$footModule.updatePosition();

        // 如果清空文本，并且语种是自动，应设置为自动
        if (languageMap.autoSource) {
            $$languageModule.setSourceLanguage('auto', true);
        }

        return;
    }

    latestTranslateUuid = 'translate_uuid' + new Date().getTime()
    postData.sessionUuid = latestTranslateUuid;
    // $$log.alertIE('/api/translate----start');
    // $$log.log('/api/translate', postData);
    const uc = GES();
    $$dataReporter.beaconBaseReport('translate', 'translate', {
        target: postData.target,
        source: postData.source,
        sourceTextLength: ('' + sourceText.length)
    });

    $$http.post('/api/translate', postData, function (res, headers) {
        const HFObj = { f: '', ts: '' };
        headers.split(/\r\n/).forEach(n => {
            const [key, val] = n.split(/\s*:\s*/);
            if (key in HFObj) {
                HFObj[key] = val;
            }
        });
        if (HFObj.f && HFObj.ts) {
            HF(HFObj.f, HFObj.ts)
        }

        //验证码鉴权
        if (res.errCode === -111) {
            $$headModule.captcha();
        }

        if (res.errCode != 0) {
            $$uther.postApi('translate', {
                "code": 2, // 翻译报错，
                "req": JSON.stringify(postData)
            });
            return;
        }
        if (res.sessionUuid != latestTranslateUuid) {
            return;
        }

        // 翻译相关
        // $$log.log('/api/translate ------ res: ', res);
        // $$log.alertIE('/api/translate----return');
        if (res.translate && res.translate.errCode == 0) {
            $$uther.postApi('translate', {
                "code": 0
            });

            // 通知更新 - ，语言栏 语言
            $$languageModule.setSourceLanguage(res.translate.source, (postData.source == 'auto'));
            $$languageModule.setTargetLanguage(res.translate.target);

            // 通知更新 - ，面板局部语言
            $$textpanelModule.setLanguage(res.translate);

            // 通知更新 - ，面板翻译结果
            $$textpanelModule.setTranslateResult(res.translate);
            if (res.translate.records && res.translate.records.length === 1 && res.translate.records[0].targetText === '') {
                $$uther.postApi('translate', {
                    "code": 3, // 单词返回为空
                    "req": JSON.stringify(postData)
                });
            }

        } else {
            // 翻译错误
            $$textpanelModule.setTranslateError();
            $$uther.postApi('translate', {
                "code": 2, // 翻译报错，
                "req": JSON.stringify(postData)
            });
        }

        // 拼写 联想 相关
        if (opt.type != 'suggest' && opt.type != 'search' && opt.type != 'btn' && opt.type != 'changelanguage' && res.suggest && res.suggest.errCode == 0) {
            // 通知更新 - ，面板拼写列表
            res.suggest.talk = sourceText;
            $$textpanelModule.setSuggestList(res.suggest);
        }

        // 词典相关
        if (res.dict && res.dict.errCode == 0 && (res.translate.source == 'en' || res.translate.target == 'en')) {
            $$dictModule.setHash(res.dict);
            $$history.push(res); // 记录qb侧栏翻译历史
            $$footModule.updatePosition();
        } else {
            $$dictModule.hide();
            $$footModule.updatePosition();
        }

        // 上报逻辑 by daringuo
        (function () {
            try {
                var _lanObj = $$languageModule.getLanguage();
                var type1 = '';
                var type2 = '';
                if (!res || !res.dict || !res.dict.type) {
                    return;
                }
                if (res && res.dict && res.dict.type === 'dict') {
                    // 单词模式
                    type2 = 'word';
                } else {
                    // 句子模式
                    type2 = 'sentence';
                }

                // 翻译单词的puv
                if (_lanObj.source === 'en' && _lanObj.target === 'zh') {
                    // 英译中
                    type1 = 'e2c';
                } else if (_lanObj.source === 'zh' && _lanObj.target === 'en') {
                    // 中译英
                    type1 = 'c2e';
                } else {
                    // 其他
                    type1 = 'other';
                }
                $$dataReporter.tcss('translate.' + type1 + '.' + type2);
            } catch (e) {
                console && console.error && console.error(e);
            }
        }());

    }, function (xhr) {
        $$textpanelModule.setTranslateError();
        $$uther.postApi('translate', {
            "code": 1, // 服务端报错，
            "req": JSON.stringify(postData),
            "res": JSON.stringify(xhr)
        });
    }, { uc });

    //todo : 下发 callback
};