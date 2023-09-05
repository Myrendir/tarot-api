const Player = require('../model/player');
const playerController = {};

playerController.create = async (req, res) => {
    try {
        const player = new Player(req.body);
        await player.save();
        res.status(201).
            json({message: 'Player created successfully!', data: player});
    } catch (error) {
        res.status(500).json({message: 'Error creating player', error});
    }
};

playerController.getAll = async (req, res) => {
    try {
        const playersWithGamesCount = await Player.aggregate([
            {
                $lookup: {
                    from: "games",
                    localField: "_id",
                    foreignField: "players.player",
                    as: "games"
                }
            },
            {
                $project: {
                    username: 1,
                    firstname: 1,
                    lastname: 1,
                    gamesCount: { $size: "$games" }
                }
            },
            {
                $sort: {
                    gamesCount: -1,
                    firstname: 1
                }
            }
        ]);

        res.status(200).json(playersWithGamesCount);

    } catch (error) {
        res.status(500).json({
            message: 'Error getting players',
            error: error.message,
        });
    }
};


playerController.get = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({message: 'Player not found'});
        }
        res.status(200).json({data: player});
    } catch (error) {
        res.status(500).json({message: 'Error fetching player', error});
    }
};

playerController.update = async (req, res) => {
    try {
        const player = await Player.findByIdAndUpdate(req.params.id, req.body,
            {new: true});
        if (!player) {
            return res.status(404).json({message: 'Player not found'});
        }
        res.status(200).
            json({message: 'Player updated successfully!', data: player});
    } catch (error) {
        res.status(500).json({message: 'Error updating player', error});
    }
};

playerController.delete = async (req, res) => {
    try {
        const player = await Player.findByIdAndDelete(req.params.id);
        if (!player) {
            return res.status(404).json({message: 'Player not found'});
        }
        res.status(200).json({message: 'Player deleted successfully!'});
    } catch (error) {
        res.status(500).json({message: 'Error deleting player', error});
    }
};

module.exports = playerController;