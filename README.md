# 檔案下載

- [Tataru Assistant 安裝檔](https://github.com/winw1010/tataru-assistant/releases/latest/download/Tataru_Assistant_Setup.exe)

- [.NET Framework 4.8](https://dotnet.microsoft.com/en-us/download/dotnet-framework/thank-you/net48-web-installer) (執行 Tataru Assistant 的必要元件)

# 安裝步驟

1. 下載「Tataru Assistant 安裝檔」和「.NET Framework 4.8」

2. 執行「ndp48-web.exe」安裝 .NET Framework 4.8 (執行 Tataru Assistant 的必要元件)

3. 執行「Tataru Assistant Setup.exe」安裝 Tataru Assistant ，若顯示「Windows 已保護您的電腦」的訊息，請點選「其他資訊」，再點選下方的「仍要執行」

4. 點選視窗上的齒輪圖示開啟 Tataru Assistant 的設定視窗，切換到【翻譯設定】設置你的遊戲語言和翻譯語言，設定完畢後按儲存即可使用

5. 若安裝後無法自動翻譯，請至【設定】>【系統設定】，點選【修復字幕讀取器】，修復後重新開機即可

# Tataru Assistant 是什麼?

**Tataru Assistant** 為 FFXIV 國際版的即時劇情字幕翻譯程式，主要功能如下

- 即時翻譯對話文字

- 即時翻譯過場字幕

- 螢幕文字擷取翻譯功能

- (僅支援中文翻譯)根據[**對照表**](https://github.com/winw1010/tataru-assistant-text)修正翻譯結果，例如將**タタル**修正為**塔塔露**

- (全語言)自訂翻譯

- 翻譯查詢器

# Tataru Assistant 的翻譯方式

## 線上翻譯機

翻譯能力一般，但基本上無使用限制

- 有道翻譯

- 百度翻譯

- 彩雲小譯

- Papago Naver

- DeepL

## AI 翻譯

翻譯能力較佳，可正確翻譯較艱深的句子，需申請 API key 才能使用，目前支援以下方案

- Gemini

- ChatGPT

- Cohere

- Kimi

- 自訂 OpenAI(自訂模式，可自行輸入 POST URL 和 API KEY 使用與 OpenAI 相容的 AI 模型)

# 原始碼

## 建置原始碼

- 必要元件：[Git](https://git-scm.com)、[Node.js(長期維護版)](https://nodejs.org/zh-tw/)
- 編輯器：[Visual Studio Code](https://code.visualstudio.com/)

```bash
# 啟動命令提示字元(cmd)
於左下搜尋欄位輸入cmd開啟

# 複製專案
git clone https://github.com/winw1010/tataru-assistant

# 進入專案資料夾
cd tataru-assistant

# 安裝套件
npm install

# 啟動APP
npm start
```

## 建立安裝檔

- 輸出位置：tataru-assistant/build
- 安裝檔設定位於 package.json 裡的 build 物件中，打包工具為 electron-builder

```bash
# 啟動命令提示字元(cmd)
於左下搜尋欄位輸入cmd開啟

# 進入專案資料夾
cd (你的專案位置)

# 建立安裝檔
npm run dist
```

# Credits

- [FFXIVAPP/sharlayan](https://github.com/FFXIVAPP/sharlayan)
- [Electron](https://www.electronjs.org/)
- [@google-cloud/vision](https://github.com/googleapis/nodejs-vision)
- [axios](https://github.com/axios/axios)
- [crypto-js](https://github.com/brix/crypto-js)
- [sharp](https://github.com/lovell/sharp)
- [temp](https://github.com/bruce/node-temp)
- [tesseract.js](https://github.com/naptha/tesseract.js#tesseractjs)

# Support

[<img src="https://github.com/winw1010/tataru-assistant/blob/main/src/html/img/bmc/bmc-button.png" alt="Buy me a coffee" width="200"/>](https://www.buymeacoffee.com/winw1010)
