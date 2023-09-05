const mongoose = require('mongoose');

const mongoString = `${process.env.DATABASE_URL}dev_tarot`;

const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error);
});

database.once('connected', () => {
    console.log('Database Connected');
});

mongoose.connect(mongoString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = database;
