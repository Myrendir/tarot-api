require('dotenv').config();

const mongoose = require('mongoose');
const Player = require('../model/player');

const mongoString = `${process.env.DATABASE_URL}dev_tarot`;

mongoose.connect(mongoString,
    {useNewUrlParser: true, useUnifiedTopology: true});

const mockPlayer = {
    username: 'adeshais',
    password: 'adeshais',
    firstname: 'Armand',
    lastname: 'Deshais',
    role: 'ADMIN',
};

async function createMockPlayer () {
    try {
        const player = await Player.create(mockPlayer);
        console.log('Mock Player added successfully:', player);
    } catch (err) {
        console.error('Error while creating the mock Player:', err);
    } finally {
        mongoose.connection.close();
    }
}

createMockPlayer();

