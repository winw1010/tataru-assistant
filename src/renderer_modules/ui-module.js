'use strict';

// electron
const { ipcRenderer } = require('electron');

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
        button_download_json: ['下載翻譯對照表', '下载翻译对照表'],
        button_version_check: ['檢查程式更新', '检查程序更新'],
        button_google_credential: ['儲存Google憑證', '储存Google凭证'],
        button_save: ['儲存變更', '储存变更'],
        button_default: ['恢復預設值', '恢复预设值'],
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

    label: {},
    span: {},
    p: {},
};

// element name list
const elementNameList = [
    ['img', 'title'],
    ['button', 'innerText'],
    ['a', 'innerText'],
];

// change UI text
function changeUIText() {
    const config = ipcRenderer.sendSync('get-config');
    const textIndex = config.translation.to === 'Simplified-Chinese' ? 1 : 0;

    for (let nameIndex = 0; nameIndex < elementNameList.length; nameIndex++) {
        const nameList = elementNameList[nameIndex];
        const elementList = document.getElementsByTagName(nameList[0]);

        for (let elementIndex = 0; elementIndex < elementList.length; elementIndex++) {
            const element = elementList[elementIndex];
            const elementText = elementTextList[nameList[0]][element.id];

            if (elementText) {
                element[nameList[1]] = elementText[textIndex];
            }
        }
    }
}

// module export
module.exports = {
    changeUIText,
};
