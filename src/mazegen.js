define('mazegen', ['findPath', 'angleToDirection', 'getAngle', 'getPointsFromEdge', 'getSidePoints'], function (findPath, angleToDirection, getAngle, getPointsFromEdge, getSidePoints) {
    function MazeGen() {
        var types = {
            WALL: 0,
            PATH: 1,
            PREFERRED: 2,
            START: 3,
            END: 4
        };

        function rand(max, offset) {
            return Math.floor(Math.random() * max + (offset || 0));
        }

        function each(fn, board) {
            board = board || this;
            for (var r = 0; r < board.rows; r += 1) {
                for (var c = 0; c < board.cols; c += 1) {
                    fn.call(board, r, c, board);
                }
            }
            return board;
        }

        function createCell(row, col, board) {
            var available = row % 2 === 0 && col % 2 === 0 ? 1 : 0;
            board[row] = board[row] || [];
            board[row][col] = available;
            if (available) {
                board.available.push({y: row, x: col});
            }
        }


        function getEdgePoint(board) {
            return board.getPointsFromEdge(0, [board.types.PATH], 1)[0];
        }
        
        function forcePath(start, end, blockers, callback, render) {
            blockers = blockers || [types.WALL];
            render = render || function() {};
            var bd = this;
            bd.starts = bd.starts || [];
            if (!(start instanceof Array)) {
                start = [start];
            }

            bd.end = end = bd.getClosestAvailablePoint(end);

            function complete() {
                if (start.length) {
                    var s = start.shift();
                    bd.starts.push(s);
                    bd[s.y][s.x] = types.START;
                    bd[end.y][end.x] = types.END;
                    bd.findPath(s, end, blockers, findAWay);
                } else {
                    callback();
                }
            }

            function getClosestSide(current, target) {
                var sides = getSidePoints(current);
                var next;
                for(var i = 0; i < sides.length; i += 1) {
                    sides[i].dist = getDistance(sides[i].x, sides[i].y, target.x, target.y);
                    if (!next || sides[i].dist < next.dist) {
                        next = sides[i];
                    }
                }
                return next;
            }

            function findAWay(path) {// we use the path finder to find a path.
                var closest = path.closest;// during the path finder the closest spot it comes up to in distance to the end path then we store
                if (closest.x === end.x && closest.y === end.y) {
                    render();
                    complete();
                } else {// if it was not the end point. keep going.
                    // we find the wall in the direction of the center.
                    var pt = getClosestSide(closest, end);
                    while(bd.getValue(pt.y, pt.x) === types.WALL) {
                        bd[pt.y][pt.x] = types.PATH;// clear all walls as we jump.
                        pt = getClosestSide(pt, end);
                    }
                    render();
                    // we have jumped over that wall and keep track of the point we jumped over.
                    bd.findPath(pt, end, blockers, findAWay);// we then path find again from that point to the end point.
                }
            }

            complete();
        }

        function getValue(r, c) {
            return this[r] ? this[r][c] : undefined;
        }

        /**
         * @param {{rows:int, cols:int, starts:Array.<{x:int, y:int}>, end:{x:int, y:int}}} options
         * @returns {Array}
         */
        function generate(options) {
            var o = options || {};
            var board = [];
            board.rows = parseInt(o.rows || 10, 10);
            board.cols = parseInt(o.cols || 10, 10);
            board.available = [];
            board.types = types;
            each(createCell, board);
            board.findPath = function(start, target, blockers, callback) {
                findPath(board, start, target, blockers, callback);
            };

            generateBoard(board);
            board.each = each.bind(board);
            board.asString = function() {
                return this.join("\n").split(",").join("");
            };
            board.forcePath = forcePath.bind(board);
            board.getValue = getValue.bind(board);
            board.getPointsFromEdge = function(offset, types, limit) {
                return getPointsFromEdge(board, offset, types || [types.PATH, types.PREFERRED], limit);
            };
            board.getClosestAvailablePoint = function(pt) {
                return getClosestAvailablePoint(board, pt);
            };
            // if the end or the start is not at an available spot. Move them to the closes one.
            board.end = board.getClosestAvailablePoint(o && o.end || getEdgePoint(board));
            return board;
        }

        function hasWall(board, y, x) {
            return board[y] && board[y][x] !== undefined ? true : false;
        }

        function getSides(board, active) {
            var a = active;
            var sides = [];
            if (hasWall(board, a.y - 1, a.x)) {
                sides.push({y: a.y - 1, x: a.x, ty: a.y - 2, tx: a.x});
            }//top
            if (hasWall(board, a.y + 1, a.x)) {
                sides.push({y: a.y + 1, x: a.x, ty: a.y + 2, tx: a.x});
            }//bottom
            if (hasWall(board, a.y, a.x - 1)) {
                sides.push({y: a.y, x: a.x - 1, ty: a.y, tx: a.x - 2});
            }//left
            if (hasWall(board, a.y, a.x + 1)) {
                sides.push({y: a.y, x: a.x + 1, ty: a.y, tx: a.x + 2});
            }//right
            return sides;
        }

        function getDistance(x1, y1, x2, y2) {
            return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
        }

        function setWall(board, pt, value) {
            board[pt.y][pt.x] = value;
        }

        function breakWall(board, point) {
            var sides = getSides(board, point);
            var wallsToBreak = rand(1.3, 1);
            for (var i = 0; i < wallsToBreak; i += 1) {
                var index = rand(sides.length);
                setWall(board, sides[index], types.PATH);
                sides.splice(index, 1);
            }
        }

        function generateBoard(board) {
            while (board.available.length) {
                var index = rand(board.available.length);
                breakWall(board, board.available[index]);
                board.available.splice(index, 1);
            }
            delete board.available;
        }

        function getClosestAvailablePoint(board, pt) {
            var p = {y:Math.round(pt.y), x:Math.round(pt.x)}, result;
            if (board.getValue(p.y, p.x)) {
                return p;
            }
            var sides = getSidePoints(p);
            for(var i = 0; i < sides.length; i += 1) {
                if (board.getValue(sides[i].y, sides[i].x)) {
                    return sides[i];
                }
            }
            // if we didn't find one. Then we need to try the sides and keep branching out till we do.
            for(i = 0; i < sides.length; i += 1) {
                result = getClosestAvailablePoint(board, sides[i]);
                if (result) {
                    return result;
                }
            }
            return null;
            // throw new Error("Unable to find close point");
        }


        exports.generate = generate;
        exports.types = types;
    }

    return new MazeGen();
});