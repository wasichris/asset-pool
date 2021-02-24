import Head from 'next/head'
import Layout from '../../components/Layout'
import { Form, Input, Tooltip, Button, Card, message } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import firebase from 'firebase/app'
import { useRouter } from 'next/router'

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 8
    }
  },
  wrapperCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 16
    }
  }
}

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 16,
      offset: 8
    }
  }
}

export default function Register (props) {
  const router = useRouter()
  const [form] = Form.useForm()

  const onFinish = (values) => {
    const { email, password, nickname } = values

    // 透過 auth().createUserWithEmailAndPassword 建立使用者
    const database = firebase.database()
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(u => {
        // 取得註冊當下的時間
        const now = (new Date()).getTime()
        console.log('user:', u.user)

        // 記錄相關資訊到 firebase realtime database
        database.ref(`users/${u.user.uid}`).set({
          signup: now,
          email,
          nickname
        }).then(() => {
          // 儲存成功後顯示訊息
          message.info('註冊用戶成功，請登入系統。')
          router.push('/login')
        })
      }).catch(error => {
        // 註冊失敗時顯示錯誤訊息
        let errorMsg = ''
        switch (error.code) {
          case 'auth/invalid-email':
            errorMsg = '電子信箱格式錯誤'
            break
          case 'auth/email-already-in-use':
            errorMsg = '此電子信箱用戶已存在'
            break
          case 'auth/operation-not-allowed':
            errorMsg = '未啟用 email/password 授權機制 (系統設置)'
            break
          case 'auth/weak-password':
            errorMsg = '密碼強度不足'
            break

          default:
            errorMsg = error.code + ':' + error.message
        }
        message.error('註冊失敗: ' + errorMsg)
      })
  }

  return (
    <Layout noBg>

      <Head>
        <title>Register</title>
      </Head>

      <div className='center-wraper'>
        <Card title='Asset Pool - Register' className='register-card'>
          <Form
            {...formItemLayout}
            form={form}
            name='register'
            onFinish={onFinish}
            initialValues={{}}
            scrollToFirstError
          >
            <Form.Item
              name='email'
              label='E-mail'
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
              <Input />
            </Form.Item>

            <Form.Item
              name='password'
              label='Password'
              rules={[
                {
                  required: true,
                  message: 'Please input your password!'
                },
                ({ getFieldValue }) => ({
                  validator (_, value) {
                    if (!value || value.length >= 6) {
                      return Promise.resolve()
                    }
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject('Password should be at least 6 characters')
                  }
                })
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name='confirm'
              label='Confirm Password'
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!'
                },
                ({ getFieldValue }) => ({
                  validator (_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject('The two passwords that you entered do not match!')
                  }
                })
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name='nickname'
              label={
                <span>
                  Nickname&nbsp;
                  <Tooltip title='What do you want others to call you?'>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              rules={[{ required: true, message: 'Please input your nickname!', whitespace: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
              <Button type='primary' htmlType='submit'>
                Register
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

    </Layout>
  )
}
