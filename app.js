const express = require('express')
const sshInit = require('./ssh.js')

const app = express()

const shell = sshInit()

app.get('/', (req, res) => {  

})

app.get('/command', (req, res) => {
  const { query } = req
  const command = query.cmd
  shell.execCommand(command)

  res.sendStatus(200)
})


const PORT = 2345

app.listen(PORT, () => {
  console.log(`LISTENING ON ${PORT}`)
})

