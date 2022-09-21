'use strict';

// electron
const { ipcRenderer } = require('electron');
ipcRenderer.on('change-ui-text', () => {
    changeUIText();
});

// element text list
const elementTextList = {
    img: {
        img_button_drag: ['拖曳', '拖曳'],
        img_button_config: ['設定', '设定'],
        img_button_capture: ['翻譯螢幕文字', '翻译萤幕文字'],
        img_button_through: ['點選穿透', '点选穿透'],
        img_button_update: ['下載最新版本', '下载最新版本'],
        img_button_close: ['關閉', '关闭'],
        img_button_minimize: ['縮小', '缩小'],

        img_button_auto_play: ['文字語音', '文字语音'],
        img_button_dictionary: ['翻譯查詢', '翻译查询'],
        img_button_read_log: ['讀取對話紀錄', '读取对话纪录'],
        img_button_clear: ['刪除全部文字', '删除全部文字'],
        img_button_backspace: ['刪除最後一句', '删除最后一句'],
    },
    button: {
        button_save: ['儲存變更', '储存变更'],
        button_default: ['恢復預設值', '恢复预设值'],

        button_download_json: ['下載翻譯對照表', '下载翻译对照表'],
        button_version_check: ['檢查程式更新', '检查程序更新'],
        button_google_credential: ['儲存Google憑證', '储存Google凭证'],
    },
    a: {
        a_get_credential: ['取得憑證', '取得凭证'],
        a_readme: ['使用說明書', '使用说明书'],
        a_bug_report: ['問題回報', '问题回报'],
        a_translation_report: ['回報翻譯錯誤', '回报翻译错误'],
        a_github: ['GitHub原始碼', 'GitHub原始码'],
        a_bahamut: ['訪問作者', '访问作者'],
        a_donate: ['贊助作者', '赞助作者'],
    },
    label: {
        button_radio_window: ['視窗', '视窗'],
        button_radio_font: ['文字', '文字'],
        button_radio_channel: ['頻道', '频道'],
        button_radio_translation: ['翻譯', '翻译'],
        button_radio_system: ['系統', '系统'],
        button_radio_about: ['關於', '关于'],

        checkbox_top: ['顯示在最上層', '显示在最上层'],
        checkbox_focusable: ['可被選取', '可被选取'],
        checkbox_hide_button: ['隱藏按鈕', '隐藏按钮'],
        checkbox_hide_dialog: ['秒後隱藏對話', '秒后隐藏对话'],
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
        select_from: ['遊戲語言', '游戏语言'],
        select_from_player: ['玩家頻道語言', '玩家频道语言'],
        select_to: ['翻譯語言', '翻译语言'],

        checkbox_auto_download_json: ['啟動時下載翻譯對照表', '启动时下载翻译对照表'],
        input_password_google_credential: ['Google憑證設定', 'Google凭证设定'],
        input_text_hsot: ['Node伺服器設定', 'Node服务器设定'],
    },
    option: {
        normal: ['細', '细'],
        bold: ['粗', '粗'],

        Youdao: ['有道翻譯', '有道翻译'],
        Baidu: ['百度翻譯', '百度翻译'],
        Caiyun: ['彩雲小譯', '彩云小译'],

        Japanese: ['日文', '日文'],
        English: ['英文', '英文'],
        'Traditional-Chinese': ['繁體中文', '繁体中文'],
        'Simplified-Chinese': ['簡體中文', '简体中文'],
    },
    span: {},
};

// element name list
const elementNameList = [
    ['img', 'id', 'title'],
    ['button', 'id', 'innerText'],
    ['a', 'id', 'innerText'],
    ['label', 'for', 'innerText'],
    ['option', 'value', 'innerText'],
];

// change UI text
function changeUIText() {
    try {
        const config = ipcRenderer.sendSync('get-config');
        const textIndex = config.translation.to === 'Simplified-Chinese' ? 1 : 0;

        for (let nameIndex = 0; nameIndex < elementNameList.length; nameIndex++) {
            const nameList = elementNameList[nameIndex];
            const elementList = document.getElementsByTagName(nameList[0]);

            for (let elementIndex = 0; elementIndex < elementList.length; elementIndex++) {
                const element = elementList[elementIndex];
                const elementText = elementTextList[nameList[0]][element.getAttribute(nameList[1])];

                if (elementText?.length > 0) {
                    element[nameList[2]] = elementText[textIndex];
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// module export
module.exports = {
    changeUIText,
};
