
var epsilon = 1e-13;

class HorzVertIntersector
{
    constructor()
    {
        this.intersections = [];
    }

    // Intersection of vertical lines
    VertIntersect(ev1, ev2)
    {
        var p1 = ev1.point1;
        var p2 = ev1.point2;
        var p3 = ev2.point1;
        var p4 = ev2.point2;

        if (Math.abs(p1[0] - p3[0]) > epsilon)
        {
            return;
        }
        if ((p2[1] < p3[1]) || (p4[1] < p1[1]))
        {
            return;
        }
        if (p1[1] >= p3[1])
        {
            this.intersections.push(p1);
            this.PrintIntersection(ev1, ev2, p1);
        }
        else
        {
            this.intersections.push(p3);
            this.PrintIntersection(ev1, ev2, p3);
        }
        if (p2[1] <= p4[1])
        {
            this.intersections.push(p2);
            this.PrintIntersection(ev1, ev2, p2);
        }
        else
        {
            this.intersections.push(p4);
            this.PrintIntersection(ev1, ev2, p4);
        }
    }

    // Intersection of horizontal lines
    HorzIntersect(ev1, ev2)
    {
        var p1 = ev1.point1;
        var p2 = ev1.point2;
        var p3 = ev2.point1;
        var p4 = ev2.point2;

        if (Math.abs(p1[1] - p3[1]) > epsilon)
        {
            return;
        }
        if ((p2[0] < p3[0]) || (p4[0] < p1[0]))
        {
            return;
        }
        if ((p1[0] >= p3[0]))
        {
            this.intersections.push(p1);
            this.PrintIntersection(ev1, ev2, p1);
        }
        else
        {
            this.intersections.push(p3);
            this.PrintIntersection(ev1, ev2, p3);
        }
        if ((p2[1] <= p4[1]))
        {
            this.intersections.push(p2);
            this.PrintIntersection(ev1, ev2, p2);
        }
        else
        {
            this.intersections.push(p4);
            this.PrintIntersection(ev1, ev2, p4);
        }
    }


    CheckVertical(ev1, ev2)
    {
        if (ev2 != null)
        {
            if (ev2.type == 'vert')
            {
                this.VertIntersect(ev1, ev2);
            }
            // ev vertical, ev2 horizontal
            else if ((ev1.point1[1] <= ev2.point1[1]) && (ev2.point1[1] <= ev1.point2[1]) &&
                    (ev2.point1[0] <= ev1.point1[0]) && (ev1.point1[0] <= ev2.point2[0]))
            {
                var p = [ ev1.point1[0], ev2.point1[1] ];
                this.intersections.push(p);
                this.PrintIntersection(ev1, ev2, p);
            }           
        }
    }

    CheckHorizontal(ev1, ev2)
    {
        if (ev2 != null)
        {
            if (ev2.type == 'horz')
            {
                this.HorzIntersect(ev1, ev2);
            }
            // ev horizontal, ev2 vertical
            else if ((ev1.point1[0] <= ev2.point1[0]) && (ev2.point1[0] <= ev1.point2[0]) &&
                    (ev2.point1[1] <= ev1.point1[1]) && (ev1.point1[1] <= ev2.point2[1]))
            {
                var p = [ ev2.point1[0], ev1.point1[1] ];
                this.intersections.push(p);
                this.PrintIntersection(ev1, ev2, p);
            }           
        }
    }

    PrintIntersection(e1, e2, p)
    {
        var str = "INTERSECTION: " + e1.name + " x " + e2.name + " at";
        str += " [" + p[0] + "," + p[1] + "]";
        log(str);
    }

    CheckIntersections(ev1, ev2)
    {
        if ((ev1 != null) && (ev2 != null))
        {
            if (ev1.type == 'vert')
            {
                this.CheckVertical(ev1, ev2);
            }
            else
            {
                this.CheckHorizontal(ev1, ev2);
            }
        }
    }

    EventIntersections(tree, ev)
    {
        var lower = tree.FindLowerBound(ev);
        var upper = tree.FindUpperBound(ev);

        if (ev.type == 'vert')
        {
            while ((lower != null) && (lower.point1[1] <= ev.point1[1]))
            {
                this.CheckIntersections(ev, lower);
                lower = tree.FindLowerBound(lower);
            }
            while ((upper != null) && (upper.point1[1] <= ev.point2[1]))
            {
                this.CheckIntersections(ev, upper);
                upper = tree.FindUpperBound(upper);
            }
        }
        else
        {
            this.CheckIntersections(ev, lower);
            this.CheckIntersections(ev, upper);    
        }

    }
}

// Sort on Y and X
function SortOnYX(e1, e2)
{
    if (e1.name == e2.name)
    {
        return 0;
    }
    var y1 = e1.GetY();
    var y2 = e2.GetY();
    
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

// Find all the intersection points of a set of line segments
//
function FindIntersectionsOfLineSegments(lineSegmentArray)
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
    var tree = new EventTree('tree', new RBTree(SortOnYX));
    var intersector = new HorzVertIntersector();

    while ((ev = eventQ.Min()) != null)
    {
        log("processing event " + ev.EventToString());
        eventQ.PrintTree();
        tree.PrintTree();
        eventQ.RemoveEvent(ev);
        if (ev.type == 'last')
        {
            var lower = tree.FindLowerBound(ev.link);
            var upper = tree.FindUpperBound(ev.link);
    
            tree.RemoveEvent(ev.link);
            intersector.CheckIntersections(lower, upper);
        }
        else
        {
            tree.InsertEvent(ev);
            intersector.EventIntersections(tree, ev); 
        }
    }
    return intersector.intersections; 
}