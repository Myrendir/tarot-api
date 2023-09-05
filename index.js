require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const playerRoutes = require('./src/routes/playerRoute');
const gameRoutes = require('./src/routes/gameRoute');
const securityRoutes = require('./src/routes/securityRoute');
const sessionRoutes = require('./src/routes/sessionRoute');
const statisticRoutes = require('./src/routes/statisticRoute');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
});

app.use('/api/player', playerRoutes);
app.use('/api/game', gameRoutes);
app.use('/api', securityRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/stats', statisticRoutes);

app.use((req, res, next) => {
    res.status(404).send({message: 'Route not found.'});
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({message: 'An error occured !'});
});
