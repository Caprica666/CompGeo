
// Sort on Y and X
function SortOnY(e1, e2)
{
    if (e1.name == e2.name)
    {
        return 0;
    }
    var y1 = e1.Y;
    var y2 = e2.Y;
    
    var dy = y1 - y2;
    if (Math.abs(dy) > epsilon)
    {
        return dy;
    }
    var x1 = e1.GetX();
    var x2 = e2.GetX();
    var dx = x1 - x2;
    if (Math.abs(dx) > epsilon)
    {
        return dx;
    }
    log("Error - endpoints " + e1.name + " and " + e2.name + " co-indicent!");
    return e1.name.localeCompare(e2.name);
}

class Rectifier
{
    constructor(tree)
    { 
        this.tree = tree;
    }

    Determinant(p1, p2, p3)
    {
        var det = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p3[0] - p1[0]) * (p2[1] - p1[2]);
        return det;
    }

    // Move all the lines above the given one up by
    // the given amount
    MoveLinesUp(ev, amount)
    {
        var upper = this.tree.FindUpperBound(ev);

        while (upper != null)
        {
            log("Move " + ev.name + " up by " + amount);
            upper.Y[1] += amount;
            upper = this.tree.FindUpperBound(upper);
        }    
    }

    // Move all the lines below the given one down by
    // the given amount
    MoveLinesDown(ev, amount)
    {
        while (ev != null)
        {
            log("Move " + ev.name + " down by " + amount);
            ev.Y -= amount;
            ev = this.tree.FindLowerBound(ev);
        }    
    }

    EventRectify(ev)
    {
        var lower = this.tree.FindLowerBound(ev);
        var upper = this.tree.FindUpperBound(ev);

        if (upper != null)
        {
            // check if upper bound was above this line before rectification
            var ymin = Math.max(upper.point1[1], upper.point2[1]);
            if (this.Determinant(ev.point1, ev.point2, ymin) > 0)
            {
                // check if upper bound is below this line after rectification
                if (upper.Y <= ev.Y)
                {
                    var moveup = ev.Y - upper.Y + 1;
                    this.MoveLinesUp(upper, moveup);
                }
            }
        }
        if (lower != null)
        {
            // check if lower bound was below this line before rectification
            var ymax = Math.max(lower.point1[1], lower.point2[1]);
            if (this.Determinant(ev.point1, ev.point2, ymax) < 0)
            {
                // check if lower bound is above this line after rectification
                if (lower.Y >= ev.Y)
                {
                    var movedown = lower.Y - ev.Y - 1;
                    this.MoveLinesDown(lower, movedown);
                }
            }
        }
        this.tree.InsertEvent(tree, ev, 'tree');
    }
}

// Rectify a set of line segments
function RectifyLineSegments(lineSegmentArray)
{
    // sort line segments based on X and then Y
    var eventQ = new EventTree('eventQ', new RBTree(SortEventOnXY));
    for (let idx = 0; idx < lineSegmentArray.length; idx += 2)
    {
        var p1 = lineSegmentArray[idx];
        var p2 = lineSegmentArray[idx + 1];
        var isVert = Math.abs(p1[0] - p2[0]) < epsilon;
        var type = isVert ? 'vert' : 'horz';
        var name = "L" + (idx / 2);
        var ev1 = new LineEvent(name, type, p1, p2);
    
        eventQ.InsertEvent(ev1);
        var ev2 = new LineEvent(name, 'last', p1, p2, ev1);
        eventQ.InsertEvent(ev2);
    }

    // create balanced binary search tree and add first segment
    var tree = new EventTree('tree', new RBTree(SortOnY));
    var rectified = [];
    var rectifier = new Rectifier(tree);

    while ((ev = eventQ.Min()) != null)
    {
        log("processing event " + ev.EventToString());
        eventQ.PrintTree();
        tree.PrintTree();
        eventQ.RemoveEvent(ev);
        if (ev.type == 'last')
        {
            tree.RemoveEvent(ev.link);
            rectified.push([ev.link.point1[0], ev.link.Y]);
            rectified.push([ev.link.point2[0], ev.link.Y]);
        }
        else
        {
            sweepX = GetX(ev);
            rectifier.EventRectify(ev, intersections); 
        }
    }
    return rectified;
}