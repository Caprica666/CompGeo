
    // Line Polygon Intersection
    function LinePolyIntersect(vertices, line)
    {
        var n = vertices.length;
        var n2 = Math.floor(n / 2);
        if (n == 2)
        {
            n2 = 0;
        }
        var p1 = vertices[n2];
        var p2 = vertices[n2 + 1];
        var result = FindLineIntersection(p1, p2, line);
        if (result.intersection)
        {
            return result.intersection;
        }
        if (result.distance)
        {
            return result.distance;
        }
        if (n == 2)
        {
            return false;
        }
        if (n == 3)
        {
            return LinePolyIntersect(vertices.slice(0, 2), line);
        }
        if ((result.t < 0) && (n2 > 1))
        {
            return LinePolyIntersect(vertices.slice(0, n2 + 1), line);
        }
        else if (n - n2 > 2)
        {
            return LinePolyIntersect(vertices.slice(n2 + 1, n), line);
        }
        return false;
    }