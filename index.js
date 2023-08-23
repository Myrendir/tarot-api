require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Importez le nouveau fichier db.js

const playerRoutes = require('./src/routes/playerRoute');
const gameRoutes = require('./src/routes/gameRoute');
const securityRoutes = require('./src/routes/securityRoute');
const sessionRoutes = require('./src/routes/sessionRoute');

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

app.use((req, res, next) => {
    res.status(404).send({message: 'Route not found.'});
});

app.use((err, req, res, next) => {  // J'ai ajouté err en paramètre pour le gestionnaire d'erreurs 500
    console.error(err.stack);  // Log l'erreur
    res.status(500).send({message: 'An error occured !'});
});
