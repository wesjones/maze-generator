define('getPointToDirOfPoint', function() {
    var deltas = {
        up: {x:0, y:-1},
        right: {x:1, y:0},
        down: {x:0, y:1},
        left: {x:-1, y:0}
    };
    return function getPointToDirOfPoint(pt, dir) {
        return {x:pt.x + deltas[dir].x, y:pt.y + deltas[dir].y};;
    };
});