'use strict';
/* eslint-disable */

{
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
      img_button_clear: ['刪除全部對話', '删除全部对话'],
      img_button_backspace: ['刪除最後一句', '删除最后一句'],
    },
    button: {
      // config
      button_save_config: ['儲存設定', '储存设定'],
      button_save_default_config: ['恢復預設值', '恢复预设值'],

      button_download_json: ['下載翻譯對照表', '下载翻译对照表'],
      button_version_check: ['檢查更新', '检查更新'],
      button_google_credential: ['設定Google憑證', '设定Google凭证'],

      // capture
      button_screenshot: ['全螢幕擷取', '全萤幕撷取'],

      // capture edit
      button_translate: ['翻譯', '翻译'],

      // dictionary
      button_exchange: ['切換', '切换'],

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
      a_get_credential: ['憑證取得教學', '凭证取得教程'],
      a_readme: ['使用說明書', '使用说明书'],
      a_bug_report: ['問題回報', '问题回报'],
      a_translation_report: ['回報翻譯錯誤', '回报翻译错误'],
      a_github: ['GitHub', 'GitHub'],
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
      checkbox_min_size: ['最小尺寸限制', '最小尺寸限制'],
      checkbox_hide_button: ['自動隱藏按鈕', '自动隐藏按钮'],
      checkbox_hide_dialog: ['自動隱藏視窗', '自动隐藏视窗'],
      input_hide_dialog: ['秒後隱藏視窗', '秒后隐藏视窗'],
      color_background_color: ['背景顏色', '背景颜色'],
      range_background_transparency: ['背景透明度', '背景透明度'],

      select_font_weight: ['文字粗細', '文字粗细'],
      input_font_size: ['文字大小', '文字大小'],
      input_dialog_spacing: ['對話框間隔', '对话框间隔'],
      input_dialog_radius: ['對話框圓角', '对话框圆角'],
      color_dialog_color: ['對話框顏色', '对话框颜色'],
      range_dialog_transparency: ['對話框透明度', '对话框透明度'],

      checkbox_auto_change: [
        '翻譯失敗時切換翻譯引擎',
        '翻译失败时切换翻译引擎',
      ],
      checkbox_text_fix: ['名詞校正', '名词校正'],
      checkbox_skip_system: ['忽略常見系統訊息', '忽略常见系统讯息'],
      checkbox_skip_chinese: ['忽略漢化字幕', '忽略汉化字幕'],
      select_engine: ['翻譯引擎', '翻译引擎'],
      select_from: ['遊戲語言', '游戏语言'],
      select_from_player: ['玩家頻道', '玩家频道'],
      select_to: ['翻譯語言', '翻译语言'],

      checkbox_auto_download_json: [
        '啟動時下載翻譯對照表',
        '启动时下载翻译对照表',
      ],

      // capture
      checkbox_split: ['換行切割', '换行切割'],
      checkbox_edit: ['編輯擷取文字', '编辑撷取文字'],

      // edit
      checkbox_replace: ['取代原本翻譯', '取代原本翻译'],
      textarea_before: ['原文', '原文'],
      textarea_after: ['取代為', '取代为'],
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
      player: ['玩家名稱', '玩家名称'],
      retainer: ['雇員名稱', '雇员名称'],
      npc: ['NPC名稱', 'NPC名称'],
      title: ['稱呼', '称呼'],
      group: ['組織', '组织'],
      monster: ['魔物', '魔物'],
      things: ['事物', '事物'],
      skill: ['技能', '技能'],
      map: ['地名', '地名'],
      other: ['其他', '其他'],
      overwrite: ['整句替換', '整句替换'],
      jp: ['日文替換', '日文替换'],

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
      span_channel_comment: [
        '使用滑鼠滾輪檢視頻道清單',
        '使用鼠标滚轮检视频道清单',
      ],
      span_author: [
        '作者: 夜雪 (巴哈姆特電玩資訊站 winw1010)',
        '作者: 夜雪 (巴哈姆特电玩资讯站 winw1010)',
      ],

      // edit
      span_flex_right_title: ['自訂翻譯', '自订翻译'],
    },
    textarea: {
      // dictionary
      textarea_original_text: ['輸入要翻譯的文字', '输入要翻译的文字'],

      // edit
      textarea_before: ['原文', '原文'],
      textarea_after: ['取代為', '取代为'],
    },
    div: {
      // config
      div_google_credential: [
        '設定Google憑證，不使用Google Vision辨識功能則無需設定',
        '设定Google凭证，不使用Google Vision辨识功能则无需设定',
      ],
    },
  };

  // element name list
  const elementNameList = [
    ['img', 'id', 'title'],
    ['button', 'id', 'innerText'],
    ['a', 'id', 'innerText'],
    ['label', 'for', 'innerText'],
    ['option', 'value', 'innerText'],
    ['span', 'id', 'innerText'],
    ['input', 'id', 'placeholder'],
    ['textarea', 'id', 'placeholder'],
    ['div', 'id', 'title'],
  ];

  // change UI text
  document.addEventListener('change-ui-text', (e) => {
    const config = e.detail;
    setLanguageText(config.translation.to);
  });

  function setLanguageText(language) {
    const textIndex = getTextIndex(language);
    for (let nameIndex = 0; nameIndex < elementNameList.length; nameIndex++) {
      const nameList = elementNameList[nameIndex];
      const elementList = document.getElementsByTagName(nameList[0]);

      if (elementList.length > 0) {
        for (
          let elementIndex = 0;
          elementIndex < elementList.length;
          elementIndex++
        ) {
          try {
            const element = elementList.item(elementIndex);
            const elementText =
              elementTextList[nameList[0]][element.getAttribute(nameList[1])];
            if (elementText.length > 0) {
              element[nameList[2]] = elementText[textIndex];
            }
          } catch (error) {}
        }
      }
    }
  }

  // get text index
  function getTextIndex(language) {
    switch (language) {
      case 'Traditional-Chinese':
        return 0;

      case 'Simplified-Chinese':
        return 1;

      default:
        return 0;
    }
  }
}
