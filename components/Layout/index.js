import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useRouter } from 'next/router'
import { LogoutOutlined } from '@ant-design/icons'
import firebase from 'firebase/app'

export const siteTitle = '基金收益'

export default function Layout ({ children, user, noBg, isHide }) {
  const [hasHeader, setHasHeader] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setHasHeader(!!user)
  }, [user])

  const handleLogout = async () => {
    await firebase.auth().signOut()
    router.push('/login')
  }

  return (
    <div className={noBg ? 'container' : 'container bg-light-grey'}>

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

      {!isHide &&
        <>
          {hasHeader &&
            <div className='header'>

              <div className='header__logo'>
                <span>Asset Pool</span>
              </div>

              <div className='header__logout'>
                <Button onClick={handleLogout} size='small' icon={<LogoutOutlined />}>
                  <span className='header__logout-text'> Logout </span>
                </Button>
              </div>

              <div className='header__username'>
                Hi, {user.nickname}
              </div>

            </div>}

          <div className='main'>
            {children}
          </div>
        </>}

    </div>
  )
}
