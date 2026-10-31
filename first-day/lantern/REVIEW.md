# 街坊故事試作：今晚，巷口留一盞燈

2026-10-31。供審閱與試玩，尚未合併或上線。

## 這次解決什麼

既有街區的主要互動是開場、選一句話、得到知識或任務線索。台南素材雖已存在，仍容易被感受為獨立的問答與選讀。本章以同一個街坊聚會貫穿角色、地方與玩家動作；地方介紹直接進入途中敘事，不要求先另開台南專區。

玩家幫阿荷完成一張邀請卡，先找博伯或沫沫皆可；另一位會回應遊玩順序。博伯引出北勢街、五條港與街屋，沫沫引出金華府的街屋廟宇及今天的居民。小船／木窗、搬椅／聊天、收畫紙／移長椅、邀請語會影響後續台詞、邀請卡與結尾相聚位置。可以坐著歇一下、回上一刻、重玩。沒有對錯分數、倒數、答題通關或強制公司導流。

入口現在先顯示原街區 SVG 圖與原人物小安、阿荷、博伯、沫沫。點人物先看到角色介紹，再按按鈕進入故事；找鄰居階段可從地圖選擇先拜訪誰。「回街區地圖」為同頁切換，保留所有故事選擇；原版街區另有明確標示的新分頁連結。神農街、金華府的地方介紹也直接放在地圖內。

故事場景加入在場人物立繪、姓名與說話者頭像，聚會時四人同框。沿用原街區的角色造型，沒有額外即時 3D／WebGL。這是地圖入口加固定場景的互動故事試作，尚非新的自由走動引擎。已做 17 個主線節點及 1 個可選休息節點；256 個可完成的選擇組合是測試覆蓋，並非 256 段不同故事。

## 地方事實與創作分開

- 神農街的舊稱、河港背景與二層鋪瓦街屋：國家文化記憶庫，臺南市政府文化局建檔，https://tcmb.culture.tw/zh-tw/detail?id=273628&indexCode=Culture_Place
- 金華府的街屋型態及夾於街屋之間：內政部臺灣宗教文化地圖，https://taiwangods.moi.gov.tw/Religious_Culture/html/Cultural/3_0011.aspx?i=240
- 查核日：2026-10-31。這不是來源發布或法律施行日期。
- 小安、阿荷、博伯、沫沫、文具店、聚會、對話與天候為創作。場景不是神農街實景復刻、精確地圖或步行路線。

## 技術與退路

新增 `first-day/lantern/`；既有 `first-day/index.html` 僅增加「街坊故事試玩」連結。原街區、購屋／換屋／賣屋／傳承引擎、稅務與房貸公式、原進度與回饋服務皆不變。本章僅用獨立 key `anxin-lantern-story-v1` 儲存經過驗證的行動序列，資料不可用時回到開場；無後端、追蹤、身分或個案資料。複製卡片僅在玩家點擊時使用剪貼簿，失敗可手動選取。

退回方式：移除單一入口連結即可撤下試玩；如需完全移除，再刪除 `first-day/lantern/`。不需變更既有存檔或計算資料。此 PR 不要求合併即取代原首頁。

## 驗證與待驗收

- `node first-day/lantern/test-story.mjs`：256 組完整路徑、角色先後回應、卡片內容、回上一步／重玩、破損／異版本存檔。
- 實際嵌入腳本搭配 HTML 解析後的 DOM 事件模擬：選角色、休息、地方說明、天候／夜景、邀請卡、重玩皆通過。
- 補測：預設地圖、人物圖引用、點人物再進場、故事→地圖→故事進度保留、地圖內選擇拜訪鄰居、文化介紹開關、說話者及聚會人物顯示。
- JS 語法檢查通過。
- 尚未完成真實瀏覽器版面與手機手感驗收；瀏覽器安全政策不允許 data: 本機預覽，本輪未繞過限制。
- 待人測：未讀說明能否開始、玩後能否說出一個台南特色、是否記得一位鄰居及自己做過的事、是否想繼續。以上是驗收問題，未宣稱已收集使用者證據。

下一個決策：先驗收地圖入場、人物辨識、來回切換與手機版面，再把同一事件鏈帶回原自由走動街區的 NPC 互動，不直接批量擴寫 37 區。原主頁地圖保留，本 PR 不移除或改寫原地圖。

## 美術來源

`assets/street-map.svg` 及 `xiaoan.svg / aho.svg / bo.svg / momo.svg` 均直接由既有 `first-day/street-art.js` 的 `streetSceneArt('lane')`、`personArt()` 匯出，保留既有角色設計；來源版本 `f5a837367a14af5ddd115febbc20f11e7509be63`，未改原美術模組。

`assets/tainan-lane.webp` 為本次以內建 image_gen 生成的原創背景，僅轉為 WebP 以供網頁使用；未改變內容。不是現地照片。

生成提示：Use case: illustration-story. Original background for a cozy Taiwanese neighborhood story game. A richly atmospheric imaginary narrow lane inspired by the two-story historic shophouses of Shennong Street, Tainan, at late afternoon just after rain. Warm lanterns, muted jade shadows, hand-painted storybook atmosphere, open stationery shop with paper and pencils on the left, aged red-brick and pale plaster shophouses with wooden upper windows and tiled eaves, a wooden bench and empty display easel on the right, inviting wet stone lane. No prominent people, no lettering, no UI, no logos, no watermark, no exact historical reconstruction. Calm lived-in Taiwan, with room for a newcomer to belong.
