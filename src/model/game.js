const mongoose = require('mongoose');

const BET_VALUES = ['petite', 'garde', 'garde sans', 'garde contre'];

const gameSchema = new mongoose.Schema({
    players: [
        {
            player: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Player',
                required: true,
            },
            points: {
                type: Number,
                required: true,
            },
        }],
    bet: {
        type: String,
        enum: BET_VALUES,
        required: true,
    },
    taker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true,
    },
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null,
    },
}, {
    timestamps: true,
});

gameSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

gameSchema.path('players').validate(function(players) {
    return players.length === 5;
}, 'A game must contain exactly 5 players');

module.exports = [mongoose.model('Game', gameSchema), BET_VALUES];
