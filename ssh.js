const SSH = require('ssh2')
const readFileSync = require('fs').readFileSync
const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

const sshInit = () => {
  const connection = new MySSLConnection()
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
    this.init()
  }

  init() {
    this.connection = new SSH.Client().connect({
      host: process.env.HOST,
      port: process.env.PORT,
      username: process.env.USERNAME,
      privateKey: readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8')
    })

    this.connection.on('ready', () => {
      console.log('Client :: ready');
      this.connection.shell((err, stream) => {
        if (err) throw err;
        this.onData(stream)
        this.onDataEnd(stream)
        this.onClose(stream)
      });

    })
  }

  command() {
    if (this.connection === null) {
      this.init()
    }
  }

  onData(stream) {
    stream.on('data', (data) => {
      console.log('' + data);
    })
  }

  onDataEnd(stream) {
    // stream.end('ls -l\nexit\n');
  }

  onClose(stream) {
    stream.on('close', () => {
      console.log('Stream :: close');
      this.connection.end();
    })
  }

  
}



module.exports = sshInit