# 小導演任務：短影音剪輯 × AI 互動課

作者 Mr.Bill。

## 上傳 GitHub Pages

解壓縮後，把這個資料夾裡的全部檔案放在 GitHub 儲存庫根目錄（入口是 index.html），不要只上傳 lesson1.html。這是靜態教材，不需要安裝或建置。

在儲存庫 Settings → Pages 選擇 Deploy from a branch，選擇你的分支與根目錄，保存後使用 GitHub 提供的網站網址。若帳號或儲存庫條件不同，以 GitHub Pages 官方說明為準。

## 後續新增課程

1. 第二堂已完成：lesson2.html（拆解高手作品）。
2. 新增第三堂時，建立 lesson3.html，再複製一個 courses.js 項目，設定 number 與 href。全部使用相對路徑，所以儲存庫名稱改變也能使用。
3. 課程頁都要在 `</head>` 前保留 `auth.js` 與 `CourseGate.guardLesson()`，以及 `toolbox.js`（要用工具箱才需要）。

第一堂：lesson1.html；第二堂：lesson2.html；首頁：index.html。

## 導演工具箱

toolbox.js 是純前端小工具，在課程頁右下角有「🧰 工具箱」按鈕，點開可使用：Hook 產生器、三格腳本、字幕建議器、節奏標記器、AI 指令產生器、拆片檢核表、簡繁轉換。不連網、不送資料。

## AI 指令與規範

- `prompts/`：給孩子用的固定格式 AI 指令範本，只要改題材與觀眾兩個欄位。
- `guide/`：剪輯 SOP、字幕規則、AI 使用原則的 .md 規範，同時是上課講義。

## 授課互動

- 左右拖動頁面空白處換頁；按鈕與鍵盤也可換頁。
- 每段答案可拖動滑桿逐步拉開。
- 第 5 段有真實時間／影片時間滑動比較。
- 第 6 段拖曳流程階段到正確位置。
- 第 8 段拖素材到時間軸，再拖曳調整順序；播放分鏡會依你排列的順序。
- 第 9 段拖曳故事名稱到遊戲事件，按檢查看理由。

拖曳也支援觸控；鍵盤與按鈕替代操作保留。文字分鏡預演不是遊戲實拍影片。教材與互動可離線使用，外部示範連結需要網路。重新整理會清除作答；三格腳本可下載保存。

官方說明：[GitHub Pages 建立網站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## 圖片教材

圖片已隨套件放在 assets/，請一起上傳。點圖可放大觀察，來源見「圖片來源.md」。名詞解釋、答案面板、拖曳活動與課程目錄維持不變。
