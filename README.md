# maze-generator
Generate mazes for other games.

```

    var rows = 21;// it is always recommended that the rows and columns be odd, otherwise you have a wall of the end of which ever side is even.
    var cols = 41;
    var startPoints = 3;
    var endPoint = {x: cols * 0.5, rows * 0.5};
    var board = mazegen.generate({
        rows: rows,
        cols: cols
    });
    // synchronous call to get points that are available around outside points.
    // if you pass 2 for the first argument, then all points will be in 2 squares from the outside
    // 0 will make it be points that are on the edge.
    var availablePoints = board.getPointsFromEdge(0, [board.types.PATH], startPoints);
    // this can generate paths while the maze is going. It is async, so pass a callback.
    board.forcePath(availablePoints, endPoint, [board.types.WALL], function() {
        console.log(board.asString());// output to the console the rendered board.
    });


```

##methods

board.types - this will tell you what type of values can be in the list. PREFERRED is no longer used.
board.asString() - this will output the board as a string of values. handy for console logging the value of the maze.
board.cols - the number of columns in the board
board.each(fn) - this will call the fn(r, c) for each item in the maze. It can be handy for rendering the maze.
board.end - the point of the end of the maze or exit.
board.findPath - given a start point and an end point it will try to find a way. If there isn't one it will return the path the got closest to the end.
board.forcePath - given a list of available points it will make sure to clear just enough blocks to allow a way to get to the end point for each start point.
board.getClosestAvailablePoint - given a point it will find a path point close to it if it is on a wall.
board.getPointsFromEdge - given an offset it will move in that many squares from the edge and return all points that match the types in that line around the map.
board.getValue - given the row and the column it will return the value in that part of the maze
board.rows - the number of rows
board.starts - this is only populated after calling forcePath. All paths forced will add those start points into this array.

