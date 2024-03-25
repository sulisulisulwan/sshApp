const SSH = require('ssh2')
const readFileSync = require('fs').readFileSync
const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

const sshInit = () => {
  const connection = new MySSLConnection()
  return connection
}

//when server turns on we create a reusable MySSLConnection instance

//when user sends a command via GUI it hits the server which then checks if an SSH connection exists
//if not, a connection is initialied (init)
  //every initialization has a lifespan of 5 seconds
  //if command is given within 5 seconds, the timeout is refreshed
  //if no command is given within 5 seconds, the connection is nullified (this.connection = null)


class MySSLConnection {

  constructor() {
    this.connection = null 
    this.timeout = null
    this.stream = null
    this.command = null
  }

  init(cb) {
    this.connection = new SSH.Client().connect({
      host: process.env.HOST,
      port: process.env.PORT,
      username: process.env.USERNAME,
      privateKey: readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8')
    })

    this.connection.on('ready', cb)
  }

  execCommand(command) {
    this.command = command
    if (this.connection === null) {
      this.init(() => {
        console.log('Client :: ready');
  
        this.connection.shell((err, stream) => {
          if (err) throw err;
          this.stream = stream
          this.onData()
          this.onDataEnd(() => {
            this.stream.write(command + '\n')
          })
          this.onClose()
        });
  
      })

      return
    }

    clearTimeout(this.timeout)
    this.timeout = null

    this.onDataEnd(() => {
      this.stream.write(command + '\n')
    })
  }

  onData() {
    this.stream.on('data', (data) => {
      console.log('' + data);
    })
  }

  onDataEnd(cb) {
    let stream = this.stream
    // at the end of a data stream, execute the next command
    cb()

    // set the ssh timeout
    this.timeout = setTimeout(function () {
      stream.end('ls -l\nexit\n');
      clearTimeout(this.timeout)
      this.timeout = null
    }, 5000)
  }

  onClose() {
    this.stream.on('close', () => {
      console.log('Stream :: close');
      this.connection.end();
      this.connection = null
    })
  }

  
}



module.exports = sshInit