const http = require('http')
const fs = require('fs')
const path = require('path')
const port = process.env.PORT || 4173
const root = path.join(__dirname, '..', 'dist')

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webp': 'image/webp',
}

const server = http.createServer((req, res) => {
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0])
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html'
    const filePath = path.join(root, reqPath)
    if (!filePath.startsWith(root)) {
      res.statusCode = 403
      return res.end('Forbidden')
    }
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404
      return res.end('Not found')
    }
    const ext = path.extname(filePath).toLowerCase()
    const type = mime[ext] || 'application/octet-stream'
    res.setHeader('Content-Type', type)
    fs.createReadStream(filePath).pipe(res)
  } catch (err) {
    res.statusCode = 500
    res.end('Server error')
  }
})

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`)
})
