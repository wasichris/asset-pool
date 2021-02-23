
// API Routes let you create an API endpoint inside a Next.js app.
// You can do so by creating a function inside the pages/api directory that
// has the following format:
import firebase from 'firebase/app'

export default async (req, res) => {
  const db = firebase.database()
  const eventref = db.ref('users/bNWo1umowMRiSQFyHwdVaHvYRRq1/funds')// oh no
  const snapshot = await eventref.once('value')// oh no
  const value = snapshot.val()// oh no
  res.status(200).json({ text: value })
}
