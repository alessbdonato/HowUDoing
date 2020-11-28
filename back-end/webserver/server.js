var express = require('express')
const path = require('path')

var app = express()

const port = 3000

app.get('/', (req, res) => {
  res.sendfile(path.join(__dirname, '..', 'index.html'));
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})


