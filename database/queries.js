const rooms = require("./roomSchema");

const createRoom = (req, res) => {
    const room = {
        roomId: '_' + Math.random().toString(36).substr(2, 9),
        roomName: req.body.roomName,
        roomAdmin: req.body.roomAdmin,
        queue: []
    }

    //create room with the choosen settings
    rooms.create(room, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            //sending back the data to confirm it
            res.send({
                valid: true,
                settings: {
                    roomId: room.roomId,
                    roomName: room.roomName,
                    roomAdmin: room.roomAdmin
                },
                queue: room.queue
            })

            console.log(result)
        } 
    })
}


module.exports = { createRoom }