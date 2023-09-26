const mongoose = require('mongoose');

const getSeason = (date) => {

    // On décale de -1 car les mois commencent à 0 en js
    const autumn2023 = [new Date(2023, 8, 23), new Date(2023, 11, 21)];
    const winter2023 = [new Date(2024, 11, 22), new Date(2024, 2, 19)];
    const spring2024 = [new Date(2024, 2, 20), new Date(2024, 5, 19)];
    const summer2024 = [new Date(2024, 5, 20), new Date(2024, 8, 21)];

    if (date >= autumn2023[0] && date <= autumn2023[1]) {
        return 'autumn2023';
    } else if (date >= winter2023[0] && date <= winter2023[1]) {
        return 'winter2023';
    } else if (date >= spring2024[0] && date <= spring2024[1]) {
        return 'spring2024';
    } else if (date >= summer2024[0] && date <= summer2024[1]) {
        return 'summer2024';
    } else {
        return '';
    }
};
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
    season: {
        type: String,
        enum: ['autumn2023', 'winter2023', 'spring2024', 'summer2024'],
    },
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
    if (!this.season) {
        this.season = getSeason(this.createdAt);
    }
    this.players.sort();
    this.updatedAt = Date.now();
    next();
});

sessionSchema.path('players').validate(function(players) {
    return players.length === 5;
}, 'A session must have 5 players');

sessionSchema.path('season').validate(function(season) {
    return season = getSeason();
}, 'This session is not in the current season');

const Session = mongoose.model('Session', sessionSchema);

module.exports = {Session, getSeason};