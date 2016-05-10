/*!
* maze-generator v.0.2.1
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
    define("mazegen", [ "findPath", "angleToDirection", "getAngle", "getPointsFromEdge", "getSidePoints" ], function(findPath, angleToDirection, getAngle, getPointsFromEdge, getSidePoints) {
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
            function getEdgePoint(board) {
                return board.getPointsFromEdge(0, [ board.types.PATH ], 1)[0];
            }
            function forcePath(start, end, blockers, callback, render) {
                blockers = blockers || [ types.WALL ];
                render = render || function() {};
                var bd = this;
                bd.starts = bd.starts || [];
                if (!(start instanceof Array)) {
                    start = [ start ];
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
                    for (var i = 0; i < sides.length; i += 1) {
                        sides[i].dist = getDistance(sides[i].x, sides[i].y, target.x, target.y);
                        if (!next || sides[i].dist < next.dist) {
                            next = sides[i];
                        }
                    }
                    return next;
                }
                function findAWay(path) {
                    var closest = path.closest;
                    if (closest.x === end.x && closest.y === end.y) {
                        render();
                        complete();
                    } else {
                        var pt = getClosestSide(closest, end);
                        while (bd.getValue(pt.y, pt.x) === types.WALL) {
                            bd[pt.y][pt.x] = types.PATH;
                            pt = getClosestSide(pt, end);
                        }
                        render();
                        bd.findPath(pt, end, blockers, findAWay);
                    }
                }
                complete();
            }
            function getValue(r, c) {
                return this[r] ? this[r][c] : undefined;
            }
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
                    return getPointsFromEdge(board, offset, types || [ types.PATH, types.PREFERRED ], limit);
                };
                board.getClosestAvailablePoint = function(pt) {
                    return getClosestAvailablePoint(board, pt);
                };
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
            function generateBoard(board) {
                while (board.available.length) {
                    var index = rand(board.available.length);
                    breakWall(board, board.available[index]);
                    board.available.splice(index, 1);
                }
                delete board.available;
            }
            function getClosestAvailablePoint(board, pt) {
                var p = {
                    y: Math.round(pt.y),
                    x: Math.round(pt.x)
                }, result;
                if (board.getValue(p.y, p.x)) {
                    return p;
                }
                var sides = getSidePoints(p);
                for (var i = 0; i < sides.length; i += 1) {
                    if (board.getValue(sides[i].y, sides[i].x)) {
                        return sides[i];
                    }
                }
                for (i = 0; i < sides.length; i += 1) {
                    result = getClosestAvailablePoint(board, sides[i]);
                    if (result) {
                        return result;
                    }
                }
                return null;
            }
            exports.generate = generate;
            exports.types = types;
        }
        return new MazeGen();
    });
    //! src/findpath.js
    define("findPath", [ "getDistance", "getSidePoints" ], function(getDistance, getSidePoints) {
        function findPath(board, start, target, blockers, callback) {
            var paths = [ [ start ] ];
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
                for (var r = 0; r < board.length; r += 1) {
                    u[r] = [];
                    for (var c = 0; c < board[r].length; c += 1) {
                        u[r][c] = 0;
                    }
                }
                return u;
            }
            function available(pt) {
                var value = board[pt.y] && board[pt.y][pt.x];
                return used[pt.y] && used[pt.y][pt.x] || value === undefined || blockers.indexOf(value) !== -1 ? false : true;
            }
            function getAvailableSides(pt) {
                var sides = [], points = getSidePoints(pt);
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
                for (var i = 0; i < oldPaths.length; i += 1) {
                    if (!oldPaths[i].complete) {
                        if (answer = process(oldPaths[i])) {
                            return answer;
                        }
                    }
                }
            }
            function process(path) {
                var sides = getAvailableSides(path[path.length - 1]), p, found = false;
                paths.splice(paths.indexOf(path), 1);
                for (var i = 0; i < sides.length; i += 1) {
                    var complete = equal(sides[i], target);
                    if (complete) {
                        found = complete;
                    }
                    if (sides.length === 1) {
                        path.complete = complete;
                        path.push(sides[i]);
                        getClosestPoint(path);
                        paths.push(path);
                        if (found) {
                            return path;
                        }
                    } else {
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
                var closestPt = {
                    dist: getDistance(points[0].x, points[0].y, target.x, target.y),
                    pt: points[0]
                };
                for (var i = 1; i < points.length; i += 1) {
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
                while (Date.now() === now) {
                    var answer = next();
                    if (answer || !paths.length) {
                        clearInterval(intv);
                        callback(answer || closest);
                    }
                }
            }, 1);
        }
        exports.findPath = findPath;
        return findPath;
    });
    //! node_modules/hbjs/src/utils/geom/getDistance.js
    define("getDistance", function() {
        return function getDistance(x1, y1, x2, y2) {
            return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
        };
    });
    //! src/getSidePoints.js
    define("getSidePoints", [ "getPointToDirOfPoint" ], function(getPointToDirOfPoint) {
        return function getSidePoints(pt) {
            var sides = [];
            sides.push(sides.up = getPointToDirOfPoint(pt, "up"));
            sides.push(sides.right = getPointToDirOfPoint(pt, "right"));
            sides.push(sides.down = getPointToDirOfPoint(pt, "down"));
            sides.push(sides.left = getPointToDirOfPoint(pt, "left"));
            return sides;
        };
    });
    //! src/getPointToDirOfPoint.js
    define("getPointToDirOfPoint", function() {
        var deltas = {
            up: {
                x: 0,
                y: -1
            },
            right: {
                x: 1,
                y: 0
            },
            down: {
                x: 0,
                y: 1
            },
            left: {
                x: -1,
                y: 0
            }
        };
        return function getPointToDirOfPoint(pt, dir) {
            return {
                x: pt.x + deltas[dir].x,
                y: pt.y + deltas[dir].y
            };
        };
    });
    //! src/angleToDirection.js
    define("angleToDirection", [ "radiansToDegrees" ], function(radiansToDegrees) {
        var full = 360;
        return function angleToSide(angle) {
            var deg = Math.abs(radiansToDegrees(angle));
            if (deg <= full * .125 || angle > full * .875) {
                return "right";
            }
            if (deg <= full * .375) {
                return "up";
            }
            if (deg <= full * .625) {
                return "left";
            }
            if (deg <= full * .875) {
                return "down";
            }
            throw new Error("Something went wrong");
        };
    });
    //! node_modules/hbjs/src/utils/geom/radiansToDegrees.js
    define("radiansToDegrees", function() {
        return function radiansToDegrees(radians) {
            return radians * (180 / Math.PI);
        };
    });
    //! node_modules/hbjs/src/utils/geom/getAngle.js
    define("getAngle", function() {
        return function getAngle(x1, y1, x2, y2) {
            return Math.atan2(y2 - y1, x2 - x1);
        };
    });
    //! src/getPointsFromEdge.js
    define("getPointsFromEdge", function() {
        function getColsFromRow(points, board, row, offset, types) {
            for (var c = offset; c < board[row].length - offset; c += 1) {
                if (types.indexOf(board.getValue(row, c)) !== -1) {
                    points.push({
                        y: row,
                        x: c
                    });
                }
            }
        }
        function getRowsFromCol(points, board, col, offset, types) {
            for (var r = offset; r < board.length - offset; r += 1) {
                if (types.indexOf(board.getValue(r, col)) !== -1) {
                    points.push({
                        y: r,
                        x: col
                    });
                }
            }
        }
        return function getPointsOnEdge(board, offset, types, limit) {
            offset = offset || 0;
            var points = [], limited;
            getColsFromRow(points, board, offset, offset, types);
            getRowsFromCol(points, board, board[0].length - 1 - offset, offset, types);
            getColsFromRow(points, board, board.length - 1 - offset, offset, types);
            getRowsFromCol(points, board, offset, offset, types);
            if (limit) {
                limited = [];
                while (points.length && limited.length < limit) {
                    var index = Math.floor(Math.random() * points.length);
                    limited.push(points[index]);
                    points.splice(index, 1);
                }
                return limited;
            }
            return points;
        };
    });
    //! #################  YOUR CODE ENDS HERE  #################### //
    finalize();
    return global["mazegen"];
})(this["mazegen"] || {}, function() {
    return this;
}());