const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://node:node@kwatch.javeg.mongodb.net/kwatch?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.once('open', function() {
    console.log('DB connected');
});

db.on('error', console.error.bind(console, 'connection error:'));




const rooms = new mongoose.Schema({
    roomId: String,
    roomName: String,
    roomAdmin: [{body: String}]
});

const roomModel = mongoose.model('rooms', rooms);

module.exports = roomModel