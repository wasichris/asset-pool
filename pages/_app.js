// This App component is the top-level component which will be common across all the different pages.
// You can use this App component to keep state when navigating between pages, for example.

// you can add app CSS files by importing them from pages/_app.js.
// You cannot import app CSS anywhere else.
import 'antd/dist/antd.css'
import '../styles/app.scss'

import firebaseHelper from '../helpers/firebaseHelper.js'

export default function App ({ Component, pageProps }) {
  // 初始 firebase
  firebaseHelper.initFirebase()

  return (
    <>
      {/* 整個APP共用的畫面可以擺在這邊喔!! */}
      <Component {...pageProps} />
    </>
  )
}
