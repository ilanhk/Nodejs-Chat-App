const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { isPrimitive } = require('util')
const Filter = require('bad-words') //to list of most bad words to prevent from showing in the chat app
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app) //allows us to create a new web server
const io = socketio(server)
 
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

 
app.use(express.static(publicDirectoryPath))


//when we are working with socket.io and we are transfering data we are sending and recieving events
io.on('connection', (socket)=>{
    console.log('New WebSocket Connection!')

    socket.on('join', ({ username, room }, callback)=>{
        
        const { error, user } = addUser({ id: socket.id, username, room })

        if(error){
            return callback(error)
        }
        
        socket.join(user.room) // allows users to join a given chat room

        socket.emit('message', generateMessage('Admin','Welcome!')) //to send an event to the client 
        socket.broadcast.to(user.room).emit('message', generateMessage( 'Admin', `${user.username} joined!`)) // 'socket.broadcast.to.emit' sends a message to everyone in the chat room except the user but if you type 'socket.broadcast.emit' would tell everyone except the user in all chats.
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback)=>{
        
        const user = getUser(socket.id)
        
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed sucker :p')
        } //this checks if the message has any bad words

        io.to(user.room).emit('message',  generateMessage(user.username, message))
        callback('Delivered!') //callback is used to acknowledge the event. you can put data in it like strings, objs ..etc

    }) // 'sendMessage' comes from the client we will use the function do something and send back to the client


    socket.on('sendLocation', (coordinates, callback)=>{
        user= getUser(socket.id)
        io.to(user.room).emit('location-message', generateLocationMessage(user.username, `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if (user){
            io.to(user.room).emit('message',  generateMessage('Admin', `${user.username} has left!`)) // io.to.emit sends a message to everyone in a chat room
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }  
    }) // to disconnect a user and to let everyone know need to nest this in the 'io.on('connection')' event. This will let everyone know that a client has left the chat.
})




server.listen(port, () =>{
    console.log(`Server is up on port ${port}`)
}) // this will start off the http server