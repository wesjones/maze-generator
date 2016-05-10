define('getSidesOfType', ['getSidePoints'], function(getSidePoints) {
    return function getSidesOfType(board, pt, type) {
        var sides = getSidePoints(pt), points = [], pt;
        for(var i = 0; i < sides.length; i += 1) {
            pt = sides[i];
            if (board[pt.y] && board[pt.y][pt.x] === type) {
                points.push(pt);
            }
        }
        return points;
    };
});