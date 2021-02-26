# Asset Pool #
提供各基金即時價格，並具損益運算功能，方便統整各銀行購入之基金項目。 

<br>

# Tech Stack #
專案主要使用的相關技術如下：  
* next.js
  + 網站主體
  + 提供基金清單 API (爬取公開資訊)
  + 提供基金現價 API (爬取公開資訊)

* firebase
  + 全站用戶管理 (Email/Password)
  + 基金資料存取 (Realtime Database)
  + 限制僅能修改個人uid轄下資料

<br>

# Screenshots #
登入系統  
<img src="https://raw.githubusercontent.com/wasichris/asset-pool/main/public/readme/mobile-login.png" width="300px">

註冊帳號  
<img src="https://raw.githubusercontent.com/wasichris/asset-pool/main/public/readme/mobile-register.png" width="300px">

主畫面 - mobile  
<img src="https://raw.githubusercontent.com/wasichris/asset-pool/main/public/readme/mobile-funds.png" width="300px">

主畫面 - pc  
<img src="https://raw.githubusercontent.com/wasichris/asset-pool/main/public/readme/pc-funds.png" width="800px">