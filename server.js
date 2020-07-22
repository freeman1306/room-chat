const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('.//utils/users')


const app = express() // server
const server = http.createServer(app) // http-server
const io = socketio(server) // socket with http-server

//Static folder
app.use(express.static(path.join(__dirname, 'public')))


const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log('server started'))

const botName = 'ChatCord Bot'

//Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({
        username,
        room
    }) => {

        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatRoom'))


        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message',
            formatMessage(botName, `${user.username} has joined the chat`))



        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })


    //Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username, msg))

    })


    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)


        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the chat`))

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})