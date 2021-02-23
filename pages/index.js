import Head from 'next/head'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import axios from 'axios'
import { Modal, Button, Input, Form, InputNumber, message, Select, Space } from 'antd'
import firebase from 'firebase/app'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { withIronSession } from 'next-iron-session'

const { Option } = Select
const { TextArea } = Input

function Home ({ user }) {
  const [isShowAddFundModal, setIsShowAddFundModal] = useState(false)
  const [isShowImportFundModal, setIsShowImportFundModal] = useState(false)
  const [fundDetails, setFundDetails] = useState([])
  const [myFunds, setMyFunds] = useState([])
  const [fundOptions, setFundOptions] = useState([])
  const [isLogin, setIsLogin] = useState(false)
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState('')
  const [targetUpdateFund, setTargetUpdateFund] = useState({})
  const [isShowUpdateFundModal, setIsShowUpdateFundModal] = useState(false)
  const [form] = Form.useForm()

  // Why Is Window Not Defined In NextJS?
  // 放到 useState(JSON.parse(window.localStorage.getItem("funds"))) 就炸了
  // https://medium.com/frontend-digest/why-is-window-not-defined-in-nextjs-44daf7b4604e
  useEffect(() => {
    // setMyFunds(loadMyFunds())
    // const loginUser = firebase.auth().currentUser
    // console.log('%c loginUser ', 'background-color: #3A88AE; color: white;font-size: 14px; font-weight: bold;', loginUser)

    const localUserName = window.localStorage.getItem('userName')
    if (localUserName) {
      setUserName(localUserName)
      // login()
    }
  }, [])

  useEffect(() => {
    async function fetchData () {
      if (myFunds == null || myFunds.length === 0) {
        return
      }

      const newFundDetails = []
      const apiResonses = []

      // call all api to get current prices at the same time
      setIsLoading(true)
      for (const myFund of myFunds) {
        const url = '/api/fund?id=' + myFund.id + '&type=' + myFund.type + '&key=' + myFund.key
        apiResonses.push(axios.get(url))
      }

      // wait for all prices back
      Promise.all(apiResonses)
        .then(responses => {
          // deal with each api response to get the current price
          responses.forEach(response => {
            const { data } = response
            const fund = myFunds.find(f => f.key === data.key)
            if (fund) {
              newFundDetails.push({
                key: fund.key,
                id: fund.id,
                name: fund.name,
                price: fund.price,
                currentPrice: data.price,
                returnRate: Math.round(((data.price - fund.price) / fund.price) * 10000) / 100
              })
            }
          })

          setFundDetails(newFundDetails)
        })
        // eslint-disable-next-line node/handle-callback-err
        .catch(error => { message.error('無法取得參考淨值') })
        .finally(() => { setIsLoading(false) })
    }

    fetchData()
  }, [myFunds])

  const loadMyFunds = async () => {
    const db = firebase.database()
    const eventref = db.ref(userName + '/myFunds')
    const snapshot = await eventref.once('value')
    const myFunds = snapshot.val()

    return myFunds || []
  }

  const saveMyFunds = (newFunds) => {
    const db = firebase.database()
    const eventref = db.ref(userName + '/myFunds')
    eventref.set(newFunds)
  }

  const closeAddFundModal = () => {
    setIsShowAddFundModal(false)
  }

  const closeUpdateFundModal = () => {
    setIsShowUpdateFundModal(false)
  }

  const addFund = (values) => {
    const { fundid, fundprice } = values
    const fundname = fundOptions.find(f => f.id === fundid).name.trim()
    const fundtype = fundOptions.find(f => f.id === fundid).type.trim()
    const newFunds = [...myFunds]
    newFunds.push({ key: fundid + '-' + (new Date()).getTime(), id: fundid, name: fundname, price: fundprice, type: fundtype })
    setMyFunds(newFunds)
    saveMyFunds(newFunds)
    closeAddFundModal()
  }

  const removeFund = (key) => {
    let newFunds = [...myFunds]
    newFunds = newFunds.filter(f => f.key !== key)
    setMyFunds(newFunds)
    saveMyFunds(newFunds)
  }

  const showUpdateFundModal = (key) => {
    const targetFund = myFunds.find(f => f.key === key)
    setTargetUpdateFund(targetFund)
    form.setFieldsValue({ ...targetFund })
    setIsShowUpdateFundModal(true)
  }

  const updateFund = (values) => {
    const { key, id, name, price, type } = values
    const updatedFundIndex = myFunds.findIndex(myFund => myFund.key === key)
    const newFunds = [...myFunds]
    newFunds[updatedFundIndex] = { key, id, name, price, type }
    setMyFunds(newFunds)
    saveMyFunds(newFunds)
    closeUpdateFundModal()
  }

  const onSelectSearch = async (val) => {
    if (val && val.length > 0) {
      const url = '/api/fundquery?name=' + val
      const { data } = await axios.get(url)
      const options = data.map(d => ({ name: d.name, id: d.id, type: d.type }))
      setFundOptions(options)
    }
  }

  const exportMyFunds = async () => {
    const fundJson = JSON.stringify(await loadMyFunds())
    copyTextToClipboard(fundJson)
  }

  function copyTextToClipboard (text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text)
      return
    }

    navigator.clipboard.writeText(text).then(function () {
      message.info('已成功匯出至剪貼簿')
    }, function (err) {
      message.info('匯出失敗，請使用電腦執行匯出作業。(' + err + ')')
    })
  }

  function fallbackCopyTextToClipboard (text) {
    const textArea = document.createElement('textarea')
    textArea.value = text

    // Avoid scrolling to bottom
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      const msg = successful ? 'successful' : 'unsuccessful'
      console.log('Fallback: Copying text command was ' + msg)
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err)
    }

    document.body.removeChild(textArea)
  }

  const closeImportFundModal = () => {
    setIsShowImportFundModal(false)
  }

  const importMyFunds = (values) => {
    const { fundlist } = values
    const localFunds = JSON.parse(fundlist.trim())
    saveMyFunds(localFunds)
    setMyFunds(localFunds)
    closeImportFundModal()
  }

  const login = async () => {
    window.localStorage.setItem('userName', userName)
    setIsLogin(true)
    setMyFunds(await loadMyFunds())
  }

  const logout = async () => {
    setIsLogin(false)
    setMyFunds([])
    setFundDetails([])
  }

  const userNameChanged = (e) => {
    const loginUserName = e.target.value
    setUserName(loginUserName ? loginUserName.toLowerCase() : '')
  }

  return (
    <Layout user={user}>

      <Head>
        <title>基金損益表</title>
      </Head>

      <h1>基金損益表</h1>

      <div>
        <Space>

          <Input value={userName} onPressEnter={login} disabled={isLogin} placeholder='請輸入您的帳號' onChange={userNameChanged} />
          {isLogin
            ? <Button type='button' onClick={logout}>登出</Button>
            : <Button type='button' onClick={login}>登入</Button>}

        </Space>

      </div>

      <br />

      {isLogin &&
        <>

          <div>

            {/* 功能鍵區塊 */}
            <Space>
              <Button type='button' onClick={exportMyFunds}>匯出</Button>
              <Button type='button' onClick={() => setIsShowImportFundModal(true)}>匯入</Button>
              <Button type='button' onClick={() => setIsShowAddFundModal(true)}>新增我的基金</Button>
            </Space>
          </div>

          <br />

          {/* 基金清單 */}
          <div>

            <table className='fund-table'>

              <thead>
                <tr>
                  <th>基金名稱</th>
                  <th>申購淨值</th>
                  <th>參考淨值</th>
                  <th>報酬率</th>
                  <th />
                </tr>
              </thead>

              <tbody>

                {!isLoading && fundDetails && fundDetails.map(f => {
                  return (
                    <tr key={f.key}>
                      <td>{f.name}</td>
                      <td>{f.price}</td>
                      <td>{f.currentPrice}</td>
                      <td className={f.returnRate > 0 ? 'red' : 'green'}>{f.returnRate}%</td>
                      <td>
                        <Button type='button' onClick={() => removeFund(f.key)} icon={<DeleteOutlined />} />
                        <Button type='button' onClick={() => showUpdateFundModal(f.key)} icon={<EditOutlined />} />
                      </td>
                    </tr>
                  )
                })}

                {isLoading && (
                  <tr>
                    <td colSpan='5'> 資料讀取中... </td>
                  </tr>
                )}

              </tbody>
            </table>

          </div>

        </>}

      {/* 新增基金 */}

      <Modal
        visible={isShowAddFundModal}
        title='新增基金'
        onCancel={closeAddFundModal}
        footer={null}
      >
        <Form
          name='basic'
          initialValues={{}}
          onFinish={addFund}
        >

          <Form.Item
            label='基金名稱'
            name='fundid'
            rules={[{ required: true, message: 'Please select your fundname!' }]}
          >
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder='Select a fund'
              optionFilterProp='children'
              onSearch={onSelectSearch}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {fundOptions && fundOptions.map(f => {
                return <Option key={f.id} value={f.id} disabled={f.type === '3'}>{f.name}</Option>
              })}

            </Select>
          </Form.Item>

          <Form.Item
            label='申購淨值'
            name='fundprice'
            rules={[{ required: true, message: 'Please input your fundprice!' }]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit'> 新增 </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改基金 */}

      <Modal
        visible={isShowUpdateFundModal}
        title='修改基金'
        onCancel={closeUpdateFundModal}
        footer={null}
      >
        <Form
          form={form}
          name='basic'
          onFinish={updateFund}
        >

          <Form.Item
            label='基金ID及流水號'
            name='key'
            hidden
            rules={[{ required: true, message: 'Please input your key!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='基金名稱'
            name='name'
            hidden
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='基金類型'
            name='type'
            hidden
            rules={[{ required: true, message: 'Please input your type!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='基金ID'
            name='id'
            hidden
            rules={[{ required: true, message: 'Please input your id!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='基金名稱'
          >
            {targetUpdateFund.name && targetUpdateFund.name}
          </Form.Item>

          <Form.Item
            label='申購淨值'
            name='price'
            rules={[{ required: true, message: 'Please input your fundprice!' }]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit'> 修改 </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 匯入我的基金 */}
      <Modal
        visible={isShowImportFundModal}
        title='匯入我的基金'
        onCancel={closeImportFundModal}
        footer={null}
      >
        <Form
          name='basic'
          initialValues={{ remember: true }}
          onFinish={importMyFunds}
        >

          <Form.Item
            label='我的基金'
            name='fundlist'
            rules={[{ required: true, message: 'Please input your fund list!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit'> 匯入 </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export const getServerSideProps = withIronSession(
  async ({ req, res }) => {
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

export default Home
