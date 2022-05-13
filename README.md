# Tataru Helper Node Ver.2.0.0 Source Code

## Tararu Helper程式修改步驟

1. 至[這裡](https://github.com/NightlyRevenger/TataruHelper/releases)下載最新版本的Tataru Helper
2. 安裝後至安裝目錄刪除TataruHelper.exe和Update.exe
3. 進入安裝目錄下的app-0.9.106資料夾，將裡面的TataruHelper.exe取代為本專案_Tataru Helper/Release裡的TataruHelper.exe即可

## Tararu Helper專案修改步驟

1. 至[這裡](https://github.com/NightlyRevenger/TataruHelper)，按下Code > Download ZIP下載最新版的原始碼
2. 解壓縮後將_Tataru Helper裡的FFXIVWpfApp1與Updater複製到專案裡
3. 使用Visual Studio開啟專案(.sln檔)
4. 將Debug改為Release，然後按下開始即可編譯專案
5. 編譯好的.exe檔會存放在專案裡的FFXIVWpfApp1/bin/Release裡，你也可以拿這裡的TataruHelper.exe取代原版的Tataru Helper

## Tataru Helper Node專案使用步驟

建議使用[Visual Studio Code](https://code.visualstudio.com/)編輯

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/winw1010/tataru-helper-node-ver.2.0.0
# Go into the repository
cd tataru-helper-node-ver.2.0.0
# Install dependencies
npm install
# Run the app
npm start
```

## Tataru Helper Node安裝檔建立方法

```bash
# Distribute the app
npm run dist
```