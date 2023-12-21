const mongoose = require('mongoose');

const getSeason = (date) => {
    // On décale de -1 car les mois commencent à 0 en JavaScript
    const autumn2023 = [
        'autumn2023',
        [new Date(2023, 8, 23), new Date(2023, 11, 21, 23, 59, 59)]
    ];
    const winter2023 = [
        'winter2023',
        [new Date(2023, 11, 22), new Date(2024, 2, 19, 23, 59, 59)]
    ];
    const spring2024 = [
        'spring2024',
        [new Date(2024, 2, 20), new Date(2024, 5, 19, 23, 59, 59)]
    ];
    const summer2024 = [
        'summer2024',
        [new Date(2024, 5, 20), new Date(2024, 8, 21, 23, 59, 59)]
    ];

    const seasons = {
        autumn2023,
        winter2023,
        spring2024,
        summer2024,
    };

    for (const [season, [start, end]] of Object.values(seasons)) {
        if (date >= start && date <= end) {
            return season;
        }
    }

    return undefined;
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

const Session = mongoose.model('Session', sessionSchema);

module.exports = {Session, getSeason};