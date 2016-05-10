define('getPointsFromEdge', function() {

    function getColsFromRow(points, board, row, offset, types) {
        for(var c = offset; c < board[row].length - offset; c += 1) {
            if (types.indexOf(board.getValue(row, c)) !== -1) {
                points.push({y:row, x:c});
            }
        }
    }

    function getRowsFromCol(points, board, col, offset, types) {
        for(var r = offset; r < board.length - offset; r += 1) {
            if (types.indexOf(board.getValue(r, col)) !== -1) {
                points.push({y:r, x:col});
            }
        }
    }

    return function getPointsOnEdge(board, offset, types, limit) {
        offset = offset || 0;
        var points = [], limited;
        getColsFromRow(points, board, offset, offset, types);// top
        getRowsFromCol(points, board, board[0].length - 1 - offset, offset, types);// right
        getColsFromRow(points, board, board.length - 1 - offset, offset, types);// bottom
        getRowsFromCol(points, board, offset, offset, types); // left
        if (limit) {
            limited = [];
            while(points.length && limited.length < limit) {
                var index = Math.floor((Math.random() * points.length));
                limited.push(points[index]);
                points.splice(index, 1);
            }
            return limited;
        }
        return points;
    };
});