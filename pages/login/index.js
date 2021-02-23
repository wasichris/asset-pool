import Head from 'next/head'
import Layout from '../../components/Layout'
import { Card, Form, Input, Button, Checkbox, message } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import axios from 'axios'

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
    console.log('Success:', values)
    const { email, password, remember } = values

    window.localStorage.setItem('userMail', remember ? email : '')

    const url = '/api/login'
    const { data: { loginStatus, msg, userUid } } = await axios.post(url, { email, password })
    if (loginStatus) {
      message.info('成功登入')
      console.log(userUid)
      router.push('/')
    } else {
      message.error('成功失敗:' + msg)
    }
  }

  return (
    <Layout>

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
              Or <a href='/register'>register now!</a>
            </Form.Item>
          </Form>

        </Card>
      </div>

    </Layout>
  )
}
