define('angleToDirection', ['radiansToDegrees'], function(radiansToDegrees) {
    var full = 360;
    return function angleToSide(angle) {
        var deg = Math.abs(radiansToDegrees(angle));
        if (deg <= full * 0.125 || angle > full * 0.875) {
            return 'right';
        }
        if (deg <= full * 0.375) {
            return 'up';
        }
        if (deg <= full * 0.625) {
            return 'left';
        }
        if (deg <= full * 0.875) {
            return 'down';
        }
        throw new Error("Something went wrong");

    };
});