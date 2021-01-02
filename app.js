// require dependencies
const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const axios = require('axios')

// setting PORT
const PORT = process.env.PORT || 3000;
// database connection, functions and models
require('./database/database')
const rooms = require("./database/roomSchema");
const { createRoom } = require('./database/queries')
// require and using middleware
const cors = require('cors');
const bodyparser = require('body-parser');
app.use(cors())
app.use(bodyparser.json())

// router stuff
const router = express.Router()
// listen to port
http.listen(PORT, () => {
    console.log('listening on PORT ' + PORT);
})

app.get('/', (req, res) => {
    res.send('testing')
});

app.post('/createRoom', (req, res) => {
    createRoom(req, res)
})

app.get('/rooms/:roomId', (req, res) => {
    const roomId = req.params.roomId
    rooms.findOne({ roomId: roomId})
        .then(room = (room) => {
            res.send({
                valid: true,
                settings: {
                    roomId: room.roomId,
                    roomName: room.roomName,
                    roomAdmin: room.roomAdmin
                }
            })
        })
        .catch(err = (err) => console.log(err))
})

app.post('/findvideo', (req, res) => {
    let items = []
    axios   .get('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q='+req.body.search+'&type=video&key=AIzaSyAzMA7AOmfA1UGD071bXqmC4ZkRR4FTdHk')
            .then(result => {
                result.data.items.forEach(item => {
                        items.push(item)
                });
                res.send(items)
            })
            .catch(err => console.log(err))
})





// socket handles
const { attachToRoom, discRoom } = require('./functions/room.func')
const { handleOnlineUsers, videoController, loadVideo } = require('./functions/socketData.func')

const activeRooms = []

io.on('connection', (socket) => {   console.log('player connected');
    // connection info
    const roomId = socket.handshake.query.roomId
    const username = socket.handshake.query.username
    
    //the active room the player is connected to
    let joinedRoom = activeRooms.filter(obj => obj.roomId === roomId)

    // the player is placed in his active room
    attachToRoom(joinedRoom, activeRooms, socket)

    // when there is any data transmitted
    socket.on('testroom', (data) => {
        joinedRoom = activeRooms.filter(obj => obj.roomId === roomId)

        handleOnlineUsers(data, joinedRoom[0], io)     
        videoController(data, joinedRoom[0], io)
        loadVideo(data, joinedRoom[0], io)

        if (data.vidReady) {
            const IdFirstClient = joinedRoom[0].roomAttendees[0].socketId
            if (joinedRoom[0].roomAttendees.length > 1) {
                socket.broadcast.to(IdFirstClient).emit('testroom', { sendVidTime: socket.id });
            }
        }
        if (data.seek) {
            console.log(data.seek);
            io.to(data.seek.socketId).emit('testroom', { seekTo: data.seek.time });
        }
    })

    joinedRoom = activeRooms.filter(obj => obj.roomId === roomId)
    io.emit('testroom', { roomInfo: joinedRoom[0] })

    console.log(activeRooms);

    socket.on('disconnect', () => {
        discRoom(joinedRoom[0], activeRooms, roomId, io)
    })
})
// disconnect fixen