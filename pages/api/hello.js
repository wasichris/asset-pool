
// API Routes let you create an API endpoint inside a Next.js app.
// You can do so by creating a function inside the pages/api directory that
// has the following format:

export default (req, res) => {
  res.status(200).json({ text: 'Hello' })
}
