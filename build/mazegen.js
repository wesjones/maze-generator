/*!
* maze-generator v.0.1.0
* (c) 2016, Obogo
* License: MIT.
*/

(function(exports, global) {
    global["mazegen"] = exports;
    var define, internal, finalize = function() {};
    (function() {
        var get, defined, pending, definitions, initDefinition, $cachelyToken = "~", $depsRequiredByDefinitionToken = ".";
        get = Function[$cachelyToken] = Function[$cachelyToken] || function(name) {
            if (!get[name]) {
                get[name] = {};
            }
            return get[name];
        };
        definitions = get("c");
        defined = get("d");
        pending = get("p");
        initDefinition = function(name) {
            var args = arguments;
            var val = args[1];
            if (typeof val === "function") {
                defined[name] = val();
            } else {
                definitions[name] = args[2];
                definitions[name][$depsRequiredByDefinitionToken] = val;
            }
        };
        define = internal = function() {
            initDefinition.apply(null, arguments);
        };
        resolve = function(name, fn) {
            pending[name] = true;
            var deps = fn[$depsRequiredByDefinitionToken];
            var args = [];
            var i, len;
            var dependencyName;
            if (deps) {
                len = deps.length;
                for (i = 0; i < len; i++) {
                    dependencyName = deps[i];
                    if (definitions[dependencyName]) {
                        if (!pending.hasOwnProperty(dependencyName)) {
                            resolve(dependencyName, definitions[dependencyName]);
                        }
                        resolve(dependencyName, definitions[dependencyName]);
                        delete definitions[dependencyName];
                    }
                }
            }
            if (!defined.hasOwnProperty(name)) {
                for (i = 0; i < len; i++) {
                    dependencyName = deps[i];
                    args.push(defined.hasOwnProperty(dependencyName) && defined[dependencyName]);
                }
                defined[name] = fn.apply(null, args);
            }
            delete pending[name];
        };
        finalize = function() {
            for (var name in definitions) {
                resolve(name, definitions[name]);
            }
        };
        return define;
    })();
    //! ################# YOUR CODE STARTS HERE #################### //
    //! src/mazegen.js
    define("mazegen", function() {
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
                    board.available.push({
                        y: row,
                        x: col
                    });
                }
            }
            function getClosestAvailableSpot(board, pt) {
                var dist = board.available.length, d, a, spot;
                for (var i = 0; i < board.available.length; i += 1) {
                    a = board.available[i];
                    d = getDistance(a.x, a.y, pt.x, pt.y);
                    if (d < dist) {
                        dist = d;
                        spot = a;
                    }
                }
                return spot;
            }
            function getEdgePoint(board, avoidSide) {
                var edgePoints = [], pt;
                var maxY = board.rows - 1;
                var maxX = board.cols - 1;
                var range = Math.max(maxY, maxX) * .5;
                for (var i = 0; i < board.available.length; i += 1) {
                    pt = board.available[i];
                    if (pt.x === 0 || pt.y === 0 || pt.x === maxX || pt.y === maxY) {
                        if (avoidSide && getDistance(pt.x, pt.y, avoidSide.x, avoidSide.y) > range) {
                            edgePoints.push(pt);
                        } else if (!avoidSide) {
                            edgePoints.push(pt);
                        }
                    }
                }
                i = rand(edgePoints.length);
                return edgePoints[i];
            }
            function generate(options) {
                var o = options || {};
                var board = [];
                board.rows = o.rows || 10;
                board.cols = o.cols || 10;
                board.points = o.points || 1;
                board.pointRange = o.pointRange || .1;
                board.available = [];
                each(createCell, board);
                board.start = getClosestAvailableSpot(board, o && o.start || getEdgePoint(board));
                board.end = getClosestAvailableSpot(board, o && o.end || getEdgePoint(board, board.start));
                generatePath(board);
                board.each = each.bind(board);
                board.asString = function() {
                    return this.join("\n").split(",").join("");
                };
                return board;
            }
            function hasWall(board, y, x) {
                return board[y] && board[y][x] !== undefined ? true : false;
            }
            function getSides(board, active) {
                var a = active;
                var sides = [];
                if (hasWall(board, a.y - 1, a.x)) {
                    sides.push({
                        y: a.y - 1,
                        x: a.x,
                        ty: a.y - 2,
                        tx: a.x
                    });
                }
                if (hasWall(board, a.y + 1, a.x)) {
                    sides.push({
                        y: a.y + 1,
                        x: a.x,
                        ty: a.y + 2,
                        tx: a.x
                    });
                }
                if (hasWall(board, a.y, a.x - 1)) {
                    sides.push({
                        y: a.y,
                        x: a.x - 1,
                        ty: a.y,
                        tx: a.x - 2
                    });
                }
                if (hasWall(board, a.y, a.x + 1)) {
                    sides.push({
                        y: a.y,
                        x: a.x + 1,
                        ty: a.y,
                        tx: a.x + 2
                    });
                }
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
            function generatePath(board) {
                var len = board.available.length;
                var targetLen = board.points;
                var points = [ board.start ];
                while (points.length < targetLen) {
                    var p = board.available[rand(len)];
                    var last = points[points.length - 1];
                    var d = getDistance(p.x, p.y, last.x, last.y);
                    if (d > board.rows * .25) {
                        points.push(p);
                    }
                }
                points.push(board.end);
                console.log("path points", points.length);
                setWall(board, board.start, types.START);
                setWall(board, board.end, types.END);
                makePath(board, points, types.PREFERRED);
                while (board.available.length) {
                    var index = rand(board.available.length);
                    breakWall(board, board.available[index]);
                    board.available.splice(index, 1);
                }
            }
            function removeAvailablePoint(board, pt) {
                var p;
                for (var i = 0; i < board.available.length; i += 1) {
                    p = board.available[i];
                    if (p.y === pt.y && p.x === pt.x) {
                        board.available.splice(i, 1);
                        return;
                    }
                }
            }
            function sortByDist(a, b) {
                return a.dist - b.dist;
            }
            function makePath(board, points, value) {
                var current = points.shift();
                removeAvailablePoint(board, current);
                var next = points.shift();
                current.dist = getDistance(current.x, current.y, next.x, next.y);
                while (next) {
                    if (current.y !== next.y || current.x !== next.x) {
                        var sides = getSides(board, current);
                        var preferred = [];
                        var side;
                        for (var i = 0; i < sides.length; i += 1) {
                            sides[i].dist = getDistance(sides[i].tx, sides[i].ty, next.x, next.y);
                            if (sides[i].dist <= current.dist && board[sides[i].y][sides[i].x] !== types.PREFERRED) {
                                preferred.push(sides[i]);
                            }
                        }
                        sides.sort(sortByDist);
                        side = preferred.length ? preferred[rand(preferred.length)] : sides.shift();
                        if (board[current.y][current.x] === types.PATH) {
                            setWall(board, current, value || types.PATH);
                        }
                        setWall(board, side, value || types.PATH);
                        current = {
                            y: side.ty,
                            x: side.tx,
                            dist: side.dist
                        };
                        removeAvailablePoint(board, current);
                    } else {
                        next = points.shift();
                    }
                }
            }
            exports.generate = generate;
            exports.types = types;
        }
        return new MazeGen();
    });
    //! #################  YOUR CODE ENDS HERE  #################### //
    finalize();
    return global["mazegen"];
})(this["mazegen"] || {}, function() {
    return this;
}());