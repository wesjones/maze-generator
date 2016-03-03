/*!
* maze-generator v.0.0.1
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
    //! src/maze-generator.js
    define("mazeGenerator", [ "dispatcher" ], function(dispatcher) {
        var WALL = 0;
        var START = 1;
        var PATH = 2;
        var ACTIVE = 3;
        function MazeGenerator(rows, cols, startPercent, wait, BREAK_AT) {
            var self = this;
            startPercent = startPercent || .1;
            var board = [];
            var available = [];
            var offset = 2;
            var intv;
            var start;
            var current;
            var count = 0;
            var max;
            var ready = false;
            var allAvailablePoints = [];
            function Point(x, y) {
                this.x = x;
                this.y = y;
            }
            Point.prototype.clone = function() {
                return new Point(this.x, this.y);
            };
            function init() {
                start = new Point(Math.floor(rows * .5), Math.floor(cols * .5));
                reset(rows, cols, startPercent, wait, start.x, start.y);
            }
            function reset(r, c, p, w, x, y) {
                allAvailablePoints.length = 0;
                rows = r;
                cols = c;
                startPercent = p;
                wait = w;
                max = rows * cols / 4;
                ready = false;
                available.length = 0;
                buildCells();
                start.x = x;
                start.y = y;
                current = start.clone();
                setCell(current.y, current.x, START);
                available = getAvailablePoints(current.y, current.x);
                next();
            }
            function getAvailablePoints(y, x) {
                var walls = getCellWalls(y, x), len = walls.length, avail = [];
                for (var i = 0; i < len; i += 2) {
                    var source = walls[i];
                    var dest = walls[i + 1];
                    var item = {
                        source: source,
                        dest: dest,
                        inBetween: new Point(source.x - (source.x - dest.x) * .5, source.y - (source.y - dest.y) * .5)
                    };
                    avail.push(item);
                }
                return avail;
            }
            function stop() {
                clearTimeout(intv);
            }
            function later(time) {
                stop();
                intv = setTimeout(next, time || wait || 500);
            }
            function next(force) {
                if (available.length || force) {
                    var cur = available.splice(Math.floor(Math.random() * available.length), 1)[0];
                    cur.type = PATH;
                    available = available.concat(getAvailablePoints(current.y, current.x));
                    var dest = cur.dest;
                    if (!dest || board[dest.y][dest.x] === PATH || board[dest.y][dest.x] === START) {
                        next();
                        return;
                    }
                    if (current.y === start.y && current.x === start.x) {
                        setCell(current.y, current.x, START);
                    } else if (board[current.y][current.x] === ACTIVE) {
                        setCell(current.y, current.x, PATH);
                    }
                    setCell(cur.inBetween.y, cur.inBetween.x, PATH);
                    setCell(dest.y, dest.x, ACTIVE);
                    if (Math.floor(Math.random() * BREAK_AT) === 0) {
                        breakAWall();
                    }
                    count += 1;
                    current = dest;
                    allAvailablePoints.push(cur.inBetween);
                    allAvailablePoints.push(dest);
                    self.fire("render", board, getPercent(), cur.inBetween.clone(), dest.clone());
                    if (available.length < rows * cols * startPercent) {
                        later(10);
                    } else {
                        if (!ready) {
                            ready = true;
                            self.fire("ready", start.clone());
                        }
                        later(0);
                    }
                }
            }
            function breakAWall() {
                var walls = getCellWalls(current.y, current.x, 1);
                var wall = walls[Math.floor(Math.random() * walls.length)];
                if (wall && wall.y && wall.x && wall.y < rows - 1 && wall.x < cols - 1) {
                    setCell(wall.y, wall.x, PATH);
                }
            }
            function getCellWalls(row, col, off) {
                var walls = [];
                off = off || offset;
                if (!inMaze(row, col - off)) {
                    walls.push(new Point(col, row));
                    walls.push(new Point(col - off, row));
                }
                if (!inMaze(row - offset, col)) {
                    walls.push(new Point(col, row));
                    walls.push(new Point(col, row - off));
                }
                if (!inMaze(row, col + offset)) {
                    walls.push(new Point(col, row));
                    walls.push(new Point(col + off, row));
                }
                if (!inMaze(row + offset, col)) {
                    walls.push(new Point(col, row));
                    walls.push(new Point(col, row + off));
                }
                return walls;
            }
            function buildCells() {
                for (var y = 0; y < rows; y += 1) {
                    board[y] = [];
                    for (var x = 0; x < cols; x += 1) {
                        board[y][x] = WALL;
                    }
                }
            }
            function isOutOfBounds(y, x) {
                return y < 0 || x < 0 || y >= rows || x >= cols;
            }
            function inMaze(y, x) {
                if (isOutOfBounds(y, x)) {
                    return true;
                }
                return board[y][x] === PATH || board[y][x] === START;
            }
            function setCell(y, x, value) {
                if (!isOutOfBounds(y, x)) {
                    board[y][x] = value;
                }
            }
            function getBoard() {
                return board;
            }
            function getPercent() {
                return count / max;
            }
            function getValue(x, y) {
                return board[y] && board[y][x];
            }
            function getValuesAroundPoint(x, y, value) {
                var values = [];
                if (getValue(x, y - 1) === value) {
                    values.push(new Point(x, y - 1));
                }
                if (getValue(x, y + 1) === value) {
                    values.push(new Point(x, y + 1));
                }
                if (getValue(x - 1, y) === value) {
                    values.push(new Point(x - 1, y));
                }
                if (getValue(x + 1, y) === value) {
                    values.push(new Point(x + 1, y));
                }
                return values;
            }
            function getAllAvailablePoints() {
                return allAvailablePoints;
            }
            self.getBoard = getBoard;
            self.getPercent = getPercent;
            self.getValue = getValue;
            self.setCell = setCell;
            self.getAvailablePoints = getAvailablePoints;
            self.getValuesAroundPoint = getValuesAroundPoint;
            self.stop = stop;
            self.reset = reset;
            self.getAllAvailablePoints = getAllAvailablePoints;
            dispatcher(self);
            init();
            return self;
        }
        exports.types = {
            WALL: WALL,
            START: START,
            PATH: PATH,
            ACTIVE: ACTIVE
        };
        exports.create = function(rows, cols, startPercent, wait, breakAt) {
            return new MazeGenerator(rows, cols, startPercent, wait, breakAt);
        };
    });
    //! node_modules/hbjs/src/utils/async/dispatcher.js
    define("dispatcher", [ "apply", "isFunction" ], function(apply, isFunction) {
        function Event(type) {
            this.type = type;
            this.defaultPrevented = false;
            this.propagationStopped = false;
            this.immediatePropagationStopped = false;
        }
        Event.prototype.preventDefault = function() {
            this.defaultPrevented = true;
        };
        Event.prototype.stopPropagation = function() {
            this.propagationStopped = true;
        };
        Event.prototype.stopImmediatePropagation = function() {
            this.immediatePropagationStopped = true;
        };
        Event.prototype.toString = function() {
            return this.type;
        };
        function validateEvent(e) {
            if (!e) {
                throw Error("event cannot be undefined");
            }
        }
        var dispatcher = function(target, scope, map) {
            if (target && target.on && target.on.dispatcher) {
                return target;
            }
            target = target || {};
            var listeners = {};
            function off(event, callback) {
                validateEvent(event);
                var index, list;
                list = listeners[event];
                if (list) {
                    if (callback) {
                        index = list.indexOf(callback);
                        if (index !== -1) {
                            list.splice(index, 1);
                        }
                    } else {
                        list.length = 0;
                    }
                }
            }
            function on(event, callback) {
                if (isFunction(callback)) {
                    validateEvent(event);
                    listeners[event] = listeners[event] || [];
                    listeners[event].push(callback);
                    return function() {
                        off(event, callback);
                    };
                }
            }
            on.dispatcher = true;
            function once(event, callback) {
                if (isFunction(callback)) {
                    validateEvent(event);
                    function fn() {
                        off(event, fn);
                        apply(callback, scope || target, arguments);
                    }
                    return on(event, fn);
                }
            }
            function getListeners(event, strict) {
                validateEvent(event);
                var list, a = "*";
                if (event || strict) {
                    list = [];
                    if (listeners[a]) {
                        list = listeners[a].concat(list);
                    }
                    if (listeners[event]) {
                        list = listeners[event].concat(list);
                    }
                    return list;
                }
                return listeners;
            }
            function removeAllListeners() {
                listeners = {};
            }
            function fire(callback, args) {
                return callback && apply(callback, target, args);
            }
            function dispatch(event) {
                validateEvent(event);
                var list = getListeners(event, true), len = list.length, i, event = typeof event === "object" ? event : new Event(event);
                if (len) {
                    arguments[0] = event;
                    for (i = 0; i < len; i += 1) {
                        if (!event.immediatePropagationStopped) {
                            fire(list[i], arguments);
                        }
                    }
                }
                return event;
            }
            if (scope && map) {
                target.on = scope[map.on] && scope[map.on].bind(scope);
                target.off = scope[map.off] && scope[map.off].bind(scope);
                target.once = scope[map.once] && scope[map.once].bind(scope);
                target.dispatch = target.fire = scope[map.dispatch].bind(scope);
            } else {
                target.on = on;
                target.off = off;
                target.once = once;
                target.dispatch = target.fire = dispatch;
            }
            target.getListeners = getListeners;
            target.removeAllListeners = removeAllListeners;
            return target;
        };
        return dispatcher;
    });
    //! node_modules/hbjs/src/utils/data/apply.js
    define("apply", [ "isFunction" ], function(isFunction) {
        return function(func, scope, args) {
            if (!isFunction(func)) {
                return;
            }
            args = args || [];
            switch (args.length) {
              case 0:
                return func.call(scope);

              case 1:
                return func.call(scope, args[0]);

              case 2:
                return func.call(scope, args[0], args[1]);

              case 3:
                return func.call(scope, args[0], args[1], args[2]);

              case 4:
                return func.call(scope, args[0], args[1], args[2], args[3]);

              case 5:
                return func.call(scope, args[0], args[1], args[2], args[3], args[4]);

              case 6:
                return func.call(scope, args[0], args[1], args[2], args[3], args[4], args[5]);
            }
            return func.apply(scope, args);
        };
    });
    //! node_modules/hbjs/src/utils/validators/isFunction.js
    define("isFunction", function() {
        var isFunction = function(val) {
            return typeof val === "function";
        };
        return isFunction;
    });
    //! #################  YOUR CODE ENDS HERE  #################### //
    finalize();
    return global["mazegen"];
})(this["mazegen"] || {}, function() {
    return this;
}());