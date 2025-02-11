本專案為 Tataru Assistant 的翻譯對照表  
繁體中文翻譯: 巴哈姆特電玩資訊站 夜雪(winw1010)  
簡體中文翻譯: 夜北 yakita

##

### 文件架構

```
|-- ch   #中文修正文件
|    |--overwrite-en   #英文整句取代文件
|    |--overwrite-jp-hidden   #日文整句取代文件(隱藏)
|    |--overwrite-jp   #日文整句取代文件
|    |--after-translation-chs.json   #簡中翻譯後修飾
|    |--after-translation-cht.json   #繁中翻譯後修飾
|    |--jp-ch-name.json   #日文片假名音譯文件
|
|-- en   #英文修正文件
|    |--subtitle   #字幕修正文件
|    |--en1.json   #單字修正文件1
|    |--en2.json   #單字修正文件2
|    |--ignore.json   #無視清單(使用正規表達式)
|    |--uncountable.json   #不使用複數名之名詞清單
|
|---jp   #日文修正文件
|    |--hidden   #隱藏(不使用)
|    |--subtitle   #字幕修正文件
|    |--ignore.json   #無視清單(使用正規表達式)
|    |--jp1.json   #單字修正文件1
|    |--jp2.json   #單字修正文件2
|    |--kana.json   #假名文件
|    |--listCrystalium.json   #水晶都NPC列表
|    |--listDelete.json   #刪除清單
|    |--listHira.json   #強制平假名轉換清單
|    |--listReverse.json   #強制平/片假名轉換清單
|    |--special1.json   #特殊修正1(使用正規表達式)
|    |--special2.json   #特殊修正2(使用正規表達式)
|    |--title.json   #稱呼修正文件
|
|---main   #翻譯對照表(日/英/繁中/簡中)
|---non-ai   #非AI修正文件
|---readme   #Tataru Assistant使用說明書
|---signatures.json   #FFXIV劇情字幕位址
|---version.json   #Tataru Assistant版本文件
```

## 翻譯錯誤回報方式

於 Tataru Assistant 點選欲回報的字幕，然後點選【回報翻譯錯誤】按鈕
