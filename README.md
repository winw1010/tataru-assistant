English | [繁體中文](https://github.com/winw1010/tataru-assistant/blob/main/README_CHT.md) | [简体中文](https://github.com/winw1010/tataru-assistant/blob/main/README_CHS.md)

# What is Tataru Assistant?

**Tataru Assistant** is a real-time subtitle translation program for the global version of FFXIV. Its main features include:

- AI translation for dialogue and cutscene subtitles.
- Supports AI multi-turn conversations for more accurate translation results.
- Captures and translates text from the screen.
- Custom translation overrides.

# Translation Methods in Tataru Assistant

## AI Translation

Provides superior translation quality, capable of handling colloquial language in the game effectively. We recommend using Gemini due to its generous free tier.

- Gemini (Recommended)
- ChatGPT
- Claude
- Cohere
- Kimi
- Ollama (Local LLM)
- Custom LLM (Compatible with OpenAI API only)

## Traditional Translators (Not Recommended)

Available for unlimited use, but the translation quality is generally lower. Not recommended.

- Youdao
- Baidu
- Caiyun
- Papago Naver
- DeepL

# Downloads

- [.NET 10 Desktop Runtime](https://dotnet.microsoft.com/zh-tw/download/dotnet/thank-you/runtime-desktop-10.0.11-windows-x64-installer) (Required for Tataru Assistant 3.0 and above)
- [Tataru Assistant Installer](https://github.com/winw1010/tataru-assistant/releases/latest/download/Tataru_Assistant_Setup.exe)

# Downloads (Legacy)

- [.NET Framework 4.8](https://dotnet.microsoft.com/zh-tw/download/dotnet-framework/thank-you/net48-web-installer) (Required for Tataru Assistant 2.x versions)

# Installation Steps

1. Download the "Tataru Assistant Installer" and the ".NET 10 Desktop Runtime".
2. Run "windowsdesktop-runtime-10.0.11-win-x64.exe" to install the .NET 10 Desktop Runtime.
3. Run "Tataru Assistant Setup.exe" to install the application. If a "Windows protected your PC" message appears, click "More info," then click "Run anyway."
4. Click the gear icon to open the Settings window, switch to **[Translation Settings]**, configure your game language and target translation language, then save.
5. If translation does not work automatically after installation, please ensure that **NVIDIA ShadowPlay** is disabled, as this feature can interfere with the program's ability to display subtitles.
6. If it still does not work, go to **[Settings]** > **[System Settings]** and click **[Repair Subtitle Reader]**. Restart the app after the repair is complete.

# Source Code

## Building from Source

- Prerequisites: [Git](https://git-scm.com), [Node.js (LTS version)](https://nodejs.org/)
- Editor: [Visual Studio Code](https://code.visualstudio.com/)

```bash
# Clone the project
git clone https://github.com/winw1010/tataru-assistant

# Enter the project directory
cd tataru-assistant

# Install dependencies
npm install

# Run the app
npm start
```

## Creating the Installer

- Output location: tataru-assistant/build
- Installer settings are located in the `build` object within `package.json`. The packaging tool used is `electron-builder`.

```bash
# Enter the project directory
cd (your project path)

# Create the installer
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
