import Head from 'next/head'
import Layout from '../../components/Layout'
import { Card, Form, Input, Button, Checkbox, message, AutoComplete } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import firebase from 'firebase/app'

export default function Login (props) {
  const router = useRouter()
  const [form] = Form.useForm()
  const [userMailList, setUserMailList] = useState([])

  useEffect(() => {
    const localUserMail = window.localStorage.getItem('userMail')
    if (localUserMail) {
      form.setFieldsValue({ email: localUserMail.trim() })
    }

    const localUserMailList = window.localStorage.getItem('userMailList')
    if (localUserMailList) {
      setUserMailList(JSON.parse(localUserMailList.trim()))
    }
  }, [form])

  const handleLogin = async (values) => {
    const { email, password, remember } = values

    try {
      // login firebase by email & password
      await firebase.auth().signInWithEmailAndPassword(email, password)

      // remember mail info in local
      if (remember) {
        window.localStorage.setItem('userMail', email)
        const isExist = userMailList.find(m => m.value.toLowerCase() === email.toLowerCase())
        if (!isExist) {
          const newUserMailList = [...userMailList, { value: email.toLowerCase() }]
          setUserMailList(newUserMailList)
          window.localStorage.setItem('userMailList', JSON.stringify(newUserMailList))
        }
      } else {
        window.localStorage.setItem('userMail', '')
        window.localStorage.setItem('userMailList', '')
      }

      router.push('/')
    } catch (error) {
      let errorMsg = ''
      switch (error.code) {
        case 'auth/invalid-email':
          errorMsg = '電子信箱格式錯誤'
          break
        case 'auth/user-disabled':
          errorMsg = '此用戶已失效'
          break
        case 'auth/user-not-found':
          errorMsg = '此用戶不存在'
          break
        case 'auth/wrong-password':
          errorMsg = '密碼錯誤'
          break

        default:
          errorMsg = error.code + ':' + error.message
      }
      message.error('登入失敗: ' + errorMsg)
    }
  }

  const handleForgetPwd = () => {
    const email = form.getFieldValue('email')
    if (email) {
      firebase.auth().sendPasswordResetEmail(email)
        .then(function () {
          message.info('密碼重設信件已寄出，請依照信中連結進行重設。')
        })
        .catch(function (error) {
          let errorMsg = ''
          switch (error.code) {
            case 'auth/invalid-email':
              errorMsg = '電子信箱格式錯誤'
              break
            case 'auth/user-not-found':
              errorMsg = '此用戶不存在'
              break
            default:
              errorMsg = error.code + ':' + error.message
          }
          message.error('忘記密碼: ' + errorMsg)
        })
    } else {
      message.warn('請輸入電子信箱')
    }
  }

  return (
    <Layout noBg>

      <Head>
        <title>Login</title>
      </Head>

      <div className='center-wraper'>
        <Card title='Asset Pool - 登入' className='login-card'>

          <Form
            name='normal_login'
            className='login-form'
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            form={form}
          >

            <Form.Item
              name='email'
              rules={[
                { type: 'email', message: '格式錯誤' },
                { required: true, message: '請輸入電子信箱' }
              ]}
            >

              <AutoComplete
                options={userMailList}
                filterOption={(inputValue, option) =>
                  option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
              >
                <Input prefix={<MailOutlined className='login-card__icon' />} placeholder='E-mail' size='large' />
              </AutoComplete>
            </Form.Item>

            <Form.Item
              name='password'
              rules={[{ required: true, message: '請輸入密碼' }]}
            >
              <Input
                prefix={<LockOutlined className='login-card__icon' />}
                type='password'
                placeholder='Password'
                size='large'
              />
            </Form.Item>
            <Form.Item>
              <Form.Item name='remember' valuePropName='checked' noStyle>
                <Checkbox>記住我的帳號</Checkbox>
              </Form.Item>
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' className='login-card__button'>
                登入
              </Button>
              <Link href='/register'>
                <a> 立即註冊 </a>
              </Link>
              或
              <a onClick={handleForgetPwd}> 忘記密碼</a>
            </Form.Item>
          </Form>

        </Card>
      </div>

    </Layout>
  )
}
