const mongoose = require('mongoose');
const {getSeason} = require('./session');

const BET_VALUES = ['p', 'g', 'gs', 'gc'];

const gameSchema = new mongoose.Schema({
    players: [
        {
            player: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Player',
                required: true,
            },
            score: {
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
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null,
    },
    tip: {
        type: Number,
        required: true,
    },
    attackingTeamScore: {
        type: Number,
        required: true,
    },
    defendingTeamScore: {
        type: Number,
        required: true,
    },
    petitAuBoutWon: {
        type: ['', 'gagné', 'perdu'],
        default: null,
    },
    chelemWon: {
        type: Boolean,
        default: null,
    },
    hugeChelemWon: {
        type: Boolean,
        default: null,
    },
    /* handle: {
         type: Number,
         default: null,
     },*/
    won: {
        type: Boolean,
        required: true,
    },
    season: {
        type: String,
        enum: ['autumn2023', 'winter2023', 'spring2024', 'summer2024', 'autumn2024'],
    },
}, {
    timestamps: true,
});

gameSchema.pre('save', function(next) {
    if (!this.season) {
        this.season = getSeason(this.createdAt);
    }
    this.players.sort();
    this.updatedAt = Date.now();

    next();
});

gameSchema.path('players').validate(function(players) {
    return players.length === 5;
}, 'A game must contain exactly 5 players');

const Game = mongoose.model('Game', gameSchema);

module.exports = {
    Game,
    BET_VALUES,
};
