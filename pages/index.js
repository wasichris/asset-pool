import Head from 'next/head'
import Layout from '../components/Layout'

export default function Home () {
  const a = 'a'
  const b = 'b'

  if (a === b) {
    console.log('llll')
  }

  return (
    <Layout isNeedLogin>

      <Head>
        <title>Asset Pool</title>
      </Head>

      hihihio
    </Layout>
  )
}
