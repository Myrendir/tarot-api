const getGamePoints = (game) => {
    const gamePoints = game.attackingTeamScore;
    let goal = 0;

    switch (game.tip) {
        case 0:
            goal = 56;
            break;
        case 1:
            goal = 51;
            break;
        case 2:
            goal = 41;
            break;
        case 3:
            goal = 36;
            break;
        default:
            throw new Error();
    }

    return ((gamePoints - goal) >= 0 ? (Math.ceil(gamePoints)) : (Math.floor(
        gamePoints))) - goal;

};

const betToMultiplier = function(bet) {
    switch (bet) {
        case 'p':
            return 1;
        case 'g':
            return 2;
        case 'gs':
            return 4;
        case 'gc':
            return 6;
        default:
            throw new Error();
    }
};
const bidPoint = function(win, pt, pb, mu) {
    return (+win) * (Math.ceil((25 + pt + pb) * mu / 10) * 10) + (+!win) *
        (Math.floor((-25 + pt + pb) * mu / 10) * 10);
};

const getPoint = function(game) {
    const gamePoint = getGamePoints(game);
    const petit = game.petitAuBoutWon === 'gagné' ? 10 : game.petitAuBoutWon ===
    'perdu' ? -10 : 0;
    const chelem = game.chelemWon ? 100 : game.hugeChelemWon ? 200 : 0;

    return bidPoint(gamePoint >= 0, gamePoint, petit,
        betToMultiplier(game.bet)) + chelem;
};
module.exports = {
    getPoint,
};