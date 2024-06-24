

function SortEventOnY(e1, e2)
{
    if (e1 === e2)
    {
        return 0;
    }
    var x = e1.point1[0];

    if (e2.point1[0] > x)
    {
        x = e2.point1[0];
    }
    x = sweepX;
    var y1 = e1.YIntersection(x);
    var y2 = e2.YIntersection(x);
    var dy = y1 - y2;

    if (Math.abs(dy) > this.epsilon)
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
        var dy = p2[1] - p1[1];
        var dx = p2[0] - p1[0];
        var eps = 0.000001;
        
        if (Math.abs(dx) < this.epsilon)
        {
            var x = ev.point1[0];
            t = (x - p1[0]) / dx;
        }
        else if (Math.abs(dy) < this.epsilon)
        {
            t = (b - p1[1]) / dy;
        }
        else    // lines are parallel
        {
            return null;
        }       
        if (isNaN(t))
        {
            throw new Error("t is NAN");
        }
        if ((t >= -eps) && (t <= (1 + eps)))
        {
            var isect = [ p1[0] + t * dx, p1[1] + t * dy ];
            return { intersection: isect, t: t };
        }
        return { t: t };
    }

    ComputeLinePoint(p1, p2, t)
    {
        var dy = p2[1] - p1[1];
        var dx = p2[0] - p1[0];
        
        return [ p1[0] + t * dx, p1[1] + t * dy ];
    }

    SortEventOnX(e1, e2)
    {
        if (e1.name == e2.name)
        {
            return 0;
        }
        var x1 = e1.GetX();
        var x2 = e2.GetX();
        
        var dx = x1 - x2;
        if (Math.abs(dx) > this.epsilon)
        {
            return dx;
        }
        var y1 = e1.GetY();
        var y2 = e2.GetY();
        var dy = y1 - y2;
        if (Math.abs(dy) > this.epsilon)
        {
            return dy;
        }
        log("Error - endpoints " + e1.name + " and " + e2.name + " co-indicent!");
        return 0;
    }

    PreventIntersection(tree, e1, e2)
    {
        var result = this.ComputeLineIntersection(e2.point1, e2.point2, e1);
    
        if ((result != null) && (result.intersection != null))
        {
            var t = result.t;
            
            tree.RemoveEvent(e1);
            if (t < 0.5)
            {
                t += 0.1;
                e1.point1 = this.ComputeLinePoint(e1.point1, e1.point2, t);
                log("Change endpoint 1 " + e1.name + " to [" + e1.point1[0] + ", " + e1.point1[1] + "]");
            }
            else
            {
                t -= 0.1;
                e1.point2 = this.ComputeLinePoint(e1.point1, e1.point2, t);
                log("Change endpoint 2 " + e1.name + " to [" + e2.point1[0] + ", " + e2.point1[1] + "]");
            }
            tree.InsertEvent(e1);
        }
        return result;
    }

    CheckIntersections(tree, ev)
    {  
        var lower = tree.FindLowerBound(ev);
        var upper = tree.FindUpperBound(ev);

        // check for intersection with current event and its predecessor
        if (lower != null)
        {
            this.PreventIntersection(tree, ev, lower);
        }
        // check for intersection with current event and its successor
        if ((upper != null) && (lower != upper))
        {
            this.PreventIntersection(tree, ev, upper);   
        }   
    }

    // Find all the intersection points of a set of line segments
    //
    DisjointLineSegments(lineSegmentArray)
    {
        // sort line segments based on X
        var eventQ = new EventTree('eventQ', new RBTree(SortEventOnXY));
        for (let i = 0; i < lineSegmentArray.length; i += 2)
        {
            var p1 = lineSegmentArray[i];
            var p2 = lineSegmentArray[i + 1];
            var name = 'L' + (i / 2);
            var ev1 = new LineEvent(name, 'first', p1, p2);
        
            eventQ.InsertEvent(ev1);
            var ev2 = new LineEvent(name, 'last', p1, p2, ev1);
            eventQ.InsertEvent(ev2);
        }

        // create balanced binary search tree and add first segment
        var tree = new EventTree('tree', new RBTree(SortEventOnY));
        var disjointsegs = [];
        var ev;

        while ((ev = eventQ.Min()) != null)
        {
            log("processing event " + ev.EventToString());
            eventQ.PrintTree();
            tree.PrintTree();
            eventQ.RemoveEvent(ev);
            if (ev.type == 'last')
            {
                eventQ.RemoveEvent(ev.link);
            }
            else if (ev.type == 'first')
            {
                sweepX = ev.GetX();
                tree.InsertEvent(ev);
                this.CheckIntersections(tree, ev); 
            }
        }
        return disjointsegs; 
    }
}

function CreateDisjointLineSegments(n, bounds)
{
    var lsegs = CreateRandomLineSegments(n, bounds);
    var dj = new DisjointSegs();
    var disjoint = dj.DisjointLineSegments(lsegs);
    return disjoint;
}