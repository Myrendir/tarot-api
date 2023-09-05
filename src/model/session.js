const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    players: [
        {
            player: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Player',
                required: true,
            },
            score: {
                type: Number,
                default: 0,
            },
        },
    ],
    games: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
        }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

sessionSchema.index({players: 1}, {unique: true});
sessionSchema.pre('save', function(next) {
    this.players.sort();
    this.updatedAt = Date.now();
    next();
});

sessionSchema.path('players').validate(function(players) {
    return players.length === 5;
}, 'A session must have 5 players');

module.exports = mongoose.model('Session', sessionSchema);
