import Head from 'next/head'
import styles from './layout.module.scss'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export const siteTitle = '基金收益'

export default function Layout ({ children, isNeedLogin }) {
  const [isValidUser, setIsValidUser] = useState(false)

  useEffect(() => {
    if (isNeedLogin) {
      const isPass = false
      setIsValidUser(isPass)
    } else {
      setIsValidUser(true)
    }
  }, [isNeedLogin])

  return (
    <div className={styles.container}>

      <Head>
        <link rel='icon' type='image/png' href='/favicon.png' />
        <meta name='description' content='瀏覽基金收益' />
        <meta
          property='og:image'
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name='og:title' content={siteTitle} />
        <meta name='twitter:card' content='summary_large_image' />
      </Head>

      {
        isValidUser
          ? <>{children}</>
          : (
            <Link href='/login'>
              <a>Back to Login Page</a>
            </Link>
            )
      }

    </div>
  )
}
