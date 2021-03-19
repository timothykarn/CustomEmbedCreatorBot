const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const gamesSchema = new Schema ({
    userId: Number,
    games: {
        type: Object,
        required: true,
    }
})
module.exports = mongoose.model('games', gamesSchema, 'games')