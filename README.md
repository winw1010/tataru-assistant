English | [繁體中文](https://github.com/winw1010/tataru-assistant/blob/main/README.md) | [简体中文](https://github.com/winw1010/tataru-assistant/blob/main/README_CHS.md)

# What is Tataru Assistant?

**Tataru Assistant** is a real-time story subtitle translation program for the FFXIV International version. Its main features include:

- AI translation for dialogue text and cutscene subtitles.
- Supports multi-turn AI dialogue, making translation results more natural and coherent.
- Captures screen text for translation.
- (Chinese translation only) Corrects translation results based on a [**reference table**](https://github.com/winw1010/tataru-assistant-text), such as correcting **タタル** to **塔塔露**.
- (Available for all languages) Custom translation overrides.

# Tataru Assistant Translation Methods

## AI Translation

Offers better translation quality and handles colloquial in-game sentences very well. We recommend using Gemini due to its generous free tier.

- Gemini (Recommended)
- ChatGPT
- Cohere
- Kimi
- Custom LLM (Allows manual input of Headers and Payload)

## Online Translators (Not Recommended)

These offer unlimited usage but have lower translation quality; therefore, they are not recommended.

- Youdao Translation
- Baidu Translation
- Caiyun Translator
- Papago Naver
- DeepL

# Downloads

- [Tataru Assistant Installer](https://github.com/winw1010/tataru-assistant/releases/latest/download/Tataru_Assistant_Setup.exe)
- [.NET Framework 4.8](https://dotnet.microsoft.com/en-us/download/dotnet-framework/thank-you/net48-web-installer) (Required component to run Tataru Assistant)

# Installation Steps

1. Download the "Tataru Assistant Installer" and ".NET Framework 4.8".
2. Run "ndp48-web.exe" to install .NET Framework 4.8 (Required to run the app).
3. Run "Tataru Assistant Setup.exe" to install the app. If a "Windows protected your PC" message appears, click "More info" and then "Run anyway".
4. Click the gear icon in the window to open settings. Go to [Translation Settings] to set your game language and target translation language, then click Save.
5. If automatic translation does not work after installation, go to [Settings] > [System Settings] and click [Repair Subtitle Reader]. Restart your computer after the repair is complete.

# Source Code

## Building from Source

- Required components: [Git](https://git-scm.com), [Node.js (LTS version)](https://nodejs.org/)
- Editor: [Visual Studio Code](https://code.visualstudio.com/)

```bash
# Open Command Prompt (cmd)
# Search for 'cmd' in the search bar and open it

# Clone the project
git clone https://github.com/winw1010/tataru-assistant

# Enter the project folder
cd tataru-assistant

# Install dependencies
npm install

# Start the app
npm start
```

## Creating the Installer

- Output location: tataru-assistant/build
- Installer settings are located in the `build` object within `package.json`. The packaging tool used is `electron-builder`.

```bash
# Open Command Prompt (cmd)
# Search for 'cmd' in the search bar and open it

# Enter the project folder
cd (your project path)

# Build the installer
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
