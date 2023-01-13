const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    post: {
        type: Array
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    following: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    }
});


userSchema.methods.follow = function(userId) {
    if (userId === this._id) {
        throw new Error('You cannot follow yourself');
    }
    this.following.push(userId);
    return this.save();
}


userSchema.methods.unfollow = function(userId) {
    this.following.remove(userId);
    return this.save();
}

module.exports = mongoose.model('User', userSchema);