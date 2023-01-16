const mongoose  = require('mongoose');
const User = require('./User');

const postSchema = new mongoose.Schema({
    Title: {
        type: String
    },
    Description: {
        type: String
    },
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date
    },
    votes: {
        type: Number,
        default: 0
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Post', postSchema);