const mongoose = require("mongoose");

const roomSchema = mongoose.Schema;

let room = new roomSchema(
    {
        roomId: {
            type: String
        },
        roomName: {
            type: String
        },
        roomAdmin: {
            type: String
        },
        queue: {
            type: Array
        }
    },
    { collection: "room" }
);


module.exports = mongoose.model("room", room);