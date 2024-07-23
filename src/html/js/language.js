'use strict';

// on change UI text
document.addEventListener('change-ui-text', (e) => {
  const config = e.detail;
  setText(config.system.appLanguage);
});

// set text
function setText(language) {
  // get element text list
  const elementTextList = getElementTextList();
  const propertyNames = Object.getOwnPropertyNames(elementTextList);

  // get text index
  const textIndex = getTextIndex(language);

  // set title
  // const title = document.getElementsByTagName('title').item(0);
  // if (title) title.innerText = 'Tataru Assistant';

  // set UI text
  // loop of property names
  for (let index = 0; index < propertyNames.length; index++) {
    const propertyName = propertyNames[index];
    const elementNames = Object.getOwnPropertyNames(elementTextList[propertyName]);

    // loop of element names
    for (let index = 0; index < elementNames.length; index++) {
      const elementName = elementNames[index];
      const elements = document.getElementsByTagName(elementName);

      // loop of elements
      for (let index = 0; index < elements.length; index++) {
        const element = elements.item(index);

        if (!element) continue;

        let elementId = element.id;

        switch (elementName) {
          case 'label':
            elementId = element.getAttribute('for') || '';
            break;

          case 'option':
            elementId = element.value || '';
            break;

          default:
            break;
        }

        try {
          // set text
          element[propertyName] = elementTextList[propertyName][elementName][elementId][textIndex];
        } catch (error) {
          //console.log(error);
        }
      }
    }
  }
}

// get text index
function getTextIndex(language) {
  let index = 0;

  switch (language) {
    case 'Traditional-Chinese':
      index = 0;
      break;

    case 'Simplified-Chinese':
      index = 1;
      break;

    default:
      index = 2;
      break;
  }

  return index;
}

// element text list
function getElementTextList() {
  return {
    innerText: {
      a: {
        // config
        'a-set-google-vision': ['說明', '说明', 'Guide'],
        'a-set-gemini-api': ['說明', '说明', 'Guide'],
        'a-set-cohere-api': ['說明', '说明', 'Guide'],
        'a-set-kimi-api': ['說明', '说明', 'Guide'],
        'a-set-gpt-api': ['說明', '说明', 'Guide'],
        'a-set-llm-api': ['說明', '说明', 'Guide'],

        'a-readme': ['使用說明書', '使用说明书', 'Readme'],
        'a-bug-report': ['問題回報', '问题回报', 'Bug report'],
        'a-view-response': ['查看回報表單', '查看回报表单', 'View response'],
        'a-translation-report': ['回報翻譯錯誤', '回报翻译错误', 'Translation report'],
        'a-github': ['GitHub', 'GitHub', 'GitHub'],
        'a-author': ['訪問作者', '访问作者', 'Author'],
      },
      button: {
        // config
        'button-save-config': ['儲存變更', '储存变更', 'Save'],
        'button-save-default-config': ['預設', '预设', 'Default'],

        'button-google-credential': ['開啟Google憑證檔案', '开启Google凭证档案', 'Open Google credential file'],

        'button-download-json': ['重新下載翻譯對照表', '重新下载翻译对照表', 'Download table'],
        'button-delete-temp': ['清除暫存', '清除暂存', 'Clear temp file'],
        'button-restart-sharlayan-reader': ['重新啟動字幕讀取器', '重新启动字幕读取器', 'Restart chat reader'],
        'button-fix-reader': ['修復字幕讀取器', '修復字幕读取器', 'Fix chat reader'],
        'button-version-check': ['檢查更新', '检查更新', 'Check for updates'],

        // capture
        'button-screenshot': ['All', 'All', 'All'],

        // capture edit
        'button-translate': ['翻譯', '翻译', 'Translate'],

        // custom
        'button-search': ['查詢', '查询', 'Search'],
        'button-view-all': ['全部', '全部', 'All'],
        'button-view-files': ['檢視檔案', '检视档案', 'View files'],

        // dictionary
        'button-switch': ['切換', '切换', 'Exchange'],

        // edit
        'button-restart-translate': ['重新翻譯', '重新翻译', 'Translate again'],
        'button-load-json': ['重新讀取對照表', '重新读取对照表', 'Reload table'],
        'button-report-translation': ['回報翻譯', '回报翻译', 'Report'],

        'button-save-custom': ['儲存', '储存', 'Save'],
        'button-delete-custom': ['刪除', '删除', 'Delete'],
        'button-edit-custom': ['編輯', '编辑', 'Edit'],

        // read log
        'button-read-log': ['讀取', '读取', 'Open'],
        'button-view-log': ['檢視檔案', '检视档案', 'View chat logs'],
      },
      label: {
        // config
        'checkbox-top': ['顯示在最上層', '显示在最上层', 'Always on top'],
        'checkbox-focusable': ['可被選取', '可被选取', 'Focusable'],
        'checkbox-shortcut': ['啟用快捷鍵', '启用快捷键', 'Shortcut'],
        'checkbox-min-size': ['最小尺寸限制', '最小尺寸限制', 'Minimum size limit'],
        'checkbox-hide-button': ['自動隱藏按鈕', '自动隐藏按钮', 'Hide buttons automatically'],
        'checkbox-hide-dialog': ['自動隱藏視窗', '自动隐藏视窗', 'Hide window automatically'],
        'input-hide-dialog': ['隱藏間隔(秒)', '隐藏间隔(秒)', 'Hide window after(sec)'],
        'input-background-color': ['背景顏色', '背景颜色', 'Color'],
        'input-background-transparency': ['背景透明度', '背景透明度', 'Transparency'],
        'input-speech-speed': ['朗讀速度', '朗读速度', 'Speech speed'],

        'select-font-weight': ['文字粗細', '文字粗细', 'Font weight'],
        'input-font-size': ['文字大小(rem)', '文字大小(rem)', 'Font size(rem)'],
        'input-dialog-spacing': ['對話框間隔(rem)', '对话框间隔(rem)', 'Dialog Spacing(rem)'],
        'input-dialog-radius': ['對話框圓角(rem)', '对话框圆角(rem)', 'Dialog Radius(rem)'],
        'input-dialog-color': ['對話框顏色', '对话框颜色', 'Dialog Color'],
        'input-dialog-transparency': ['對話框透明度', '对话框透明度', 'Dialog Transparency'],

        'checkbox-auto-change': ['翻譯失敗時切換翻譯方式', '翻译失败时切换翻译方式', 'Change method automatically'],
        'checkbox-fix-translation': ['翻譯修正', '翻译修正', 'Fix translation'],
        'checkbox-skip-system': ['忽略常見系統訊息', '忽略常见系统讯息', 'Ignore system message'],
        'checkbox-skip-chinese': ['忽略漢化字幕', '忽略汉化字幕', 'Ignore chinese text'],
        'select-engine': ['翻譯方式', '翻译方式', 'Method'],
        'select-from': ['遊戲語言', '游戏语言', 'Game Language'],
        'select-from-player': ['隊伍頻道', '队伍频道', 'Party Language'],
        'select-to': ['翻譯語言', '翻译语言', 'Target Language'],

        'input-gemini-api-key': ['API key', 'API金钥', 'API key'],

        'input-cohere-token': ['API key', 'API金钥', 'API key'],

        'input-kimi-token': ['API key', 'API金钥', 'API key'],
        'input-kimi-custom-prompt': ['自訂Prompt', '自订Prompt', 'Custom prompt'],

        'input-gpt-api-key': ['API key', 'API金钥', 'API key'],
        'select-gpt-model': ['GPT模型', 'GPT模型', 'GPT model'],

        'input-llm-api-key': ['API key', 'API金钥', 'API key'],
        'input-llm-model': ['模型', '模型', 'Model'],
        'input-llm-api-url': ['API URL', 'API URL', 'API URL'],

        'select-app-language': ['語言', '语言', 'Language'],
        'checkbox-auto-download-json': ['啟動時下載翻譯對照表', '启动时下载翻译对照表', 'Download table when started'],
        'checkbox-ssl-certificate': ['SSL驗證', 'SSL验证', 'SSL certificate'],

        'input-ai-chat-enable': ['使用多輪對話', '使用多轮对话', 'Multi-turn Conversation'],
        'input-ai-chat-length': ['對話長度', '对话长度', 'Turn Length'],
        'input-ai-temperature': ['溫度', '温度', 'Temperature'],

        'input-proxy-enable': ['使用Proxy', '使用Proxy', 'Enable Proxy'],
        'input-proxy-protocol': ['Proxy Protocol', 'Proxy Protocol', 'Proxy Protocol'],
        'input-proxy-host': ['Proxy Host', 'Proxy Host', 'Proxy Host'],
        'input-proxy-port': ['Proxy Port', 'Proxy Port', 'Proxy Port'],
        'input-proxy-username': ['Proxy Username', 'Proxy Username', 'Proxy Username'],
        'input-proxy-password': ['Proxy Password', 'Proxy Password', 'Proxy Password'],

        // capture
        'checkbox-split': ['換行切割', '换行切割', 'New line'],
        'checkbox-edit': ['編輯文字', '编辑文字', 'Edit'],

        // capture edit
        'input-capture-text': ['文字', '文字', 'Txt'],
        'input-capture-image': ['圖片', '图片', 'Img'],

        // edit
        'checkbox-replace': ['取代原本翻譯', '取代原本翻译', 'Replace'],
        'textarea-before': ['原文', '原文', 'Original text'],
        'textarea-after': ['取代為', '取代为', 'Replace with'],
        'select-type': ['類別', '类别', 'type'],

        // dictionary
        'checkbox-tataru': ['使用Tataru翻譯', '使用Tataru翻译', 'Translate with Tataru'],

        // read log
        'select-log': ['選擇對話紀錄', '选择对话纪录', 'Chat log'],
      },
      option: {
        // config
        'div-window': ['視窗設定', '视窗设定', 'Window'],
        'div-font': ['文字設定', '文字设定', 'Font'],
        'div-channel': ['頻道設定', '频道设定', 'Channel'],
        'div-translation': ['翻譯設定', '翻译设定', 'Translate'],
        'div-api': ['API設定', 'API设定', 'API'],
        'div-ai': ['AI設定', 'AI设定', 'AI Settings'],
        'div-proxy': ['Proxy設定', 'Proxy设定', 'Proxy'],
        'div-system': ['系統設定', '系统设定', 'System'],
        'div-about': ['關於', '关于', 'About'],

        normal: ['細', '细', 'Normal'],
        bold: ['粗', '粗', 'Bold'],

        '#Web-Translator': ['#線上翻譯', '#在线翻译', '#Web'],
        Youdao: ['有道翻譯', '有道翻译', 'Youdao'],
        Baidu: ['百度翻譯', '百度翻译', 'Baidu'],
        Caiyun: ['彩雲小譯', '彩云小译', 'Caiyun'],
        Papago: ['Papago', 'Papago', 'Papago'],
        DeepL: ['DeepL', 'DeepL', 'DeepL'],
        '#AI-Translator': ['#AI翻譯', '#AI翻译', '#AI'],
        GPT: ['ChatGPT', 'ChatGPT', 'ChatGPT'],
        Cohere: ['Cohere', 'Cohere', 'Cohere'],
        Gemini: ['Gemini', 'Gemini', 'Gemini'],
        Kimi: ['Kimi', 'Kimi', 'Kimi'],
        'LLM-API': ['自訂OpenAI', '自订OpenAI', 'Custom OpenAI'],

        Japanese: ['日文', '日语', 'Japanese'],
        English: ['英文', '英语', 'English'],
        'Traditional-Chinese': ['繁體中文', '繁体中文', 'Traditional Chinese'],
        'Simplified-Chinese': ['簡體中文', '简体中文', 'Simplified Chinese'],

        Korean: ['韓文', '韩語', 'Korean'],
        Russian: ['俄文', '俄语', 'Russian'],
        Italian: ['義大利文', '意大利语', 'Italian'],

        // capture
        'tesseract-ocr': ['Tesseract OCR', 'Tesseract OCR', 'Tesseract OCR'],
        'google-vision': ['Google Vision', 'Google Vision', 'Google Vision'],
        'gpt-vision': ['ChatGPT Vision', 'ChatGPT Vision', 'ChatGPT Vision'],

        // edit
        '#player-name': ['#玩家', '#玩家', '#Player'],
        player: ['玩家名稱', '玩家名称', 'Player'],
        retainer: ['雇員名稱', '雇员名称', 'Retainer'],
        '#custom-target': ['#原文->自訂翻譯', '#原文->自订翻译', '#Source->Custom'],
        npc: ['NPC名稱', 'NPC名称', 'NPC'],
        title: ['稱呼', '称呼', 'Title'],
        group: ['組織', '组织', 'Group'],
        monster: ['魔物', '魔物', 'Monster'],
        things: ['事物', '事物', 'Things'],
        skill: ['技能', '技能', 'Skill'],
        map: ['地名', '地名', 'Map'],
        other: ['其他', '其他', 'Other'],
        '#custom-overwrite': ['#原文->自訂翻譯(整句)', '#原文->自订翻译(整句)', '#Source->Custom(full text)'],
        'custom-overwrite': ['自訂翻譯(整句)', '自订翻译(整句)', 'Custom(full text)'],
        '#custom-source': ['#原文->原文', '#原文->原文', '#Source->Source'],
        'custom-source': ['原文替換', '原文替换', 'Edit source'],

        // custom
        'player-name-table': ['#玩家', '#玩家', '#Player'],
        'custom-target-table': ['#原文->自訂翻譯', '#原文->自订翻译', '#Source->Custom'],
        'custom-overwrite-table': ['#原文->自訂翻譯(整句)', '#原文->自订翻译(整句)', '#Source->Custom(full text)'],
        'custom-source-table': ['#原文->原文', '#原文->原文', '#Source->Source'],
        'temp-name-table': ['#系統暫存', '#系統暫存', '#System Cache'],

        // read log
        none: ['無', '无', 'None'],
      },
      p: {
        'p-google-vision': ['Google Vision設定', 'Google Vision设定', 'Google Vision'],
        'p-gemini': ['Gemini設定', 'Gemini设定', 'Gemini'],
        'p-cohere': ['Cohere設定', 'Cohere设定', 'Cohere'],
        'p-chat-gpt': ['ChatGPT設定', 'ChatGPT设定', 'ChatGPT'],
        'p-kimi': ['Kimi設定', 'Kimi设定', 'Kimi'],
        'p-llm-api': ['自訂OpenAI設定', '自订OpenAI设定', 'Custom OpenAI'],
        'p-unoffcia-api': ['若您的位置無法使用ChatGPT，請點此設定反向代理', '若您的位置无法使用ChatGPT，请点此设定反向代理', "Click here to set reverse proxy if your location can't access ChatGPT"],
        'p-ssl-warning': [
          '若您的API不支援SSL驗證，請至【系統設定】關閉SSL驗證',
          '若您的API不支援SSL验证，请至【系统设定】关闭SSL验证',
          'Set SSL certificate off in "System Config" if your API can\'t access ChatGPT',
        ],
        'p-ssl-warning-2': [
          '若您使用VPN或加速器時無法翻譯字幕，請至【系統設定】關閉SSL驗證',
          '若您使用VPN或加速器时无法翻译字幕，请至【系统设定】关闭SSL验证',
          'Set SSL certificate off in "System Config" if your VPN can\'t access translator',
        ],
      },
      span: {
        // window title
        'span-title-capture-edit': ['編輯擷取文字', '编辑撷取文字', 'Edit detected text'],
        'span-title-config': ['設定', '设定', 'Config'],
        'span-title-custom': ['自訂翻譯', '自订翻译', 'Custom Translation'],
        'span-title-dictionary': ['翻譯查詢', '翻译查询', 'Translator'],
        'span-title-edit': ['編輯翻譯', '编辑翻译', 'Edit Translation'],
        'span-title-read-log': ['讀取對話紀錄', '读取对话纪录', 'Read Logs'],

        // config
        'span-channel-comment': ['滾動滑鼠中鍵可以滑動頻道清單', '滚动鼠标中键可以滑动频道清单', 'Use middle mouse button to sroll the page'],
        'span-author': ['作者: 夜雪 (巴哈姆特電玩資訊站 winw1010)', '作者: 夜雪 (巴哈姆特电玩资讯站 winw1010)', 'Author: winw1010'],
      },
      title: {
        'title-capture-edit': ['編輯擷取文字', '编辑撷取文字', 'Edit detected text'],
        'title-capture': ['擷取文字', '撷取文字', 'Detect screen text'],
        'title-config': ['設定', '设定', 'Config'],
        'title-custom': ['自訂翻譯', '自订翻译', 'Custom Translation'],
        'title-dictionary': ['翻譯查詢', '翻译查询', 'Translator'],
        'title-edit': ['編輯翻譯', '编辑翻译', 'Edit Translation'],
        'title-index': ['Tataru Assistant', 'Tataru Assistant', 'Tataru Assistant'],
        'title-read-log': ['讀取對話紀錄', '读取对话纪录', 'Read Logs'],
      },
      th: {
        'th-custom-before': ['原文', '原文', 'Original text'],
        'th-custom-after': ['取代為', '取代为', 'Replace with'],
        'th-custom-type': ['類別', '类别', 'Type'],
        'th-custom-edit': ['編輯', '编辑', 'Edit'],
      },
    },
    placeholder: {
      input: {
        // config
        'input-gemini-api-key': ['API key', 'API金钥', 'API key'],
        'input-cohere-token': ['API key', 'API金钥', 'API key'],
        'input-gpt-api-key': ['API key', 'API金钥', 'API key'],
        'input-kimi-token': ['API key', 'API金钥', 'API key'],
        'input-llm-api-key': ['API key', 'API金钥', 'API key'],

        'input-llm-model': ['Model', 'Model', 'Model'],
        'input-llm-api-url': ['API URL', 'API URL', 'API URL'],

        // custom
        'input-Keyword': ['關鍵字', '关键字', 'Keyword'],

        // dictionary
        'input-original-name': ['Name', 'Name', 'Name'],
      },
      textarea: {
        // dictionary
        'textarea-original-text': ['Text', 'Text', 'Text'],

        // edit
        'textarea-before': ['原文', '原文', 'Original text'],
        'textarea-after': ['取代為', '取代为', 'Replace with'],
      },
    },
    title: {
      img: {
        // index
        'img-button-drag': ['拖曳', '拖曳', 'Drag'],
        'img-button-config': ['設定', '设定', 'Config'],
        'img-button-capture': ['翻譯螢幕文字', '翻译萤幕文字', 'Translate Screen Text'],
        'img-button-through': ['滑鼠穿透', '鼠标穿透', 'Mouse Pass'],
        'img-button-update': ['下載最新版本', '下载最新版本', 'Download the latest version'],
        'img-button-minimize': ['縮小', '缩小', 'Minimize'],
        'img-button-close': ['關閉', '关闭', 'Close'],

        'img-button-speech': ['朗讀文字', '朗读文字', 'Text To Speech'],
        'img-button-custom': ['自訂翻譯', '自订翻译', 'Custom Word'],
        'img-button-dictionary': ['翻譯查詢', '翻译查询', 'Translate'],
        'img-button-read-log': ['讀取對話紀錄', '读取对话纪录', 'Read Chat Log'],
        'img-button-backspace': ['刪除最後一句', '删除最后一句', 'Delete Last'],
        'img-button-clear': ['刪除全部對話', '删除全部对话', 'Delete All'],
      },
    },
  };
}
