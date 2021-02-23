
// API Routes let you create an API endpoint inside a Next.js app.
// You can do so by creating a function inside the pages/api directory that
// has the following format:
import firebase from 'firebase/app'
import { withIronSession } from 'next-iron-session'

async function handler (req, res) {
  // req data
  const { body: { email, password } } = req
  let returnData = { loginStatus: true, msg: '' }

  try {
    const { user } = await firebase.auth().signInWithEmailAndPassword(email, password)
    returnData = { loginStatus: true, msg: '', userUid: user.uid }

    // login success and keep data in session
    req.session.set('user', { uid: user.uid, email })
    await req.session.save()
  } catch (error) {
    console.log(error)
    returnData = { loginStatus: false, msg: error.code + ':' + error.message, userUid: '' }
  }

  // parser
  console.log('returnData', returnData)
  res.status(200).json(returnData)
}

export default withIronSession(handler, {
  password: process.env.APPLICATION_SECRET,
  cookieName: process.env.APPLICATION_COOKIENAME,
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
})
