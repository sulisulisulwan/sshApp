const express = require('express')
const sshInit = require('./ssh.js')

const app = express()

sshInit()

const PORT = 2345
app.listen(PORT, () => {
  console.log(`LISTENING ON ${PORT}`)
})

