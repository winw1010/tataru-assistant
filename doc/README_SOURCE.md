# Tataru Assistant Source Code

## 建置原始碼

- 使用專案前必須先安裝[Git](https://git-scm.com)和[Node.js(長期維護版)](https://nodejs.org/zh-tw/)
- 可使用[Visual Studio Code](https://code.visualstudio.com/)編輯程式碼

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

- 輸出位置：專案資料夾/build
- 安裝檔的設定位於 package.json 裡的 build 物件中，打包工具為 electron-builder

```bash
# 啟動命令提示字元(cmd)
於左下搜尋欄位輸入cmd開啟

# 進入專案資料夾
cd (你的專案位置)

# 建立安裝檔
npm run dist
```
