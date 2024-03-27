'use strict';
/* eslint-disable */

{
  // element text list
  const elementTextList = {
    img: {
      // index
      img_button_drag: ['拖曳', '拖曳', 'Drag'],
      img_button_config: ['設定', '设定', 'Config'],
      img_button_capture: ['翻譯螢幕文字', '翻译萤幕文字', 'Translate Screen Text'],
      img_button_through: ['滑鼠穿透', '鼠标穿透', 'Mouse Pass'],
      img_button_update: ['下載最新版本', '下载最新版本', 'Download Latest Version'],
      img_button_minimize: ['縮小', '缩小', 'Minimize'],
      img_button_close: ['關閉', '关闭', 'Close'],

      img_button_auto_play: ['文字語音', '文字语音', 'Text To Speech'],
      img_button_dictionary: ['翻譯查詢', '翻译查询', 'Translate'],
      img_button_read_log: ['讀取對話紀錄', '读取对话纪录', 'Read Chat Log'],
      img_button_clear: ['刪除全部對話', '删除全部对话', 'Delete All'],
      img_button_backspace: ['刪除最後一句', '删除最后一句', 'Delete Last'],
    },
    button: {
      // config
      button_save_config: ['儲存', '储存', 'Save'],
      button_save_default_config: ['恢復預設', '恢复预设', 'Set Default'],

      button_download_json: ['重新下載翻譯對照表', '重新下载翻译对照表', 'Download Table'],
      button_restart_sharlayan_reader: ['重新啟動字幕讀取器', '重新启动字幕读取器', 'Restart Chat Reader'],
      button_version_check: ['檢查更新', '检查更新', 'Check For Updates'],
      button_google_credential: ['開啟Google憑證檔案', '开启Google凭证档案', 'Open Google Credential File'],

      // capture
      button_screenshot: ['All', 'All', 'All'],

      // capture edit
      button_translate: ['翻譯', '翻译', 'Translate'],

      // dictionary
      button_switch: ['切換', '切换', 'Exchange'],

      // edit
      button_restart_translate: ['重新翻譯', '重新翻译', 'Translate Again'],
      button_read_json: ['重新讀取對照表', '重新读取对照表', 'Reload Table'],
      button_report_translation: ['回報翻譯錯誤', '回报翻译错误', 'Report'],

      button_save_temp: ['儲存', '储存', 'Save'],
      button_delete_temp: ['刪除', '删除', 'Delete'],
      button_view_temp: ['檢視自訂翻譯檔案', '检视自订翻译档案', 'View Custom Table'],

      // read log
      button_read_log: ['讀取', '读取', 'Open'],
      button_view_log: ['檢視對話紀錄檔案', '检视对话纪录档案', 'View Chat Logs'],
    },
    a: {
      // config
      a_get_credential: ['憑證取得教學', '凭证取得教程', 'Get Credential'],
      a_get_gpt_api_key: ['API KEY取得教學', 'API KEY取得教程', 'Get API KEY'],
      a_readme: ['使用說明書', '使用说明书', 'Readme'],
      a_bug_report: ['問題回報', '问题回报', 'Bug Report'],
      a_translation_report: ['回報翻譯錯誤', '回报翻译错误', 'Translation Report'],
      a_github: ['GitHub', 'GitHub', 'GitHub'],
      a_author: ['訪問作者', '访问作者', 'Author'],
      a_donate: ['贊助作者', '赞助作者', 'Donate'],
    },
    label: {
      // config
      checkbox_top: ['顯示在最上層', '显示在最上层', 'Always on Top'],
      checkbox_focusable: ['可被選取', '可被选取', 'Selectable'],
      checkbox_shortcut: ['啟用快捷鍵', '启用快捷键', 'Shortcut'],
      checkbox_min_size: ['最小尺寸限制', '最小尺寸限制', 'Minimum Size'],
      checkbox_hide_button: ['自動隱藏按鈕', '自动隐藏按钮', 'Hide Buttons'],
      checkbox_hide_dialog: ['自動隱藏視窗', '自动隐藏视窗', 'Hide Window'],
      input_hide_dialog: ['隱藏間隔(秒)', '隐藏间隔(秒)', 'Hide Window After(sec)'],
      color_background_color: ['背景顏色', '背景颜色', 'Color'],
      range_background_transparency: ['背景透明度', '背景透明度', 'Transparency'],

      select_font_weight: ['文字粗細', '文字粗细', 'Font Weight'],
      input_font_size: ['文字大小(rem)', '文字大小(rem)', 'Font Size(rem)'],
      input_dialog_spacing: ['對話框間隔(rem)', '对话框间隔(rem)', 'Spacing(rem)'],
      input_dialog_radius: ['對話框圓角(rem)', '对话框圆角(rem)', 'Radius(rem)'],
      color_dialog_color: ['對話框顏色', '对话框颜色', 'Color'],
      range_dialog_transparency: ['對話框透明度', '对话框透明度', 'Transparency'],

      checkbox_auto_change: ['翻譯失敗時切換翻譯引擎', '翻译失败时切换翻译引擎', 'Change Engine When Failed'],
      checkbox_text_fix: ['使用Tataru翻譯', '使用Tataru翻译', 'Use Tataru'],
      checkbox_skip_system: ['忽略常見系統訊息', '忽略常见系统讯息', 'Ignore System Message'],
      checkbox_skip_chinese: ['忽略漢化字幕', '忽略汉化字幕', 'Ignore Chinese Text'],
      select_engine: ['翻譯引擎', '翻译引擎', 'Engine'],
      select_from: ['遊戲語言', '游戏语言', 'Game Language'],
      select_from_player: ['玩家頻道', '玩家频道', 'Player Language'],
      select_to: ['翻譯語言', '翻译语言', 'Target Language'],

      'select-app-language': ['語言', '语言', 'Language'],
      checkbox_auto_download_json: ['啟動時下載翻譯對照表', '启动时下载翻译对照表', 'Download Table at Start'],

      // capture
      checkbox_split: ['換行切割', '换行切割', 'New Line'],
      checkbox_edit: ['編輯擷取文字', '编辑撷取文字', 'Edit Detected Text'],

      // edit
      checkbox_replace: ['取代原本翻譯', '取代原本翻译', 'Replace'],
      textarea_before: ['原文', '原文', 'Before'],
      textarea_after: ['取代為', '取代为', 'After'],
      select_type: ['類別', '类别', 'type'],

      // read log
      select_log: ['選擇對話紀錄', '选择对话纪录', 'Chat Log'],
    },
    option: {
      // config
      div_window: ['視窗設定', '视窗设定', 'Window'],
      div_font: ['文字設定', '文字设定', 'Font'],
      div_channel: ['頻道設定', '频道设定', 'Channel'],
      div_translation: ['翻譯設定', '翻译设定', 'Translate'],
      div_api: ['API設定', 'API设定', 'API'],
      div_system: ['系統設定', '系统设定', 'System'],
      div_about: ['關於', '关于', 'About'],

      normal: ['細', '细', 'Normal'],
      bold: ['粗', '粗', 'Bold'],

      Youdao: ['有道翻譯', '有道翻译', 'Youdao'],
      Baidu: ['百度翻譯', '百度翻译', 'Baidu'],
      Caiyun: ['彩雲小譯', '彩云小译', 'Caiyun'],

      Japanese: ['日文', '日文', 'Japanese'],
      English: ['英文', '英文', 'English'],
      'Traditional-Chinese': ['繁體中文', '繁体中文', 'Traditional Chinese'],
      'Simplified-Chinese': ['簡體中文', '简体中文', 'Simplified Chinese'],

      // edit
      player: ['玩家名稱', '玩家名称', 'Player'],
      retainer: ['雇員名稱', '雇员名称', 'Retainer'],
      npc: ['NPC名稱', 'NPC名称', 'NPC'],
      title: ['稱呼', '称呼', 'Title'],
      group: ['組織', '组织', 'Group'],
      monster: ['魔物', '魔物', 'Monster'],
      things: ['事物', '事物', 'Things'],
      skill: ['技能', '技能', 'Skill'],
      map: ['地名', '地名', 'Map'],
      other: ['其他', '其他', 'Other'],
      overwrite: ['整句替換', '整句替换', 'Overwrite'],
      jp: ['日文替換', '日文替换', 'JP Replace'],

      // read log
      none: ['無', '无', 'None'],
    },
    p: {
      'p-google-vision': ['Google Vision設定', 'Google Vision设定', 'Google Vision'],
      'p-chat-gpt': ['ChatGPT設定', 'ChatGPT设定', 'ChatGPT'],
    },
    span: {
      // window title
      span_capture_edit: ['編輯擷取文字', '编辑撷取文字', 'Edit Detected Text'],
      span_config: ['設定', '设定', 'Config'],
      span_dictionary: ['翻譯查詢', '翻译查询', 'Translate'],
      span_edit: ['重新翻譯', '重新翻译', 'Translate Again'],
      span_read_log: ['讀取對話紀錄', '读取对话纪录', 'View Chat Logs'],

      // config
      span_channel_comment: ['使用滑鼠滾輪滾動頻道清單', '使用鼠标滚轮滚动频道清单', 'Use Mouse To Sroll The Page'],
      span_author: [
        '作者: 夜雪 (巴哈姆特電玩資訊站 winw1010)',
        '作者: 夜雪 (巴哈姆特电玩资讯站 winw1010)',
        'Author: winw1010',
      ],

      // edit
      span_flex_right_title: ['自訂翻譯', '自订翻译', 'Custom Table'],
    },
    input: {
      'input-gpt-api-key': ['請輸入API KEY', '请输入API KEY', 'API KEY'],
    },
    textarea: {
      // dictionary
      textarea_original_text: ['輸入要翻譯的文字', '输入要翻译的文字', 'Input Your Text Here'],

      // edit
      textarea_before: ['原文', '原文', 'Before'],
      textarea_after: ['取代為', '取代为', 'After'],
    },
  };

  // element name list
  const elementNameList = [
    ['img', 'id', 'title'],
    ['button', 'id', 'innerText'],
    ['a', 'id', 'innerText'],
    ['label', 'for', 'innerText'],
    ['option', 'value', 'innerText'],
    ['p', 'id', 'innerText'],
    ['span', 'id', 'innerText'],
    ['input', 'id', 'placeholder'],
    ['textarea', 'id', 'placeholder'],
    ['div', 'id', 'title'],
  ];

  // change UI text
  document.addEventListener('change-ui-text', (e) => {
    const config = e.detail;
    setLanguageText(config.system.appLanguage);
  });

  function setLanguageText(language) {
    const textIndex = getTextIndex(language);
    for (let nameIndex = 0; nameIndex < elementNameList.length; nameIndex++) {
      const nameList = elementNameList[nameIndex];
      const elementList = document.getElementsByTagName(nameList[0]);

      if (elementList.length > 0) {
        for (let elementIndex = 0; elementIndex < elementList.length; elementIndex++) {
          try {
            const element = elementList.item(elementIndex);
            const elementText = elementTextList[nameList[0]][element.getAttribute(nameList[1])];
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
        return 2;
    }
  }
}
