function MazeItem(type, board, keys, point, pathFinder) {
    var self = this;
    var target = [];
    var wanderIntv;
    self.type = type;
    self.x = point && point.x || 0;
    self.y = point && point.y || 0;

    self.up = function() {
        board.move(self, self.x, self.y - 1);
    };

    self.down = function() {
        board.move(self, self.x, self.y + 1);
    };

    self.left = function() {
        board.move(self, self.x - 1, self.y);
    };

    self.right = function() {
        board.move(self, self.x + 1, self.y);
    };

    self.stop = function() {
        clearInterval(wanderIntv);
    };

    self.start = function() {
        wanderIntv = setInterval(wander, 200);
    };

    if (keys && keys instanceof Array) {
        window.addEventListener('keydown', function(evt) {
            //console.log(evt.keyCode);
            if (evt.keyCode === keys[0]) {
                self.up();
            } else if (evt.keyCode === keys[1]) {
                self.left();
            } else if (evt.keyCode === keys[2]) {
                self.down();
            } else if (evt.keyCode === keys[3]) {
                self.right();
            }
        });
    } else if (keys === "wander") {
        self.updateType = "wander";
        self.start();
    }

    function wander() {
        var point;
        if (target && target.length) {
            point = target.shift();
            board.move(self, point.x, point.y);
        } else {
            target = buildWanderTarget();
        }
    }

    function buildWanderTarget() {
        var points = board.getAvailablePoints();
        var point = points[Math.floor(Math.random() * points.length)];
        return pathFinder.findPath(self, point, board.maze.getBoard(), [board.allowTypes.PATH, board.allowTypes.START]);
    }


    self.update = function(x, y) {
        //if (self.updateType === "wander") {
        //    wander();
        //}
    };
}