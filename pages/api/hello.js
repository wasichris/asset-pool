// API Routes let you create an API endpoint inside a Next.js app.
// You can do so by creating a function inside the pages/api directory that
// has the following format:
import { withIronSession } from 'next-iron-session'

async function handler (req, res) {
  // req data
  const { query: { name } } = req
  const user = { name }
  req.session.set('user', user)
  await req.session.save()

  // parser
  res.status(200).json(user)
}

export default withIronSession(handler, {
  password: process.env.APPLICATION_SECRET,
  cookieName: process.env.APPLICATION_COOKIENAME,
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
})
