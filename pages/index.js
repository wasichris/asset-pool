import Head from 'next/head'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import axios from 'axios'
import { Modal, Button, Input, Form, InputNumber, message, Select, Space, List, Typography, DatePicker } from 'antd'
import firebase from 'firebase/app'
import { DeleteTwoTone, EditTwoTone } from '@ant-design/icons'
import { useRouter } from 'next/router'
import debounce from 'lodash/debounce'
import moment from 'moment'

const { Option } = Select
const { TextArea } = Input

const round = (value) => Math.round(value * 100) / 100

const getReturnRatePercentage = ({ price, currentPrice }) => {
  if (price && currentPrice) {
    const returnRate = (currentPrice - price) / price
    return round(returnRate * 100)
  }

  return ''
}

const getReturnRateWithInterestPercentage = ({ price, currentPrice, amount, interest }) => {
  if (price && currentPrice && amount && interest) {
    const returnRate = (currentPrice - price) / price
    const returnAmount = amount * returnRate
    const returnRateWithInterest = (returnAmount + interest) / amount
    return round(returnRateWithInterest * 100)
  }

  return ''
}

const formatCurrency = (num) => {
  if (num) {
    const parts = num.toString().split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }

  return ''
}

function Home () {
  const [isLogin, setIsLogin] = useState(false)
  const [user, setUser] = useState(null)

  const [isShowAddFundModal, setIsShowAddFundModal] = useState(false)
  const [isShowImportFundModal, setIsShowImportFundModal] = useState(false)
  const [fundDetails, setFundDetails] = useState([])
  const [myFunds, setMyFunds] = useState([])
  const [fundOptions, setFundOptions] = useState([])
  const [isLoading, setIsLoading] = useState('')
  const [targetUpdateFund, setTargetUpdateFund] = useState({})
  const [isShowUpdateFundModal, setIsShowUpdateFundModal] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        setIsLogin(true)
        setUser({ uid: user.uid, email: user.email })
      } else {
        router.push('/login')
      }
    })

    return function cleanup () {
      unsubscribe()
    }
  }, [router])

  useEffect(() => {
    async function setupMyFunds () {
      if (user) {
        setMyFunds(await loadMyFunds(user.uid))
      }
    }

    setupMyFunds()
  }, [user])

  useEffect(() => {
    async function fetchData () {
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
              const { key, id, name, date, amount, price, interest } = fund
              const currentPrice = data.price
              const currentPriceRefDate = data.refdate
              newFundDetails.push({
                key: key,
                id: id,
                name: name,
                date: date,
                amount: amount,
                price: price,
                currentPrice: currentPrice,
                currentPriceRefDate: currentPriceRefDate,
                returnRate: getReturnRatePercentage({ price, currentPrice }),
                returnAmount: (amount && currentPrice) ? round(amount * ((currentPrice - price) / price)) : '',
                interest: interest,
                returnRateWithInterest: getReturnRateWithInterestPercentage({ price, currentPrice, amount, interest })
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

  const loadMyFunds = async (uid) => {
    const db = firebase.database()
    const eventref = db.ref(`users/${uid}/funds`)
    const snapshot = await eventref.once('value')
    const myFunds = snapshot.val()

    return myFunds || []
  }

  const saveMyFunds = (uid, newFunds) => {
    const db = firebase.database()
    const eventref = db.ref(`users/${uid}/funds`)
    eventref.set(newFunds)
  }

  const closeAddFundModal = () => {
    setIsShowAddFundModal(false)
  }

  const closeUpdateFundModal = () => {
    setIsShowUpdateFundModal(false)
  }

  const addFund = (values) => {
    const { fundid, price, date, amount } = values
    const fundname = fundOptions.find(f => f.id === fundid).name.trim()
    const fundtype = fundOptions.find(f => f.id === fundid).type.trim()
    const newFunds = [...myFunds]
    newFunds.push({ key: fundid + '-' + (new Date()).getTime(), id: fundid, name: fundname, price, type: fundtype, date: moment(date).format('YYYY-MM-DD'), amount })
    setMyFunds(newFunds)
    saveMyFunds(user.uid, newFunds)
    closeAddFundModal()
  }

  const removeFund = (key) => {
    let newFunds = [...myFunds]
    newFunds = newFunds.filter(f => f.key !== key)
    setMyFunds(newFunds)
    saveMyFunds(user.uid, newFunds)
  }

  const showUpdateFundModal = (key) => {
    const targetFund = myFunds.find(f => f.key === key)
    setTargetUpdateFund(targetFund)
    form.setFieldsValue({ ...targetFund, date: moment(targetFund.date) })
    setIsShowUpdateFundModal(true)
  }

  const updateFund = (values) => {
    const { key, id, name, price, type, date, amount, interest } = values
    const updatedFundIndex = myFunds.findIndex(myFund => myFund.key === key)
    const newFunds = [...myFunds]
    newFunds[updatedFundIndex] = { key, id, name, price, type, date: moment(date).format('YYYY-MM-DD'), amount, interest }
    setMyFunds(newFunds)
    saveMyFunds(user.uid, newFunds)
    closeUpdateFundModal()
  }

  const onSelectSearch = debounce(async (val) => {
    if (val && val.length > 0) {
      const url = '/api/fundquery?name=' + val
      const { data } = await axios.get(url)
      const options = data.map(d => ({ name: d.name, id: d.id, type: d.type }))
      setFundOptions(options)
    }
  }, 800)

  const exportMyFunds = async () => {
    const fundJson = JSON.stringify(await loadMyFunds(user.uid))
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
    saveMyFunds(user.uid, localFunds)
    setMyFunds(localFunds)
    closeImportFundModal()
  }

  return (
    <Layout user={user} isHide={isLogin === false}>

      <Head>
        <title>基金損益表</title>
      </Head>

      <h1>基金損益表</h1>

      <div>

        {/* 功能鍵區塊 */}
        <Space>
          <Button type='button' onClick={exportMyFunds}>匯出</Button>
          <Button type='button' onClick={() => setIsShowImportFundModal(true)}>匯入</Button>
          <Button type='button' onClick={() => setIsShowAddFundModal(true)}>新增我的基金</Button>
        </Space>
      </div>

      <br />

      {/* 基金清單 - mobile */}

      <List
        className='fund-list'
        bordered
        loading={isLoading}
        dataSource={fundDetails}
        renderItem={f => (
          <List.Item>

            <div className='fund-list__item'>
              <Typography.Title level={5}>{f.name}</Typography.Title>
              <div className='fund-list__field'>申購日期: {f.date ? `${f.date}` : '-'}</div>
              <div className='fund-list__field'>投資金額: {f.amount ? `$${formatCurrency(f.amount)}` : '-'}</div>
              <div className='fund-list__field'>申購淨值: ${formatCurrency(f.price)}</div>
              <div className='fund-list__field'>參考淨值: {f.currentPrice ? `$${formatCurrency(f.currentPrice)}` : '-'}</div>
              <div className='fund-list__field'>投資損益: {f.returnAmount ? `$${formatCurrency(f.returnAmount)}` : '-'}</div>
              <div className='fund-list__field'>累計配息: {f.interest ? `$${formatCurrency(f.interest)}` : '-'}</div>

              <div className='fund-list__field'>
                報酬率: <span className={f.returnRate !== '' ? ('fund-list__rate ' + (f.returnRate >= 0 ? 'up-color' : 'down-color')) : ''}>{f.returnRate ? `${f.returnRate}%` : '-'}</span>
              </div>

              <div className='fund-list__field'>
                含息報酬率: <span className={f.returnRateWithInterest !== '' ? ('fund-list__rate ' + (f.returnRateWithInterest >= 0 ? 'up-color' : 'down-color')) : ''}>{f.returnRateWithInterest ? `${f.returnRateWithInterest}%` : '-'}</span>
              </div>

              <div className='fund-list__field'>參考日: {f.currentPriceRefDate}</div>

              <div className='fund-list__action'>
                <Button type='link' onClick={() => removeFund(f.key)} icon={<DeleteTwoTone />} />
                <Button type='link' onClick={() => showUpdateFundModal(f.key)} icon={<EditTwoTone />} />
              </div>

            </div>

          </List.Item>
        )}
      />

      {/* 基金清單 - pc */}
      <div>

        <table className='fund-table'>

          <thead>
            <tr>
              <th style={{ width: '30%' }}>基金名稱</th>
              <th>申購<br />日期</th>
              <th>投資<br />金額</th>
              <th>申購<br />淨值</th>
              <th>參考<br />淨值</th>
              <th>投資<br />損益</th>
              <th>報酬率</th>
              <th>累計<br />配息</th>
              <th>含息<br />報酬率</th>
              <th />
            </tr>
          </thead>

          <tbody>

            {!isLoading && fundDetails && fundDetails.map(f => {
              return (
                <tr key={f.key}>
                  <td style={{ textAlign: 'left' }}>{f.name}</td>
                  <td style={{ textAlign: 'center' }}>{f.date || '-'}</td>
                  <td>{f.amount ? `$${formatCurrency(f.amount)}` : '-'}</td>
                  <td>${formatCurrency(f.price)}</td>
                  <td>{f.currentPrice ? `$${formatCurrency(f.currentPrice)}` : '-'}</td>
                  <td>{f.returnAmount ? `$${formatCurrency(f.returnAmount)}` : '-'}</td>
                  <td className={f.returnRate !== '' ? (f.returnRate >= 0 ? 'up-color' : 'down-color') : ''}>{f.returnRate ? `${f.returnRate}%` : '-'}</td>
                  <td>{f.interest ? `$${formatCurrency(f.interest)}` : '-'}</td>
                  <td className={f.returnRateWithInterest !== '' ? (f.returnRateWithInterest >= 0 ? 'up-color' : 'down-color') : ''}>{f.returnRateWithInterest ? `${f.returnRateWithInterest}%` : '-'}</td>

                  <td style={{ textAlign: 'center' }}>
                    <Space>
                      <Button type='button' onClick={() => removeFund(f.key)} icon={<DeleteTwoTone />} />
                      <Button type='button' onClick={() => showUpdateFundModal(f.key)} icon={<EditTwoTone />} />
                    </Space>
                  </td>
                </tr>
              )
            })}

            {isLoading && (
              <tr>
                <td colSpan='10' style={{ textAlign: 'left' }}> 資料讀取中... </td>
              </tr>
            )}

          </tbody>
        </table>

      </div>

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
            rules={[{ required: true, message: '請選擇基金名稱' }]}
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
            label='投資日期'
            name='date'
            rules={[{ required: true, message: '請輸入投資日期' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label='投資金額'
            name='amount'
            rules={[{ required: true, message: '請輸入投資金額' }]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            label='申購淨值'
            name='price'
            rules={[{ required: true, message: '請輸入申購淨值' }]}
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
            label='投資日期'
            name='date'
            rules={[{ required: true, message: '請輸入投資日期' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label='投資金額'
            name='amount'
            rules={[{ required: true, message: '請輸入投資金額' }]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            label='申購淨值'
            name='price'
            rules={[{ required: true, message: '請輸入申購淨值' }]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            label='累計配息'
            name='interest'
            rules={[{ required: true, message: '請輸入累計配息' }]}
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

export default Home
