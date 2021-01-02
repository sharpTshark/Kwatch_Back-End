let onlineUsers = []

const handleOnlineUsers = (data, room, io) => {
    if (data.isOnline) {
        console.log(data.isOnline);

        let roomAttendees = room.roomAttendees
        onlineUsers.push(data.isOnline)

        
        console.log(onlineUsers.length);
        console.log(roomAttendees.length);
        
        if (onlineUsers.length + 1 === roomAttendees.length) {
            io.emit('testroom', { roomUpdate: onlineUsers })
            room.roomAttendees = onlineUsers
            onlineUsers = []
            // if this is the last player, remove the room from active rooms when he leaves
            if (room.roomAttendees.length === 1) lastOnline = true
            else lastOnline = false
        }
    }  
}

const videoController = (data, room, io) => {
    if (data.onStateChange) {
        if (data.onStateChange == 5 || data.onStateChange == 2 || data.onStateChange == -1) {
            io.emit('testroom', { playVideo: true })
            room.video.paused = false
        } else if (data.onStateChange == 1) {
            io.emit('testroom', { pauseVideo: true })
            room.video.paused = true
        }
    }
}

const loadVideo = (data, room, io) => {
    if (data.loadVid) {
        room.video.id = data.loadVid
        room.video.paused = false
        io.emit('testroom', { loadVideoById: data.loadVid })
    }
}

module.exports = { handleOnlineUsers, videoController, loadVideo }