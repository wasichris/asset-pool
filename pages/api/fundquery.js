// API Routes let you create an API endpoint inside a Next.js app.
// You can do so by creating a function inside the pages/api directory that
// has the following format:
import axios from 'axios'

export default async (req, res) => {
  // req data
  const { query: { name } } = req

  // get data
  const url = 'https://www.moneydj.com/funddj/djjson/YFundSearchJSON.djjson?q=' + encodeURIComponent(name)
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer',
    transformResponse: [function (data) {
      const iconv = require('iconv-lite')
      return iconv.decode(Buffer.from(data), 'big5')
    }]
  })

  // data = 'TLZF7|安聯主題趨勢基金-AT累積類股(美元)|2,TLZH8|安聯主題趨勢基金-BT累積類股(美元)|2,TLZF8|安聯主題趨勢基金-IT累積類股(美元)|2,'

  // parser
  let fundData = []
  if (data && data.length > 1) {
    const funds = data.split(',')
    fundData = funds.map(f => {
      const fundInfo = f.split('|')
      return { id: fundInfo[0], name: fundInfo[1], type: fundInfo[2] }
    })
  }

  res.status(200).json(fundData.filter(f => f.id && f.name))
}
