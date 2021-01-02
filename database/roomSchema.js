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
        }
    },
    { collection: "room" }
);


module.exports = mongoose.model("room", room);




// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// let employee = new Schema(
//   {
//     name: {
//       type: String
//     },
//     age: {
//       type: Number
//     },
//     location: {
//       type: String
//     }
//   },
//   { collection: "Employees" }
// );

// module.exports = mongoose.model("employees", employee);