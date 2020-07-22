const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Static folder
app.use(express.static(path.join(__dirname, 'public')))


const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log('server started'))

//Run when client connects
io.on('connection', socket => {
   // Welcome current user
    socket.emit('message', 'Welcome to ChatRoom')


    // Broadcast when a user connects
    socket.broadcast.emit('message', 'A user has joined the chat')

    //Runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat')
    })


    //Listen for chatMessage
    socket.on('chatMessage', msg => {
       io.emit('message', msg)
        
    })
})