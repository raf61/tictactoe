const express = require('express')
const bodyParser = require('body-parser')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')
const userProvider = require('./userProvider')
const cookieParser = require('cookie-parser')
const socketHandler = require('./sockets.js')

const app = express()
const server = http.createServer(app)
const sockets = socketio(server, {
    cors: {
        origins: "*:*",
        method: ["GET", "POST", "PUT", "PATCH"],
      },
})
socketHandler(sockets)
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({origin:'*'}))
app.use(userProvider)
app.use('/', require('./router'))


module.exports = server 