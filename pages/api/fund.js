
// API Routes let you create an API endpoint inside a Next.js app.
// You can do so by creating a function inside the pages/api directory that
// has the following format:
import axios from 'axios'
import cheerio from 'cheerio'

export default async (req, res) => {
  // req data
  const { query: { id, type, key } } = req

  // get html
  let url = ''
  if (type === '1') {
    url = 'https://www.moneydj.com/funddj/ya/yp010000.djhtm?a=' + id
  } else if (type === '2') {
    url = 'https://www.moneydj.com/funddj/yp/yp010001.djhtm?a=' + id
  }

  const { data } = await axios.get(url)

  // parser
  const $ = cheerio.load(data)
  const price = $('#article > form > table.t01 > tbody > tr:nth-child(2) > td:nth-child(2)').html()
  const refdate = $('#article > form > table.t01 > tbody > tr:nth-child(2) > td:nth-child(1)').html()
  res.status(200).json({ price: price ? parseFloat(price) : null, id, key, refdate })
}
