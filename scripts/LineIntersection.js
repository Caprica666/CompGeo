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
    else    // lines are parallel?
    {
        if (Math.abs(dy / dx - m) < eps)
        {
            var dist = Math.abs(p1.Y() - m * p1.X() - b) / Math.sqrt(m**2 + 1);
            return { distance: dist };
        }
        var t = (p1.X() - (p1.Y() - b) / m) / ((dy / m) - dx);
    }       
    if (isNaN(t))
    {
        throw new Error("t is NAN");
    }
    if ((t >= -eps) && (t <= (1 + eps)))
    {
        var isect = [ p1.X() + t * dx, p1.Y() + t * dy ];
        return { intersection: isect, t: t };
    }
    return { t: t };
}
