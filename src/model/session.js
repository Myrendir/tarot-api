const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    players: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
            required: true,
        }],
    games: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
        }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

sessionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Session', sessionSchema);
