const express = require('express')
const bodyParser = require('body-parser')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const socketHandler = require('./sockets.js')
const history = require('connect-history-api-fallback')

require('dotenv').config()
const app = express()
const server = http.createServer(app)
const sockets = socketio(server, {
    cors: {
        origins: "*:*",
        method: ["GET", "POST", "PUT", "PATCH"],
      },
})
socketHandler(sockets)
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({origin:'*'}))
app.use('/', require('./router'))
if (process.env.PROD == 'true'){
  app.use(express.static(__dirname + '/../frontend/dist'))
  app.use(history({
    index:'index.html'
  }))
  app.use(express.static(__dirname + '/../frontend/dist'))
}

module.exports = server 