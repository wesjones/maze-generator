define('findPath', ['getDistance', 'getSidePoints'], function(getDistance, getSidePoints) {
    
    // this global method is different than the private one.
    // because it doesn't use the used.
    // function getAvailableSides(board, pt, blockers, availableFn) {
    //     availableFn = availableFn || normalAvailable;
    //     var points = getSidePoints(pt);
    //     var sides = [];
    //     availableFn(board, points.up, blockers) && sides.push(points.up);
    //     availableFn(board, points.right, blockers) && sides.push(points.right);
    //     availableFn(board, points.down, blockers) && sides.push(points.down);
    //     availableFn(board, points.left, blockers) && sides.push(points.left);
    //     return sides;
    // }
    //
    // // public. does not use the used cache.
    // function normalAvailable(board, pt, blockers) {
    //     var value = board[pt.y] && board[pt.y][pt.x];
    //     return value !== undefined && blockers.indexOf(value) === -1;
    // }

    function findPath(board, start, target, blockers, callback) {
        var paths = [[start]];
        var used = createUsed();
        var closest;
        if (!available(start) || !available(target)) {
            return;
        }

        function equal(pt1, pt2) {
            return pt1.y === pt2.y && pt1.x === pt2.x;
        }

        function createUsed() {
            var u = [];
            for(var r = 0; r < board.length; r += 1) {
                u[r] = [];
                for(var c = 0; c < board[r].length; c += 1) {
                    u[r][c] = 0;
                }
            }
            return u;
        }

        function available(pt) {
            var value = board[pt.y] && board[pt.y][pt.x];
            return ((used[pt.y] && used[pt.y][pt.x]) || value === undefined || blockers.indexOf(value) !== -1) ? false : true;
        }

        function getAvailableSides(pt) {
            var sides = [], points = getSidePoints(pt);
            // var up = {y:pt.y-1, x:pt.x};
            // var right = {y:pt.y, x:pt.x+1};
            // var down = {y:pt.y+1, x:pt.x};
            // var left = {y:pt.y, x:pt.x-1};
            //TODO: need to shuffle this order.
            available(points.up) && sides.push(points.up);
            available(points.right) && sides.push(points.right);
            available(points.down) && sides.push(points.down);
            available(points.left) && sides.push(points.left);
            return sides;
        }

        function addUsed(pt) {
            used[pt.y] = used[pt.y] || [];
            used[pt.y][pt.x] = 1;
        }

        function next() {
            var oldPaths = paths.slice(0), answer;
            for(var i = 0; i < oldPaths.length; i += 1) {
                if (!oldPaths[i].complete) {
                    if ((answer = process(oldPaths[i]))) {
                        return answer;
                    }
                }
            }
        }

        function process(path) {
            var sides = getAvailableSides(path[path.length - 1]), p, found = false;
            paths.splice(paths.indexOf(path), 1);
            for(var i = 0; i < sides.length; i += 1) {
                var complete = equal(sides[i], target);
                if (complete) {
                    found = complete;
                }
                if (sides.length === 1) {
                    path.complete = complete;
                    path.push(sides[i]);// modify current path instead of making new ones.
                    getClosestPoint(path);
                    paths.push(path);// put it back because it was removed.
                    if(found) {
                        return path;
                    }
                } else { // make new paths for each because they go different directions.
                    p = path.slice(0);
                    p.complete = complete;
                    p.push(sides[i]);
                    getClosestPoint(p);
                    paths.push(p);
                    if (found) {
                        return p;
                    }
                }
                addUsed(sides[i]);
            }
            return found;
        }

        function getClosestPoint(points) {
            var closestPt = {dist: getDistance(points[0].x, points[0].y, target.x, target.y), pt: points[0]};
            for(var i = 1; i < points.length; i += 1) {
                var dist = getDistance(points[i].x, points[i].y, target.x, target.y);
                if (dist < closestPt.dist) {
                    closestPt.dist = dist;
                    closestPt.pt = points[i];
                }
            }
            points.closest = closestPt.pt;
            points.dist = closestPt.dist;
            if (!closest || points.dist < closest.dist) {
                closest = points;
            }
            return points;
        }

        var intv = setInterval(function() {
            var now = Date.now();
            while(Date.now() === now) {// process as many as possible in 1ms.
                // var lastPath = paths[0];
                var answer = next();
                if (answer || !paths.length) {
                    clearInterval(intv);
                    // we need to find the closest point to the target end and assign it on the array.
                    callback(closest);
                }
            }
        }, 1);
    }

    exports.findPath = findPath;

    return findPath;
});