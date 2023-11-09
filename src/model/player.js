const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const playerSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true,
    },
    password: {
        required: true,
        type: String,
    },
    firstname: {
        required: true,
        type: String,

    },
    lastname: {
        required: true,
        type: String,
    },
    active: {
        required: false,
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN', 'GUEST'],
        default: 'USER',
    },
    stars: [
        {
            type: {
                type: String,
            },
            date: {
                type: Date,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

playerSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

playerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});
module.exports = mongoose.model('Player', playerSchema);