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
  const title = document.getElementsByTagName('title').item(0);
  if (title) title.innerText = 'Tataru Assistant';

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
  switch (language) {
    case 'Traditional-Chinese':
      return 0;

    case 'Simplified-Chinese':
      return 1;

    default:
      return 2;
  }
}

// element text list
function getElementTextList() {
  return {
    innerText: {
      a: {
        // config
        'a-get-credential': ['憑證取得教學', '凭证取得教程', 'Get credential'],
        'a-set-gpt-api': ['ChatGPT設定教學', 'ChatGPT设定教学', 'ChatGPT guide'],
        'a-set-unofficial-api': ['反向代理API設定教學', '反向代理API设定教学', 'How to set unoffcial API'],

        'a-readme': ['使用說明書', '使用说明书', 'Readme'],
        'a-bug-report': ['問題回報', '问题回报', 'Bug report'],
        'a-view-response': ['查看回報表單', '查看回报表单', 'View response'],
        'a-translation-report': ['回報翻譯錯誤', '回报翻译错误', 'Translation report'],
        'a-github': ['GitHub', 'GitHub', 'GitHub'],
        'a-author': ['訪問作者', '访问作者', 'Author'],
      },
      button: {
        // config
        'button-save-config': ['儲存', '储存', 'Save'],
        'button-save-default-config': ['恢復預設', '恢复预设', 'Set default'],

        'button-download-json': ['重新下載翻譯對照表', '重新下载翻译对照表', 'Download table'],
        'button-restart-sharlayan-reader': ['重新啟動字幕讀取器', '重新启动字幕读取器', 'Restart chat reader'],
        'button-version-check': ['檢查更新', '检查更新', 'Check for updates'],
        'button-google-credential': ['開啟Google憑證檔案', '开启Google凭证档案', 'Open Google credential file'],

        // capture
        'button-screenshot': ['All', 'All', 'All'],

        // capture edit
        'button-translate': ['翻譯', '翻译', 'Translate'],

        // dictionary
        'button-switch': ['切換', '切换', 'Exchange'],

        // edit
        'button-restart-translate': ['重新翻譯', '重新翻译', 'Translate again'],
        'button-load-json': ['重新讀取對照表', '重新读取对照表', 'Reload table'],
        'button-report-translation': ['回報翻譯錯誤', '回报翻译错误', 'Report'],

        'button-save-custom': ['儲存', '储存', 'Save'],
        'button-delete-custom': ['刪除', '删除', 'Delete'],
        'button-view-custom': ['檢視自訂翻譯', '检视自订翻译', 'View custom table'],

        // read log
        'button-read-log': ['讀取', '读取', 'Open'],
        'button-view-log': ['檢視對話紀錄檔案', '检视对话纪录档案', 'View chat logs'],
      },
      label: {
        // config
        'checkbox-top': ['顯示在最上層', '显示在最上层', 'Always on top'],
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
        'input-dialog-spacing': ['對話框間隔(rem)', '对话框间隔(rem)', 'Spacing(rem)'],
        'input-dialog-radius': ['對話框圓角(rem)', '对话框圆角(rem)', 'Radius(rem)'],
        'input-dialog-color': ['對話框顏色', '对话框颜色', 'Color'],
        'input-dialog-transparency': ['對話框透明度', '对话框透明度', 'Transparency'],

        'checkbox-auto-change': ['翻譯失敗時切換翻譯引擎', '翻译失败时切换翻译引擎', 'Change engine automatically'],
        'checkbox-fix-translation': ['翻譯修正', '翻译修正', 'Fix translation'],
        'checkbox-skip-system': ['忽略常見系統訊息', '忽略常见系统讯息', 'Ignore system message'],
        'checkbox-skip-chinese': ['忽略漢化字幕', '忽略汉化字幕', 'Ignore chinese text'],
        'select-engine': ['翻譯引擎', '翻译引擎', 'Engine'],
        'select-from': ['遊戲語言', '游戏语言', 'Game lang'],
        'select-from-player': ['玩家頻道', '玩家频道', 'Player lang'],
        'select-to': ['翻譯語言', '翻译语言', 'Target lang'],

        'input-cohere-token': ['API key', 'API金钥', 'API key'],

        'input-gpt-api-key': ['API key', 'API金钥', 'API key'],
        'select-gpt-model': ['GPT模型', 'GPT模型', 'GPT model'],

        'checkbox-unofficial-api': ['使用反向代理API', '使用反向代理API', 'Enable unoffcial API'],
        'input-unofficial-api-url': ['反向代理API網址', '反向代理API地址', 'Unoffcial API URL'],

        'select-app-language': ['語言', '语言', 'Language'],
        'checkbox-auto-download-json': ['啟動時下載翻譯對照表', '启动时下载翻译对照表', 'Download table when started'],
        'checkbox-ssl-certificate': ['SSL驗證', 'SSL验证', 'SSL certificate'],

        // capture
        'checkbox-split': ['換行切割', '换行切割', 'Divide new line'],
        'checkbox-edit': ['編輯擷取文字', '编辑撷取文字', 'Edit'],

        // capture edit
        'input-capture-text': ['擷取文字', '撷取文字', 'Text'],
        'input-capture-image': ['擷取图片', '撷取图片', 'Image'],

        // edit
        'checkbox-replace': ['取代原本翻譯', '取代原本翻译', 'Replace'],
        'textarea-before': ['原文', '原文', 'Before'],
        'textarea-after': ['取代為', '取代为', 'After'],
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
        'div-system': ['系統設定', '系统设定', 'System'],
        'div-about': ['關於', '关于', 'About'],

        normal: ['細', '细', 'Normal'],
        bold: ['粗', '粗', 'Bold'],

        Youdao: ['有道翻譯', '有道翻译', 'Youdao'],
        Baidu: ['百度翻譯', '百度翻译', 'Baidu'],
        Caiyun: ['彩雲小譯', '彩云小译', 'Caiyun'],

        Japanese: ['日文', '日文', 'Japanese'],
        English: ['英文', '英文', 'English'],
        'Traditional-Chinese': ['繁體中文', '繁体中文', 'Traditional Chinese'],
        'Simplified-Chinese': ['簡體中文', '简体中文', 'Simplified Chinese'],

        'please-select-gpt-model': ['請選擇GPT模型', '请选择GPT模型', 'Please select GPT model'],

        // capture
        'tesseract-ocr': ['Tesseract OCR', 'Tesseract OCR', 'Tesseract OCR'],
        'google-vision': ['Google Vision', 'Google Vision', 'Google Vision'],

        // edit
        '#custom-source': ['#原文->原文', '#原文->原文', '#Source->Source'],
        'custom-source': ['原文替換', '原文替换', 'Custom source'],
        '#custom-target': ['#原文->自訂翻譯', '#原文->自订翻译', '#Source->Target'],
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
        '#custom-overwrite': ['#整句原文->自訂整句翻譯', '#整句原文->自订整句翻译', '#Overwrite source'],
        'custom-overwrite': ['自訂整句翻譯', '自订整句翻译', 'Custom overwrite'],

        // read log
        none: ['無', '无', 'None'],
      },
      p: {
        'p-google-vision': ['Google Vision設定', 'Google Vision设定', 'Google Vision'],
        'p-cohere': ['Cohere設定', 'Cohere设定', 'Cohere'],
        'p-chat-gpt': ['ChatGPT設定', 'ChatGPT设定', 'ChatGPT'],
        'p-unoffcia-api': [
          '若您的位置無法使用ChatGPT，請點此設定反向代理',
          '若您的位置无法使用ChatGPT，请点此设定反向代理',
          "Click here to set reverse proxy if your location can't access ChatGPT",
        ],
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

        'p-donate': ['贊助作者', '赞助作者', 'Donate'],
      },
      span: {
        // window title
        'span-title-capture-edit': ['編輯擷取文字', '编辑撷取文字', 'Edit detected text'],
        'span-title-config': ['設定', '设定', 'Config'],
        'span-title-dictionary': ['翻譯查詢', '翻译查询', 'Translate'],
        'span-title-edit': ['重新翻譯', '重新翻译', 'Translate again'],
        'span-title-read-log': ['讀取對話紀錄', '读取对话纪录', 'View chat logs'],
        'span-title-custom': ['自訂翻譯', '自订翻译', 'Custom word'],

        // config
        'span-channel-comment': [
          '滾動滑鼠中鍵可以滑動頻道清單',
          '滚动鼠标中键可以滑动频道清单',
          'Use middle mouse button to sroll the page',
        ],
        'span-author': [
          '作者: 夜雪 (巴哈姆特電玩資訊站 winw1010)',
          '作者: 夜雪 (巴哈姆特电玩资讯站 winw1010)',
          'Author: winw1010',
        ],
      },
    },
    placeholder: {
      input: {
        // config
        'input-cohere-token': ['請輸入API key', '请输入API金钥', 'API key'],
        'input-gpt-api-key': ['請輸入API key', '请输入API金钥', 'API key'],

        // dictionary
        'input-original-name': ['Name', 'Name', 'Name'],
      },
      textarea: {
        // dictionary
        'textarea-original-text': ['Text', 'Text', 'Text'],

        // edit
        'textarea-before': ['原文', '原文', 'Before'],
        'textarea-after': ['取代為', '取代为', 'After'],
      },
    },
    title: {
      img: {
        // index
        'img-button-drag': ['拖曳', '拖曳', 'Drag'],
        'img-button-config': ['設定', '设定', 'Config'],
        'img-button-capture': ['翻譯螢幕文字', '翻译萤幕文字', 'Translate Screen Text'],
        'img-button-through': ['滑鼠穿透', '鼠标穿透', 'Mouse Pass'],
        'img-button-update': ['下載最新版本', '下载最新版本', 'Download Latest Version'],
        'img-button-minimize': ['縮小', '缩小', 'Minimize'],
        'img-button-close': ['關閉', '关闭', 'Close'],

        'img-button-speech': ['朗讀文字', '朗读文字', 'Text To Speech'],
        'img-button-dictionary': ['翻譯查詢', '翻译查询', 'Translate'],
        'img-button-read-log': ['讀取對話紀錄', '读取对话纪录', 'Read Chat Log'],
        'img-button-backspace': ['刪除最後一句', '删除最后一句', 'Delete Last'],
        'img-button-clear': ['刪除全部對話', '删除全部对话', 'Delete All'],
      },
    },
  };
}
