# maze-generator
Generate mazes for other games.

```

    var board = mazegen.generate({
        start: {x:0, y:0},// set the start point
        end: {x:20, y:40},// set the end point
        rows: 21,// height
        cols: 41,// width
        points: 3// number of points to randomize the path from start to finish.
    });
    console.log(board.asString());


```