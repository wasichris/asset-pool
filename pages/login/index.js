import Head from 'next/head'
import Layout from '../../components/Layout'
import { Card, Form, Input, Button, Checkbox, message } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
// import axios from 'axios'
import Link from 'next/link'
import firebase from 'firebase/app'

export default function Login (props) {
  const router = useRouter()
  const [form] = Form.useForm()

  useEffect(() => {
    const localUserMail = window.localStorage.getItem('userMail')
    if (localUserMail) {
      form.setFieldsValue({ email: localUserMail })
    }
  }, [form])

  const onFinish = async (values) => {
    const { email, password, remember } = values

    try {
      // validate email & password with firebase  (僅作驗證，若要在後端存取資料是使用 firebase admin SDK)
      await firebase.auth().signInWithEmailAndPassword(email, password)
      window.localStorage.setItem('userMail', remember ? email : '')
      router.push('/')
    } catch (error) {
      let errorMsg = ''
      switch (error.code) {
        case 'auth/user-not-found':
          errorMsg = '此用戶不存在'
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
            onFinish={onFinish}
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
              <Input prefix={<MailOutlined className='site-form-item-icon' />} placeholder='E-mail' size='large' />
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
