define('getSidePoints', ['getPointToDirOfPoint'], function(getPointToDirOfPoint) {
    return function getSidePoints(pt) {
        var sides = [];
        sides.push(sides.up = getPointToDirOfPoint(pt, 'up'));//{y:pt.y-1, x:pt.x, dir: 'up'});
        sides.push(sides.right = getPointToDirOfPoint(pt, 'right'));//{y:pt.y, x:pt.x+1, dir: 'right'});
        sides.push(sides.down = getPointToDirOfPoint(pt, 'down'));//{y:pt.y+1, x:pt.x, dir: 'down'});
        sides.push(sides.left = getPointToDirOfPoint(pt, 'left'));//{y:pt.y, x:pt.x-1, dir: 'left'});
        return sides;
    };
});