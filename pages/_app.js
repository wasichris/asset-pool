// This App component is the top-level component which will be common across all the different pages.
// You can use this App component to keep state when navigating between pages, for example.

// you can add app CSS files by importing them from pages/_app.js.
// You cannot import app CSS anywhere else.
import '../styles/app.scss'
import 'antd/dist/antd.css' // or 'antd/dist/antd.less'

import firebaseHelper from '../helpers/firebaseHelper.js'

export default function App ({ Component, pageProps }) {
  // 初始 firebase
  firebaseHelper.initFirebase()

  console.log((new Date()).toString())
  return (
    <>
      {/* 整個APP共用的畫面可以擺在這邊喔!! */}
      <Component {...pageProps} />
    </>
  )
}
