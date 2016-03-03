define('mazeGenerator', ['dispatcher'], function (dispatcher) {

    var WALL = 0;
    var START = 1;
    var PATH = 2;
    var ACTIVE = 3;

    function MazeGenerator(rows, cols, startPercent, wait, BREAK_AT) {
        var self = this;
        startPercent = startPercent || 0.10;
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

        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };

        function init() {
            start = new Point(Math.floor(rows * 0.5), Math.floor(cols * 0.5));
            reset(rows, cols, startPercent, wait, start.x, start.y);
        }

        function reset(r, c, p, w, x, y) {
            allAvailablePoints.length = 0;
            rows = r;
            cols = c;
            startPercent = p;
            wait = w;
            max = (rows * cols) / 4;
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
            var walls = getCellWalls(y, x),
                len = walls.length,
                avail = [];
            for (var i = 0; i < len; i += 2) {
                var source = walls[i];
                var dest = walls[i + 1];
                var item = {
                    source: source, //new Point(sourceX, sourceY),
                    dest: dest, //new Point(destX, destY),
                    inBetween: new Point(source.x - (source.x - dest.x) * 0.5, source.y - (source.y - dest.y) * 0.5)
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
                if (Math.floor(Math.random() * BREAK_AT) === 0) {// randomly break down a wall.
                    breakAWall();
                }
                count += 1;

                current = dest;
                allAvailablePoints.push(cur.inBetween);
                allAvailablePoints.push(dest);
                self.fire('render', board, getPercent(), cur.inBetween.clone(), dest.clone());
                if (available.length < (rows * cols * startPercent)) {
                    later(10);
                } else {
                    if (!ready) {
                        ready = true;
                        self.fire('ready', start.clone());
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
            return (y < 0 || x < 0 || y >= rows || x >= cols);// -1 to keep a border on right and bottom.
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
    exports.create = function (rows, cols, startPercent, wait, breakAt) {
        return new MazeGenerator(rows, cols, startPercent, wait, breakAt);
    };
});