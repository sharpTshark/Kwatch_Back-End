const attachToRoom = (room, activeRooms, socket) => {
	if (room.length == 0) {
		activeRooms.push({
			roomId: socket.handshake.query.roomId,
			roomAttendees: [
				{ username: socket.handshake.query.username, socketId: socket.id },
			],
			video: {
				id: 'f1fsBOUgjyo',
				started: null,
				paused: true,
				pausedTime: null,
			},
		})
	} else if (room.length == 1) {
		room[0].roomAttendees.push({
			username: socket.handshake.query.username,
			socketId: socket.id,
		})
	} else {
		console.log('more results have been found or something went wrong')
	}
}

const discRoom = (room, activeRooms, id, io, roomId) => {
	if (room.roomAttendees.length === 1) {
		activeRooms.forEach((activeRoom, key) => {
			if (activeRoom.roomId === id) {
				activeRooms.splice(key, 1)
				console.log('room has been removed')
			}
		})
	} else {
		console.log('disconnected')
		io.emit(roomId, { online: 'send back message to check whos still online' })
	}
}

module.exports = { attachToRoom, discRoom }
