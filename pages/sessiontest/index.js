import Head from 'next/head'
import Layout from '../../components/Layout'
import { withIronSession } from 'next-iron-session'

function SessionTest ({ user }) {
  return (
    <Layout>

      <Head>
        <title>Session Test</title>
      </Head>

      <h1>Session Test</h1>
      <div>call api/hello?name=xxxx to save name:xxx as user in session</div>
      <div>current user.name = {user && user.name}</div>
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
