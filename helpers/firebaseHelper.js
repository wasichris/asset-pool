
// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app'

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics'

// Add the Firebase products that you want to use
import 'firebase/database'
import 'firebase/auth' // 有用到要記得加，不然在使用 auth 會 undefined

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDFQW_ml1MLdG1pHN9eX8hOnEAQiNhluWs',
  authDomain: 'asset-pool.firebaseapp.com',
  databaseURL: 'https://asset-pool-default-rtdb.firebaseio.com',
  projectId: 'asset-pool',
  storageBucket: 'asset-pool.appspot.com',
  messagingSenderId: '239900430969',
  appId: '1:239900430969:web:ee98bf5acc0eecc5083aa8',
  measurementId: 'G-4QM3SBTXGT'
}

const initFirebase = () => {
  // preventing Next.js from accidentally re-initalizing your SDK when Next.js hot reloads your application!
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
  } else {
    firebase.app() // if already initialized, use that one
  }
}

export default { initFirebase }
