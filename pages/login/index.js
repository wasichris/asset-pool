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

  return (
    <Layout noBg>

      <Head>
        <title>Login</title>
      </Head>

      <div className='center-wraper'>
        <Card title='Asset Pool - Login' className='login-card'>

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
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!'
                },
                {
                  required: true,
                  message: 'Please input your E-mail!'
                }
              ]}
            >

              <AutoComplete
                options={userMailList}
                filterOption={(inputValue, option) =>
                  option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
              >
                <Input prefix={<MailOutlined className='site-form-item-icon' />} placeholder='E-mail' size='large' />
              </AutoComplete>
            </Form.Item>

            <Form.Item
              name='password'
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input
                prefix={<LockOutlined className='site-form-item-icon' />}
                type='password'
                placeholder='Password'
                size='large'
              />
            </Form.Item>
            <Form.Item>
              <Form.Item name='remember' valuePropName='checked' noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' className='login-form-button'>
                Log in
              </Button>
              Or
              <Link href='/register'>
                <a> register now!</a>
              </Link>
            </Form.Item>
          </Form>

        </Card>
      </div>

    </Layout>
  )
}
