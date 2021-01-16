// require dependencies
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, { cors: { origin: '*' } })
const axios = require('axios')

// setting PORT
const PORT = process.env.PORT || 3000
// database connection, functions and models
require('./database/database')
const rooms = require('./database/roomSchema')
const { createRoom } = require('./database/queries')
// require and using middleware
const cors = require('cors')
const bodyparser = require('body-parser')

app.use(cors())
app.use(bodyparser.json())

// router stuff
const router = express.Router()
// listen to port
http.listen(PORT, () => {
	console.log('listening on PORT ' + PORT)
})

app.get('/', (req, res) => {
	res.send('testing')
})

app.post('/createRoom', (req, res) => {
	createRoom(req, res)
})

app.get('/rooms/:roomId', (req, res) => {
	const roomId = req.params.roomId
	rooms
		.findOne({ roomId: roomId })
		.then(
			(room = room => {
				if (room) {
					res.send({
						valid: true,
						settings: {
							roomId: room.roomId,
							roomName: room.roomName,
							roomAdmin: room.roomAdmin,
						},
						queue: room.queue,
					})
				} else res.send({ valid: false })
			})
		)
		.catch(
			(err = err => {
				res.send(err)
				console.log(err)
			})
		)
})

app.post('/findvideo', (req, res) => {
	let items = []
	axios
		.get(
			'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=' +
				req.body.search +
				'&type=video&key=AIzaSyAzMA7AOmfA1UGD071bXqmC4ZkRR4FTdHk'
		)
		.then(result => {
			result.data.items.forEach(item => {
				items.push(item)
			})
			res.send(items)
		})
		.catch(err => console.log(err))
})

// socket handles
const { attachToRoom, discRoom } = require('./functions/room.func')
const {
	handleOnlineUsers,
	videoController,
	loadVideo,
} = require('./functions/socketData.func')

const activeRooms = []

io.on('connection', socket => {
	console.log('player connected')
	// connection info
	const roomId = socket.handshake.query.roomId
	const username = socket.handshake.query.username

	//the active room the player is connected to
	let joinedRoom = activeRooms.filter(obj => obj.roomId === roomId)

	// the player is placed in his active room
	attachToRoom(joinedRoom, activeRooms, socket)

	// update the room queue
	app.post('/addToQueue', (req, res) => {
		rooms.findOneAndUpdate(
			{ roomId: req.body.roomId },
			{ $push: { queue: req.body.video } },
			(error, success) => {
				if (error) console.log(error)
				else {
					rooms
						.findOne({ roomId: req.body.roomId })
						.then(
							(room = room => {
								if (room) io.emit(req.body.roomId, { queueUpdate: room.queue })
								else res.send({ valid: false })
							})
						)
						.catch(
							(err = err => {
								console.log(err)
							})
						)
				}
			}
		)
		res.send('queue done')
	})

	app.post('/delQueueItem', (req, res) => {
		const id = req.body.id
	})

	// when there is any data transmitted
	socket.on(roomId, data => {
		joinedRoom = activeRooms.filter(obj => obj.roomId === roomId)

		handleOnlineUsers(data, joinedRoom[0], io, roomId)
		videoController(data, joinedRoom[0], io, roomId)
		loadVideo(data, joinedRoom[0], io, roomId)

		if (data.vidReady) {
			const IdFirstClient = joinedRoom[0].roomAttendees[0].socketId

			if (joinedRoom[0].roomAttendees.length > 1) {
				socket.broadcast
					.to(socket.id)
					.emit(roomId, { loadVideoById: joinedRoom[0].video.id })
				socket.broadcast
					.to(IdFirstClient)
					.emit(roomId, { sendVidTime: socket.id })
			}
		}
		if (data.seek) {
			io.to(data.seek.socketId).emit(roomId, { seekTo: data.seek.time })
		}

		if (data.onBarChange) {
			io.emit(roomId, { barChanged: data.onBarChange })
		}

		if (data.delQueueItem) {
			const id = data.delQueueItem

			rooms.findOne({ roomId: roomId }, (err, doc) => {
				if (err) console.log(err)
				else {
					let queue = doc.queue
					const ids = queue.map(q => q.id)

					const index = ids.indexOf(id)

					queue.splice(index, 1)

					doc.queue = queue

					doc.save(err => {
						console.log(err)
					})

					io.emit(roomId, { queueUpdate: doc.queue })
				}
			})
		}
	})

	joinedRoom = activeRooms.filter(obj => obj.roomId === roomId)
	io.emit(roomId, { roomInfo: joinedRoom[0] })

	console.log(activeRooms)

	socket.on('disconnect', () => {
		discRoom(joinedRoom[0], activeRooms, roomId, io, roomId)
	})
})
// disconnect fixen
