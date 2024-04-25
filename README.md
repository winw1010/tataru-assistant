# Tataru Assistant

- [原始碼使用說明](https://github.com/winw1010/tataru-assistant/blob/main/doc/README_SOURCE.md)

- [下載 Tataru Assistant](https://drive.google.com/drive/folders/14zjoUNzZTKgn2mCiAx6YJ14-fsd8M_I_?usp=drive_link)

## 安裝步驟

1. 從上方連結下載**Tataru Assistant Setup.exe**

2. 執行**Tataru Assistant Setup.exe**開始安裝，若顯示「Windows 已保護您的電腦」的訊息，請點選「其他資訊」，再點選下方的「仍要執行」

3. 啟動後若顯示「這個作業系統不支援 .NET Framework 4.7.2」的訊息，請從上方連結下載**ndp472-kb4054531-web.exe**安裝 Microsoft .NET Framework 4.7.2

4. 點選視窗上的齒輪圖示開啟 Tataru Assistant 的設定視窗，切換到「翻譯設定」設置你的遊戲語言和翻譯語言，設定完畢後按儲存即可使用

5. 若安裝後無法自動翻譯，請從上方連結下載**fix.bat**，對其右鍵使用管理員身分執行，執行後按下任意鍵開始修復，修復完畢重新開機即可

## 什麼是 Tataru Assistant?

**Tataru Assistant** 為針對 FFXIV 國際版設計的及時中文翻譯程式，主要功能如下

- 即時翻譯對話文字

- 即時翻譯過場字幕

- 翻譯對話選項(使用螢幕擷取翻譯功能)

- 根據[**對照表**](https://github.com/winw1010/tataru-assistant-text)修正翻譯結果，例如將**タタル**在修正為**塔塔露**

- 自訂翻譯

- 查詢翻譯

## Tataru Assistant 的翻譯方式

### 線上翻譯機：翻譯能力一般，但基本上可無限制使用

- 有道翻譯

- 百度翻譯

- 彩雲小譯

- Papago Naver

- DeepL

### AI 翻譯：翻譯能力較佳，可正確翻譯較艱深的句子，需申請 API key 才能使用

- Gemini (有免費方案，免費的可用 Token 和請求量非常充裕，無課首選)

- ChatGPT (只有流量計費方案，想使用最新的模型需月費)

- Cohere (也有免費方案，但限制較大)

## Credits

- [NightlyRevenger/TataruHelper](https://github.com/NightlyRevenger/TataruHelper)
- [Electron](https://www.electronjs.org/)
- [@google-cloud/vision](https://github.com/googleapis/nodejs-vision)
- [axios](https://github.com/axios/axios)
- [crypto-js](https://github.com/brix/crypto-js)
- [sharp](https://github.com/lovell/sharp)
- [temp](https://github.com/bruce/node-temp)
- [tesseract.js](https://github.com/naptha/tesseract.js#tesseractjs)

## Support

[<img src="https://github.com/winw1010/tataru-helper-node-v2/blob/main/src/html/img/bmc/bmc-button.png" alt="Buy me a coffee" width="200"/>](https://www.buymeacoffee.com/winw1010)
