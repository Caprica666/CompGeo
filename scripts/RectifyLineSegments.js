
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

function SortOnYIntercept(e1, e2)
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

    EventRectify1(ev)
    {
        var lower = this.tree.FindLowerBound(ev);
        var upper = this.tree.FindUpperBound(ev);

        if (upper != null)
        {
            // check if upper bound was above this line before rectification
            var yint = upper.YIntersection(ev.point1[0]);
            var afterDy = upper.Y - ev.Y;
            var beforeDy = yint - ev.point1[1];

            if (afterDy * beforeDy <= 0)
            {
                var upperY = upper.Y;
                ev.Y = upper.Y + 1;
                upper = this.tree.FindUpperBound(upper);
                if (upper != null)
                {
                    ev.Y = (upper.Y + upperY) / 2;
                }
                log("Move " + ev.name + " up to " + ev.Y);
                this.tree.InsertEvent(ev);
                return;
            }
        }
        if (lower != null)
        {
            // check if lower bound was below this line before rectification
            yint = lower.YIntersection(ev.point1[0]);
            beforeDy = ev.point1[1] - yint;
            afterDy = ev.Y - lower.Y;
                        
            if (afterDy * beforeDy <= 0)
            {
                var lowerY = lower.Y;
                ev.Y = lower.Y - 1;
                lower = this.tree.FindLowerBound(lower);
                if (lower != null)
                {
                    ev.Y = (lowerY + lower.Y) / 2;
                }
                log("Move " + ev.name + " down to " + ev.Y);
                this.tree.InsertEvent(ev);
                return;
            }
        }
        this.tree.InsertEvent(ev);
    }
    
    EventRectify(ev)
    {
        var lower = this.tree.FindLowerBound(ev);
        var upper = this.tree.FindUpperBound(ev);

        if (upper != null)
        {
            if (lower != null)
            {
                ev.Y = (upper.Y + lower.Y) / 2;
            }
            else
            {
                if (ev.Y > upper.Y)
                {
                    ev.Y = upper.Y - 1;
                }
            }
        }
        else if (lower != null)
        {
            if (ev.Y < lower.Y)
            {
                ev.Y = lower.Y + 1;
            }
        }
        this.tree.InsertEvent(ev);
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
        var y = (p1[1] + p2[1]) / 2;
        var ev1 = new LineEvent(name, 'first', p1, p2);
        ev1.Y = y;
    
        eventQ.InsertEvent(ev1);
        var ev2 = new LineEvent(name, 'last', p1, p2, ev1);
        ev2.Y = y;
        eventQ.InsertEvent(ev2);
    }

    // create balanced binary search tree and add first segment
    var tree = new EventTree('tree', new RBTree(SortOnYIntercept));
    var rectified = [];
    var rectifier = new Rectifier(tree);

    while ((ev = eventQ.Min()) != null)
    {
        log("processing event " + ev.EventToString());
        eventQ.PrintTree();
        tree.PrintTree();
        eventQ.RemoveEvent(ev);
        log("processing " + ev.EventToString());
        if (ev.type == 'last')
        {
            tree.RemoveEvent(ev.link);
            rectified.push([ev.link.point1[0], ev.link.Y]);
            rectified.push([ev.link.point2[0], ev.link.Y]);
        }
        else
        {
            sweepX = ev.GetX();
            rectifier.EventRectify(ev); 
        }
    }
    return rectified;
}