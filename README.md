# Tataru Helper Node V2 Source Code

## Tataru Helper Node 原始碼專案建置步驟

-   可使用[Visual Studio Code](https://code.visualstudio.com/)編輯

-   To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/winw1010/tataru-helper-node-v2
# Go into the repository
cd tataru-helper-node-v2
# Install dependencies
npm install
# Run the app
npm start
```

## Tataru Helper Node 安裝檔建立步驟

-   安裝檔會建立在 build 資料夾裡
-   安裝檔設定在 package.json 裡的 build 物件，打包工具為 electron-builder
-   建立安裝檔之前請先啟動專案(npm start)並使用一次螢幕擷取功能(隨便找個文字圈選起來翻譯一次)，否則打包的安裝檔無法使用螢幕擷取功能

```bash
# Distribute the app
npm run dist
```

## Tararu Helper 程式修改步驟

1. 下載[Tataru Helper](https://github.com/NightlyRevenger/TataruHelper/releases)
2. 安裝後至 Tataru Helper 安裝目錄刪除 TataruHelper.exe 和 Update.exe
3. 進入安裝目錄下的 app-0.9.106 資料夾，將裡面的 TataruHelper.exe 取代為 Tataru Helper Node 專案裡的 src/\_Tataru_Helper/Release 裡的 TataruHelper.exe 即可

## Tararu Helper 原始碼專案修改步驟

1. 至 Tararu Helper 原作者的 GitHub([NightlyRevenger/TataruHelper](https://github.com/NightlyRevenger/TataruHelper))，按下 Code > Download ZIP 下載 Tataru Helper 的原始碼
2. 解壓縮後將 src/\_Tataru_Helper 裡的 FFXIVWpfApp1 資料夾與 Updater 資料夾複製到專案裡並取代
3. 使用 Visual Studio 開啟專案(.sln 檔)
4. 將 Debug 改為 Release，然後按下開始即可編譯專案
5. 編譯好的.exe 檔會建立在專案裡的 FFXIVWpfApp1/bin/Release 裡，你也可以拿這裡的 TataruHelper.exe 取代原版 Tataru Helper 的 TataruHelper.exe(Tararu Helper 程式修改步驟第 3 步驟)
