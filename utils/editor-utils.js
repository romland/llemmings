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

    // >>> Prompt: editor/instructions/flood-fill.0001.txt
    function floodFill(x, y, targetColor, fillColor, ctx) {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

      const pixels = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const targetIndex = (y * width + x) * 4;

      if (!targetColor) {
        const targetIndex = (y * width + x) * 4;
        targetColor = {
          r: pixels[targetIndex],
          g: pixels[targetIndex + 1],
          b: pixels[targetIndex + 2],
          a: pixels[targetIndex + 3]
        };
      }

      const fillColorData = new Uint8ClampedArray([fillColor.r, fillColor.g, fillColor.b, fillColor.a]);
      const queue = [targetIndex];
      while (queue.length) {
        const currentIndex = queue.pop();
        if(
          pixels[currentIndex] === targetColor.r &&
          pixels[currentIndex + 1] === targetColor.g &&
          pixels[currentIndex + 2] === targetColor.b &&
          pixels[currentIndex + 3] === targetColor.a
        ) {
          pixels[currentIndex] = fillColorData[0];
          pixels[currentIndex + 1] = fillColorData[1];
          pixels[currentIndex + 2] = fillColorData[2];
          pixels[currentIndex + 3] = fillColorData[3];
    
          const x = (currentIndex / 4) % width;
          const y = Math.floor(currentIndex / 4 / width);
    
          if (x > 0) queue.push(currentIndex - 4);
          if (x < width - 1) queue.push(currentIndex + 4);
          if (y > 0) queue.push(currentIndex - width * 4);
          if (y < height - 1) queue.push(currentIndex + width * 4);
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    return {
        douglasPeucker : douglasPeucker,
        floodFill : floodFill,
    }
})();
