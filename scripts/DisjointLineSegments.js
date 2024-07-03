

function SortEventOnY(e1, e2)
{
    if (e1 === e2)
    {
        return 0;
    }
    var y1 = e1.YIntersection(sweepX);
    var y2 = e2.YIntersection(sweepX);
    var dy = y1 - y2;

    if (Math.abs(dy) > 1e-13)
    {
        return dy;
    }
    var dslope = e1.slope - e2.slope; 
    return dslope; 
}

class DisjointSegs
{
    constructor()
    {
        this.epsilon = 1e-13;
    }

    Determinant(p1, p2, p3)
    {
        var det = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p3[0] - p1[0]) * (p2[1] - p1[2]);
        return det;
    }

    // Line / line segment intersection
    ComputeLineIntersection(p1, p2, ev)
    {
        var dy1 = p2[1] - p1[1];
        var dx1 = p2[0] - p1[0];
        var dy2 = ev.point2[1] - ev.point1[1];
        var dx2 = ev.point2[0] - ev.point1[0];
        var slope2 = ev.slope;
        var eps = 0.000001;
        var t1;
        var t2;
        var y;
        var x;
        
        // line1 is vertical
        if (Math.abs(dx1) < this.epsilon)
        {
            if (ev.slope == Number.MAX_SAFE_INTEGER) // both lines vertical
            {
                if (Math.abs(ev.point1[0] - p1[0]) > this.epsilon)
                {
                    return null;                    // lines are parallel
                }
            }
            t2 = (p1[0] - ev.point1[0]) / dx2;
            y = (ev.point1[1] + t2 * dy2);
            t1 = (y - p1[1]) / dy1;
        }
        // line1 is horizontal
        else if (Math.abs(dy1) < this.epsilon)
        {
            if (Math.abs(slope2) < this.epsilon)  // both lines are horizotal
            {
                if (Math.abs(ev.point1[1] - p1[1]) > this.epsilon)
                {
                    return null;                    // lines are parallel
                }               
            }
            t2 = (p1[1] - ev.point1[1]) / dy2;
            x = ev.point1[0] + t2 * dx2;
            t1 = (x - p1[0]) / dx1;
        }
        // line1 is not horizontal or vertical
        else
        {
            var slope1 = dy1 / dx1;

            if (Math.abs(slope2) < this.epsilon)  // line2 is horzontal
            {
                t1 = (ev.point1[1] - p1[1]) / dy2;
                x = p1[0] + t1 * dx1;
                t2 = (x - ev.point1[0]) / dx2;
            }
            else if (slope2 == Number.MAX_SAFE_INTEGER) // line2 is vertical
            {
                t1 = (ev.point1[0] - p1[0]) / dx1;
                y = ev.point1[1] + t1 * dy1;                              
                t2 = (y - ev.point1[1]) / dy2;
            }
            else if (Math.abs(slope1 - slope2) < this.epsilon)
            {
                return null;                        // line are parallel
            }
            else
            {
                var b2 = ev.point1[1] - slope2 * ev.point1[0];
                var b1 = p1[1] - slope1 * p1[0];
                //var t = (p1.X() - (p1.Y() - b) / m) / ((dy / m) - dx);
                t1 = (p1[0] - (p1[1] - b2) / slope2) / ((dy1 / slope2) - dx1);
                t2 = (ev.point1[0] - (ev.point1[1] - b1) / slope1) / ((dy2 / slope1) - dx2);
            }
        }
        if (isNaN(t2))
        {
            throw new Error("t2 is NAN");
        }
        if ((t2 >= -eps) && (t2 <= (1 + this.epsilon)) &&
            (t1 >= -eps) && (t1 <= (1 + this.epsilon)))
        {
            var isect = [ ev.point1[0] + t2 * dx2, ev.point2[1] + t2 * dy2 ];
            return { intersection: isect, t: t2 };
        }
        return { t: t2 };
    }

    ComputeLinePoint(p1, p2, t)
    {
        var dy = p2[1] - p1[1];
        var dx = p2[0] - p1[0];
        
        return [ p1[0] + t * dx, p1[1] + t * dy ];
    }

    PrintYIntersections()
    {
        var iter = this.tree.iterator();
        var str = this.tree.label + ": ";
        var i = 0;
        var ev;

        while ((ev = iter.next()) !== null)
        {
            var yint = ev.YIntersection(sweepX);
            str += ev.EventToString() + " " + yint.toFixed(2) + " ";
            if ((++i % 6) == 0)
            {
                log(str);
                str = "";
            }
        }
        log(str);
    }

    FindIntersection(e1, e2)
    {
        var result = this.ComputeLineIntersection(e2.point1, e2.point2, e1);
        var rc = 0;

        if ((result != null) && (result.intersection != null))
        {
            var t = result.t;
            var newpoint;
            
            if ((t >= 0) && (t <= 1))
            {
                if (t < 0.5)
                {
                    t += 0.05;
                    newpoint = this.ComputeLinePoint(e1.point1, e1.point2, t);
                    log("Change endpoint 1 " + e1.EventToString() + " to [" + newpoint[0] + ", " + newpoint[1] + "]");
                    e1.point1 = newpoint;
                    return -1;
                }
                else
                {
                    t -= 0.05;
                    newpoint = this.ComputeLinePoint(e1.point1, e1.point2, t);
                    log("Change endpoint 2 " + e1.name + " from [" + e1.point2[0] + ", " + e1.point2[1] + "] to [" + newpoint[0] + ", " + newpoint[1] + "]");
                    e1.point2 = newpoint;
                    rc = 1;
                }
            }
        }   
        return rc;
    }

    CheckForIntersections(ev)
    {  
        var upper = this.tree.FindUpperBound(ev);
        var p1changed = false;
        var p2changed = false;

        // check for intersection with current event and its successors
        while (upper != null)
        {
            var ymin = Math.min(upper.point1[1], upper.point2[1]);
            var ymax = Math.max(ev.point1[1], ev.point2[1]);
            if (ymax < ymin)
            {
                break;
            }
            var result = this.FindIntersection(ev, upper);
            if (result < 0)
            {
                p1changed = true;
            }
            else if (result > 0)
            {
                p2changed = true;
            }
            upper = this.tree.FindUpperBound(upper);   
        }
        var lower = this.tree.FindLowerBound(ev);

        while (lower != null)
        {
            var ymax = Math.max(lower.point1[1], lower.point2[1]);
            var ymin = Math.min(ev.point1[1], ev.point2[1]);
            if (ymax < ymin)
            {
                break;
            }
            var result = this.FindIntersection(ev, lower);
            if (result < 0)
            {
                p1changed = true;
            }
            else if (result > 0)
            {
                p2changed = true;
            }
            lower = this.tree.FindLowerBound(lower);   
        }
        if (p1changed | p2changed)
        {
            this.eventQ.RemoveEvent(ev.link);
            ev.link.point1 = ev.point1;
            ev.link.point2 = ev.point2;
            this.eventQ.InsertEvent(ev.link);
            if (p1changed)
            {
                this.eventQ.InsertEvent(ev);
                return;
            }
        }
        this.tree.InsertEvent(ev);            
    }

    // Find all the intersection points of a set of line segments
    //
    DisjointLineSegments(lineSegmentArray)
    {
        // sort line segments based on X
        this.eventQ = new EventTree('eventQ', new RBTree(SortEventOnXY));
        for (let i = 0; i < lineSegmentArray.length; i += 2)
        {
            var p1 = lineSegmentArray[i];
            var p2 = lineSegmentArray[i + 1];
            var name = 'L' + (i / 2);
            var ev1 = new LineEvent(name, 'first', p1, p2);
        
            this.eventQ.InsertEvent(ev1);
            var ev2 = new LineEvent(name, 'last', p1, p2, ev1);
            ev1.link = ev2;
            this.eventQ.InsertEvent(ev2);
        }

        // create balanced binary search tree and add first segment
        this.tree = new EventTree('tree', new RBTree(SortEventOnY));
        var disjointsegs = [];
        var ev;

        while ((ev = this.eventQ.Min()) != null)
        {
            log("processing event " + ev.EventToString());
            this.eventQ.PrintTree();
            this.PrintYIntersections();
            this.eventQ.RemoveEvent(ev);
            if (ev.type == 'last')
            {
                this.tree.RemoveEvent(ev.link);
                disjointsegs.push(ev.link.point1);
                disjointsegs.push(ev.link.point2);
            }
            else if (ev.type == 'first')
            {
                sweepX = ev.GetX();
                this.CheckForIntersections(ev); 
            }
        }
        return disjointsegs; 
    }
}

function CreateDisjointLineSegments(randomSegs, board, showRandoms)
{
    if (showRandoms)
    {
        AddLineSegmentsToBoard(board, randomSegs, 'L');
    }
    var dj = new DisjointSegs();
    var disjoint = dj.DisjointLineSegments(randomSegs);
    return disjoint;
}