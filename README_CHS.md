[English](https://github.com/winw1010/tataru-assistant/blob/main/README.md) | [繁体中文](https://github.com/winw1010/tataru-assistant/blob/main/README_CHT.md) | 简体中文

# Tataru Assistant 是什么?

**Tataru Assistant** 为 FFXIV 国际版的即时剧情字幕翻译程式，主要功能如下

- AI翻译对话文字和过场字幕

- 支援AI多轮对话，使翻译结果更通顺

- 撷取萤幕文字并进行翻译

- (仅支援中文翻译)根据[**对照表**](https://github.com/winw1010/tataru-assistant-text)修正翻译结果，例如将**タタル**修正为**塔塔露**

- (全语言可用)自订翻译结果

# Tataru Assistant 的翻译方式

## AI 翻译

翻译能力较佳，可很好地翻译游戏中各种较为口语的句子，推荐使用免费额度较高的Germini

- Gemini (推荐)

- ChatGPT

- Cohere

- Kimi

- 自订LLM(可自行输入Heder和Payload)

## 传统翻译机 (不推荐使用)

可无限使用，但翻译质量较差，不推荐使用

- 有道翻译

- 百度翻译

- 彩云小译

- Papago Naver

- DeepL

# 档案下载

- [Tataru Assistant 安装档](https://github.com/winw1010/tataru-assistant/releases/latest/download/Tataru_Assistant_Setup.exe)

- [.NET Framework 4.8](https://dotnet.microsoft.com/en-us/download/dotnet-framework/thank-you/net48-web-installer) (执行 Tataru Assistant 的必要元件)

# 安装步骤

1. 下载「Tataru Assistant 安装档」和「.NET Framework 4.8」

2. 执行「ndp48-web.exe」安装 .NET Framework 4.8 (执行 Tataru Assistant 的必要元件)

3. 执行「Tataru Assistant Setup.exe」安装 Tataru Assistant ，若显示「Windows 已保护您的电脑」的讯息，请点选「其他资讯」，再点选下方的「仍要执行」

4. 点选视窗上的齿轮图示开启 Tataru Assistant 的设定视窗，切换到【翻译设定】设置你的游戏语言和翻译语言，设定完毕后按储存即可使用

5. 若安装后无法自动翻译，请至【设定】>【系统设定】，点选【修復字幕读取器】，修復后重新开机即可

# 原始码

## 建置原始码

- 必要元件：[Git](https://git-scm.com)、[Node.js(长期维护版)](https://nodejs.org/zh-tw/)
- 编辑器：[Visual Studio Code](https://code.visualstudio.com/)

```bash
# 启动命令提示字元(cmd)
于左下搜寻栏位输入cmd开启

# 複製专案
git clone https://github.com/winw1010/tataru-assistant

# 进入专案资料夹
cd tataru-assistant

# 安装套件
npm install

# 启动APP
npm start
```

## 建立安装档

- 输出位置：tataru-assistant/build
- 安装档设定位于 package.json 里的 build 物件中，打包工具为 electron-builder

```bash
# 启动命令提示字元(cmd)
于左下搜寻栏位输入cmd开启

# 进入专案资料夹
cd (你的专案位置)

# 建立安装档
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
