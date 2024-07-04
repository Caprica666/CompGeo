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

function ComputeLinePoint(p1, p2, t)
{
    var dy = p2.Y() - p1.Y();
    var dx = p2.X() - p1.X();
    
    return [ p1.X() + t * dx, p1.Y() + t * dy ];
}

// Find the intersection of two line segments
// Returns intersection point or none if segments don't intersect
// Assumes p1.x <= p2.x and p3.x <= p4.x
function FindLineSegmentIntersection(p1, p2, p3, p4)
{ 
    // line 1 equation: a1 * x + b1 * y = c1
    var a1 = p2[1] - p1[1];
    var b1 = p1[0] - p2[0];
    var c1 = a1 * p1[0] + b1 * p1[1];

    // line 2 equation: a2 * x + b2 * y = c2
    var a2 = p4[1] - p3[1];
    var b2 = p3[0] - p4[0];
    var c2 = a2 * p3[0] + b2 * p3[1];

    var det = a1 * b2 - a2 * b1;

    // if determinant is zero, lines are parallel
    if (det == 0)
    {
        return null;
    }

    var x = (b2 * c1 - b1 * c2) / det;
    var y = (a1 * c2 - a2 * c1) / det;

    //log(x + "  [" + p1.X() + "," + p2.X() + "]  [" + p3.X() + "," + p4.X() + "]");
    //log(y + "  [" + p1.Y() + "," + p2.Y() + "]  [" + p3.Y() + "," + p4.Y() + "]");

    // check if x, y is outside first segment
    if ((p1[0] == p2[0])) // line is vertical, check Y
    {
        if (p1[1] < p2[1])
        {
            if ((y < p1[1]) || (y > p2[1]))
            {
                return null;
            }            
        }
        else
        {
            if ((y < p2[1]) || (y > p1[1]))
            {
                return null;
            }             
        }               
    }
    else
    {
        if (p1[0] < p2[0])
        {
            if ((x < p1[0]) || (x > p2[0]))
            {
                return null;
            }            
        }
        else
        {
            if ((x < p2[0]) || (x > p1[0]))
            {
                return null;
            }             
        }          
    }
    // check if x, y is outside second segment
    if ((p3[0] == p4[0])) // line is vertical, check Y
    {
        if (p3[1] < p4[1])
        {
            if ((y < p4[1]) || (y > p4[1]))
            {
                return null;
            }            
        }
        else
        {
            if ((y < p4[1]) || (y > p3[1]))
            {
                return null;
            }             
        } 
    }
    else
    {
        if (p3[0] < p4[0])
        {
            if ((x < p3[0]) || (x > p4[0]))
            {
                return null;
            }            
        }
        else
        {
            if ((x < p4[0]) || (x > p3[0]))
            {
                return null;
            }             
        }    
    }
    return [x, y];
}

function ComputeLineIntersection(p1, p2, p3, p4)
{
    var dy1 = p2[1] - p1[1];
    var dx1 = p2[0] - p1[0];
    var dy2 = p4[1] - p3[1];
    var dx2 = p4[0] - p3[0];
    var eps = 0.000001;
    var slope2 = (Math.abs(dy2) > eps) ? dy2 / dx2 : Number.MAX_VALUE;
    var slope1 = (Math.abs(dy1) > eps) ? dy1 / dx1 : Number.MAX_VALUE;;
    var t1;
    var t2;
    var y;
    var x;
    
    // line1 is vertical
    if (Math.abs(dx1) < this.epsilon)
    {
        if (slope2 == Number.MAX_VALUE) // both lines vertical
        {
            if (Math.abs(p3[0] - p1[0]) > eps)
            {
                return null;                    // lines are parallel
            }
        }
        t2 = (p1[0] - p3[0]) / dx2;
        y = (p3[1] + t2 * dy2);
        t1 = (y - p1[1]) / dy1;
    }
    // line1 is horizontal
    else if (Math.abs(dy1) < eps)
    {
        if (Math.abs(slope2) < eps)             // both lines are horizotal
        {
            if (Math.abs(p3[1] - p1[1]) > eps)
            {
                return null;                    // lines are parallel
            }               
        }
        t2 = (p1[1] - p3[1]) / dy2;
        x = p3[0] + t2 * dx2;
        t1 = (x - p1[0]) / dx1;
    }
    // line1 is not horizontal or vertical
    else
    {
        if (Math.abs(slope2) < eps)             // line2 is horzontal
        {
            t1 = (p3[1] - p1[1]) / dy2;

            x = p1[0] + t1 * dx1;
            t2 = (x - p3[0]) / dx2;
        }
        else if (slope2 == Number.MAX_VALUE)    // line2 is vertical
        {
            t1 = (p3[0] - p1[0]) / dx1;
            y = p3[1] + t1 * dy1;                              
            t2 = (y - p3[1]) / dy2;
        }
        else if (Math.abs(slope1 - slope2) < eps)
        {
            return null;                        // line are parallel
        }
        else
        {
            var b2 = p3[1] - slope2 * p3[0];
            var b1 = p1[1] - slope1 * p1[0];
            x = (b2 - b1) / (slope1 - slope2);
            t1 = (x - p1[0]) / dx1;
            t2 = (x - p3[0]) / dx2;
            //t1 = (p1[0] - (p1[1] - b2) / slope2) / ((dy1 / slope2) - dx1);
            //t2 = (p3[0] - (p3[1] - b1) / slope1) / ((dy2 / slope1) - dx2);
        }
    }
    if (isNaN(t2))
    {
        throw new Error("t2 is NAN");
    }
    if ((t2 >= -eps) && (t2 <= (1 + eps)) &&
        (t1 >= -eps) && (t1 <= (1 + eps)))
    {
        var isect2 = [ p3[0] + t2 * p4[0], p3[1] + t2 * p4[1] ];
        //var isect1 = [ p1[0] + t1 * p2[0], p1[1] + t1 * p2[1] ];
        return { intersection: isect2, t2: t2, t1: t1 };
    }
    return { t2: t2, t1: t1 };
}
