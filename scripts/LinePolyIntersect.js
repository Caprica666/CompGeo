    // Line / line segment intersection
    function FindLineIntersection(p1, p2, line)
    {
        // line is parallel to this edge if slopes are equal
        // return distance from line to edge in this case
        var dy = p2.Y() - p1.Y();
        var dx = p2.X() - p1.X();
        var b = line.getRise();
        var m = line.getSlope();
        var eps = 0.000001;
      
        if (line.isVertical())
        {
            var x = line.point1.X();
            t = (x - p1.X()) / dx;
        }
        else if (line.isHorizontal())
        {
            t = (b - p1.Y()) / dy;
        }
        else
        {
            if (Math.abs(dy / dx - m) < eps)
            {
                var dist = Math.abs(p1.Y() - m * p1.X() - b) / Math.sqrt(m**2 + 1);
                return { distance: dist };
            }
            // var t = ((p1.X() * b) - (p1.Y() - b) * (b / m)) / (dy * (b / m) - dx * b);
            var t = (p1.X() - (p1.Y() - b) / m) / ((dy / m) - dx);
        }
        
        if (isNaN(t))
        {
            throw new Error("t is NAN");
        }
        console.log(p1.name + "-> " + p2.name + " t = " + t);
        if ((t >= -eps) && (t <= (1 + eps)))
        {
            var isect = [ p1.X() + t * dx, p1.Y() + t * dy ];
            return { intersection: isect, t: t };
        }
        return { t: t };
    }

    // Determine if the angle between the edge and the line
    // is greater than 90 degrees
    function AngleGreaterThan90(p1, p2, line)
    {
        var ux = p2.X() - p1.X();
        var uy = p2.Y() - p1.Y();
    
        if (line.isVertical())
        {
            return uy;
        }
        else if (line.isHorizontal())
        {
            return ux;
        }
        var slope = line.getSlope();
        var yinter = line.getRise();    
        var vx = -yinter / slope;
        var vy = -yinter;
        var dot = (ux * vx) + (uy * vy);
        return dot < 0;
    }

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