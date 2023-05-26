var EditorUtils = (function () {
    /*
    >>> Prompt: editor/instructions/point-reduction.0001.txt

    To simplify/reduce the number of points in drawn coordinates, we can use a technique
    called Douglas-Peucker algorithm. This algorithm removes points that don’t contribute
    to the overall shape of the line or polygon.
    */
    // Function that implements the Douglas Peucker algorithm to reduce points
    function douglasPeucker(points, tolerance)
    {
        // Find the point with the maximum distance
        let dmax = 0;
        let index = 0;
        const end = points.length - 1;
        for (let i = 1; i < end; i++) {
            let d = perpendicularDistance(points[i], points[0], points[end]);
            if (d > dmax) {
                index = i;
                dmax = d;
            }
        }

        // If max distance is greater than tolerance, recursively simplify
        if (dmax > tolerance) {
            // Recursive call
            const left = points.slice(0, index + 1);
            const right = points.slice(index);
            const resultsLeft = douglasPeucker(left, tolerance);
            const resultsRight = douglasPeucker(right, tolerance);

            // Build the result list
            return resultsLeft.slice(0, resultsLeft.length - 1).concat(resultsRight);
        } else {
            return [points[0], points[end]];
        }
    }

    // Function that calculates the perpendicular distance from a point to a line
    function perpendicularDistance(point, start, end) {
        const { x: startX, y: startY } = start;
        const { x: endX, y: endY } = end;
        const { x: pointX, y: pointY } = point;
        const numerator = Math.abs((endY - startY) * pointX - (endX - startX) * pointY + endX * startY - endY * startX);
        const denominator = Math.sqrt(Math.pow((endY - startY), 2) + Math.pow((endX - startX), 2));
        return numerator / denominator;
    }

    return {
        douglasPeucker : douglasPeucker,
    }
})();
