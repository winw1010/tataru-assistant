# Tataru Helper Node V2 Source Code

## Tataru Helper Node 原始碼專案建置步驟

- 可使用[Visual Studio Code](https://code.visualstudio.com/)編輯程式碼
- 使用專案前必須先安裝[Git](https://git-scm.com)和[Node.js(長期維護版)](https://nodejs.org/zh-tw/)

```bash
# 啟動命令提示字元(cmd)
於左下搜尋欄位輸入cmd開啟

# 複製專案
git clone https://github.com/winw1010/tataru-helper-node-v2

# 進入專案資料夾
cd tataru-helper-node-v2

# 安裝套件
npm install

# 啟動APP
npm start
```

## Tataru Helper Node 安裝檔建立步驟

- 安裝檔會建立在 build 資料夾裡
- 安裝檔的設定位於 package.json 裡的 build 物件中，打包工具為 electron-builder

```bash
# 啟動命令提示字元(cmd)
於左下搜尋欄位輸入cmd開啟

# 進入專案資料夾
cd (你的專案位置)

# 建立安裝檔
npm run dist
```

## License

[MIT](https://github.com/winw1010/tataru-helper-node-v2/blob/main/LICENSE)

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

[<img src="https://github.com/winw1010/tataru-helper-node-v2/blob/main/src/html/img/qr/bmc_qr.png" alt="drawing" width="200"/>](https://www.buymeacoffee.com/winw1010)
