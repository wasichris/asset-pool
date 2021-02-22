import Head from 'next/head'
import Layout from '../../components/Layout'
import { Card, Form, Input, Button, Checkbox, message } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import firebase from 'firebase/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Login (props) {
  const router = useRouter()
  const [form] = Form.useForm()

  useEffect(() => {
    const localUserMail = window.localStorage.getItem('userMail')
    if (localUserMail) {
      form.setFieldsValue({ email: localUserMail })
    }
  }, [form])

  const onFinish = (values) => {
    console.log('Success:', values)
    const { email, password, remember } = values

    window.localStorage.setItem('userMail', remember ? email : '')

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user
        console.log(user)
        message.info('成功登入')
        router.push('/fund')
        // ...
      })
      .catch((error) => {
        message.error(error.code + ':' + error.message)
      })
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
