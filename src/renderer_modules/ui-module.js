'use strict';
/* eslint-disable */

onDocumentReady(() => {
    // element text list
    const elementTextList = {
        img: {
            // index
            img_button_drag: ['拖曳', '拖曳'],
            img_button_config: ['設定', '设定'],
            img_button_capture: ['翻譯螢幕文字', '翻译萤幕文字'],
            img_button_through: ['滑鼠穿透', '鼠标穿透'],
            img_button_update: ['下載最新版本', '下载最新版本'],
            img_button_minimize: ['縮小', '缩小'],
            img_button_close: ['關閉', '关闭'],

            img_button_auto_play: ['文字語音', '文字语音'],
            img_button_dictionary: ['翻譯查詢', '翻译查询'],
            img_button_read_log: ['讀取對話紀錄', '读取对话纪录'],
            img_button_clear: ['刪除全部文字', '删除全部文字'],
            img_button_backspace: ['刪除最後一句', '删除最后一句'],
        },
        button: {
            // config
            button_save_config: ['儲存設定', '储存设定'],
            button_save_default_config: ['恢復預設值', '恢复预设值'],

            button_download_json: ['下載翻譯對照表', '下载翻译对照表'],
            button_version_check: ['檢查更新', '检查更新'],
            button_google_credential: ['儲存Google憑證', '储存Google凭证'],

            // capture
            button_screenshot: ['全螢幕擷取', '全萤幕撷取'],

            // capture edit
            button_translate: ['翻譯', '翻译'],

            // dictionary
            button_exchange: ['語言互換', '语言互换'],

            // edit
            button_restart_translate: ['重新翻譯', '重新翻译'],
            button_read_json: ['重新讀取對照表', '重新读取对照表'],
            button_report_translation: ['回報翻譯錯誤', '回报翻译错误'],

            button_save_temp: ['儲存', '储存'],
            button_delete_temp: ['刪除', '删除'],
            button_view_temp: ['檢視自訂翻譯檔案', '检视自订翻译档案'],

            // read log
            button_read_log: ['讀取', '读取'],
            button_view_log: ['檢視對話紀錄檔案', '检视对话纪录档案'],
        },
        a: {
            // config
            a_get_credential: ['取得憑證', '取得凭证'],
            a_readme: ['使用說明書', '使用说明书'],
            a_bug_report: ['問題回報', '问题回报'],
            a_translation_report: ['回報翻譯錯誤', '回报翻译错误'],
            a_github: ['GitHub原始碼', 'GitHub原始码'],
            a_bahamut: ['訪問作者', '访问作者'],
            a_donate: ['贊助作者', '赞助作者'],
        },
        label: {
            // config
            button_radio_window: ['視窗', '视窗'],
            button_radio_font: ['文字', '文字'],
            button_radio_channel: ['頻道', '频道'],
            button_radio_translation: ['翻譯', '翻译'],
            button_radio_system: ['系統', '系统'],
            button_radio_about: ['關於', '关于'],

            checkbox_top: ['顯示在最上層', '显示在最上层'],
            checkbox_focusable: ['可被選取', '可被选取'],
            checkbox_shortcut: ['啟用快捷鍵', '启用快捷键'],
            checkbox_hide_button: ['自動隱藏按鈕', '自动隐藏按钮'],
            checkbox_hide_dialog: ['秒後隱藏視窗', '秒后隐藏视窗'],
            color_background_color: ['背景顏色', '背景颜色'],
            range_background_transparency: ['背景透明度', '背景透明度'],

            select_font_weight: ['文字粗細', '文字粗细'],
            input_font_size: ['文字大小', '文字大小'],
            input_dialog_spacing: ['對話框間隔', '对话框间隔'],
            input_dialog_radius: ['對話框圓角', '对话框圆角'],
            color_dialog_color: ['對話框顏色', '对话框颜色'],
            range_dialog_transparency: ['對話框透明度', '对话框透明度'],

            checkbox_auto_change: ['翻譯失敗時切換翻譯引擎', '翻译失败时切换翻译引擎'],
            checkbox_text_fix: ['FFXIV詞彙校正', 'FFXIV词汇校正'],
            checkbox_skip_system: ['忽略常見系統訊息', '忽略常见系统讯息'],
            checkbox_skip_chinese: ['忽略漢化字幕', '忽略汉化字幕'],
            select_engine: ['翻譯引擎', '翻译引擎'],
            select_from: ['FFXIV語言', 'FFXIV语言'],
            select_from_player: ['玩家頻道語言', '玩家频道语言'],
            select_to: ['翻譯語言', '翻译语言'],

            checkbox_auto_download_json: ['啟動時下載翻譯對照表', '启动时下载翻译对照表'],
            input_password_google_credential: ['Google憑證設定', 'Google凭证设定'],
            input_text_hsot: ['Tataru Helper Node伺服器設定', 'Tataru Helper Node服务器设定'],

            // capture
            checkbox_split: ['換行切割', '换行切割'],
            checkbox_edit: ['編輯擷取文字', '编辑撷取文字'],

            // edit
            checkbox_replace: ['取代原本翻譯', '取代原本翻译'],
            textarea_before: ['替換前(原文)', '替换前(原文)'],
            textarea_after: ['替換後(自訂翻譯)', '替换后(自订翻译)'],
            select_type: ['類別', '类别'],

            // read log
            select_log: ['選擇對話紀錄', '选择对话纪录'],
        },
        option: {
            // config
            normal: ['細', '细'],
            bold: ['粗', '粗'],

            Youdao: ['有道翻譯', '有道翻译'],
            Baidu: ['百度翻譯', '百度翻译'],
            Caiyun: ['彩雲小譯', '彩云小译'],

            Japanese: ['日文', '日文'],
            English: ['英文', '英文'],
            'Traditional-Chinese': ['繁體中文', '繁体中文'],
            'Simplified-Chinese': ['簡體中文', '简体中文'],

            // edit
            player: ['玩家名稱 (原文 --> 中文)', '玩家名称 (原文 --> 中文)'],
            retainer: ['雇員名稱 (原文 --> 中文)', '雇员名称 (原文 --> 中文)'],
            npc: ['NPC名稱 (原文 --> 中文)', 'NPC名称 (原文 --> 中文)'],
            title: ['稱呼 (原文 --> 中文)', '称呼 (原文 --> 中文)'],
            group: ['組織 (原文 --> 中文)', '组织 (原文 --> 中文)'],
            monster: ['魔物 (原文 --> 中文)', '魔物 (原文 --> 中文)'],
            things: ['事物 (原文 --> 中文)', '事物 (原文 --> 中文)'],
            skill: ['技能 (原文 --> 中文)', '技能 (原文 --> 中文)'],
            map: ['地區 (原文 --> 中文)', '地区 (原文 --> 中文)'],
            other: ['其他 (原文 --> 中文)', '其他 (原文 --> 中文)'],
            overwrite: ['整句替換 (整句原文 --> 整句中文)', '整句替换 (整句原文 --> 整句中文)'],
            jp: ['日文替換 (日文 --> 日文)', '日文替换 (日文 --> 日文)'],

            // read log
            none: ['無', '无'],
        },
        span: {
            // window title
            span_capture_edit: ['編輯擷取文字', '编辑撷取文字'],
            span_config: ['設定', '设定'],
            span_dictionary: ['翻譯查詢', '翻译查询'],
            span_edit: ['重新翻譯', '重新翻译'],
            span_read_log: ['讀取對話紀錄', '读取对话纪录'],

            // config
            span_channel_comment: ['使用滑鼠滾輪檢視頻道清單', '使用鼠标滚轮检视频道清单'],
            span_about: [
                '感謝您使用Tataru Helper Node，請注意本程式需與壓縮檔裡的Tataru Helper一起使用才有自動翻譯功能',
                '感谢您使用Tataru Helper Node，请注意本程序需与压缩档里的Tataru Helper一起使用才有自动翻译功能',
            ],
            span_author: ['作者: 夜雪 (巴哈姆特電玩資訊站 winw1010)', '作者: 夜雪 (巴哈姆特电玩资讯站 winw1010)'],

            // edit
            span_flex_right_title: ['新增自訂翻譯', '新增自订翻译'],
        },
        input: {
            // config
            input_password_google_credential: ['請輸入Google憑證', '请输入Google凭证'],
        },
        textarea: {
            // dictionary
            textarea_original_text: ['請輸入你要翻譯的文字', '请输入你要翻译的文字'],

            // edit
            textarea_before: ['替換前', '替换前'],
            textarea_after: ['替換後', '替换后'],
        },
        div: {
            // config
            div_google_credential: [
                '設定Google憑證，如不使用Google Vision圖形文字辨識功能則不用填',
                '设定Google凭证，如不使用Google Vision图形文字辨识功能则不用填',
            ],
            div_server: [
                '更改Tataru Heler的伺服器設定，如非必要請維持預設',
                '更改Tataru Heler的服务器设定，如非必要请维持预设',
            ],
        },
    };

    // element name list
    const elementNameList = [
        ['img', 'img', 'id', 'title'],
        ['button', 'button', 'id', 'innerText'],
        ['a', 'a', 'id', 'innerText'],
        ['label', 'label', 'for', 'innerText'],
        ['option', 'option', 'value', 'innerText'],
        ['span', 'span', 'id', 'innerText'],
        ['input', 'input', 'id', 'placeholder'],
        ['textarea', 'textarea', 'id', 'placeholder'],
        ['div', 'div', 'id', 'title'],
    ];

    // change UI text
    document.addEventListener('change-ui-text', () => {
        try {
            const config = ipcRendererSendSync('get-config');
            const textIndex = getTextIndex(config.translation.to);

            for (let nameIndex = 0; nameIndex < elementNameList.length; nameIndex++) {
                const nameList = elementNameList[nameIndex];
                const elementList = document.getElementsByTagName(nameList[0]);

                for (let elementIndex = 0; elementIndex < elementList.length; elementIndex++) {
                    const element = elementList[elementIndex];
                    const elementText = elementTextList[nameList[1]][element.getAttribute(nameList[2])];

                    if (elementText?.length > 0) {
                        element[nameList[3]] = elementText[textIndex];
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    // get text index
    function getTextIndex(translateTo) {
        switch (translateTo) {
            case 'Traditional-Chinese':
                return 0;

            case 'Simplified-Chinese':
                return 1;

            default:
                return 0;
        }
    }

    // auto run
    document.dispatchEvent(new CustomEvent('change-ui-text'));
});
