import Head from 'next/head'
import Layout from '../components/Layout'
import { withIronSession } from 'next-iron-session'

function SessionTest (/* { user } */) {
  // const dosomthing = () => {
  //   // const url = '/api/login'
  //   // const { data: { loginStatus, msg, userUid } } = await axios.post(url, { email, password })
  //   // if (loginStatus) {
  //   //   message.info('成功登入')
  //   //   await firebase.auth().signInWithEmailAndPassword(email, password) // oh no
  //   //   console.log(userUid)
  //   //   router.push('/')
  //   // } else {
  //   //   message.error('登入失敗: ' + msg)
  //   // }
  // }

  return (
    <Layout>

      <Head>
        <title>Session Test</title>
      </Head>

      <h1>Session Test</h1>

    </Layout>
  )
}

export const getServerSideProps = withIronSession(
  async ({ req, res }) => {
    // 從 session 中取出 user 資料
    const user = req.session.get('user')

    if (!user) {
      res.setHeader('location', '/login')
      res.statusCode = 302
      res.end()

      return { props: {} }
    }

    return {
      props: { user }
    }
  },
  {
    password: process.env.APPLICATION_SECRET,
    cookieName: process.env.APPLICATION_COOKIENAME,
    // if your localhost is served on http:// then disable the secure flag
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'
    }
  }
)

export default SessionTest
