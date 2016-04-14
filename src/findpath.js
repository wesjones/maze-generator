define('findPath', function() {

    function findPath(board, start, target, blockers, callback) {
        var paths = [[start]];
        var used = createUsed();
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
            var sides = [];
            var up = {y:pt.y-1, x:pt.x};
            var right = {y:pt.y, x:pt.x+1};
            var down = {y:pt.y+1, x:pt.x};
            var left = {y:pt.y, x:pt.x-1};
            //TODO: need to shuffle this order.
            available(up) && sides.push(up);
            available(right) && sides.push(right);
            available(down) && sides.push(down);
            available(left) && sides.push(left);
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
                    paths.push(path);// put it back because it was removed.
                    if(found) {
                        return path;
                    }
                } else { // make new paths for each because they go different directions.
                    p = path.slice(0);
                    p.complete = complete;
                    p.push(sides[i]);
                    paths.push(p);
                    if (found) {
                        return p;
                    }
                }
                addUsed(sides[i]);
            }
            return found;
        }

        var intv = setInterval(function() {
            var now = Date.now();
            while(Date.now() === now) {// process as many as possible in 1ms.
                var lastPath = paths[0];
                var answer = next();
                if (answer || !paths.length) {
                    clearInterval(intv);
                    callback(answer || lastPath);
                }
            }
        }, 1);
    }

    exports.findPath = findPath;
});