
var epsilon = 1e-13;

class CrossEvent extends LineEvent
{
    constructor(isect, ev1, ev2)
    {
        super(ev1.name + "x" + ev2.name, 'cross', isect, isect);
        this.event1 = ev1;
        this.event2 = ev2;
        this.slope = 0;
    }
}

class SegmentIntersector
{
    constructor() { }

    Determinant(p1, p2, p3)
    {
        var det = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p3[0] - p1[0]) * (p2[1] - p1[2]);
        return det;
    }

    // Find the intersection of two line segments
    // Returns intersection point or none if segments don't intersect
    LineSegmentIntersection(p1, p2, p3, p4)
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

    EventIntersection(e1, e2)
    {
        result = this.LineSegmentIntersection(e1.point1, e1.point2, e2.point1, e2.point2);
        if (result != null)
        {
            log("INTERSECTION " + e1.name + " and " + e2.name);
        }
        return result;
    }

    CheckIntersections(tree, eventQ, ev)
    {  
        var lower = tree.FindLowerBound(ev);
        var upper = tree.FindUpperBound(ev);
        var isect;

        // check for intersection with current event and its predecessor
        if (lower != null)
        {
            isect = this.EventIntersection(lower, ev);
            if ((isect != null) && (isect[0] > sweepX))
            {
                eventQ.InsertEvent(new CrossEvent(isect, lower, ev));
            }
        }
        // check for intersection with current event and its successor
        if ((upper != null) && (lower != upper))
        {
            isect = EventIntersection(ev, upper);
            if ((isect != null) && (isect[0] > sweepX))
            {
                eventQ.InsertEvent(new CrossEvent(isect, ev, upper));
            }    
        }   
    }
}

function SortEventOnY(e1, e2)
{
    if (e1 === e2)
    {
        return 0;
    }
    var y1 = e1.YIntersection(sweepX);
    var y2 = e2.YIntersection(sweepX);
    var dy = y1 - y2;

    if (Math.abs(dy) > epsilon)
    {
        return dy;
    }
    var dslope = e1.slope - e2.slope; 
    return dslope; 
}


// Find all the intersection points of a set of line segments
//
function FindIntersectionsOfLineSegments(lineSegmentArray)
{
    // sort line segments based on X
    var eventQ = new EventTree('eventQ', new RBTree(SortEventOnXY));
    for (let idx = 0; idx < lineSegmentArray.length; idx += 2)
    {
        var p1 = lineSegmentArray[idx];
        var p2 = lineSegmentArray[idx + 1];
        var name = 'L' + (idx / 2);
        var ev1 = new LineEvent(name, 'first', p1, p2);
    
        eventQ.InsertEvent(ev1);
        var ev2 = new LineEvent(name, 'last', p1, p2, ev1);
        eventQ.InsertEvent(ev2);
    }

    // create balanced binary search tree and add first segment
    var tree = new EventTree('tree', new RBTree(SortEventOnY));
    var intersections = [];

    var intersector = new SegmentIntersector();

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
            var isect;
    
            tree.RemoveEvent(ev.link);
            if ((lower != null) && (upper != null))
            {
                isect = intersector.EventIntersection(lower, upper);
                if (isect != null)
                {
                    eventQ.InsertEvent(new CrossEvent(isect, lower, upper));
                }               
            }
        }
        else if (ev.type == 'first')
        {
            sweepX = ev.GetX();
            tree.InsertEvent(ev);
            intersector.CheckIntersections(tree, eventQ, ev); 
        }
        else
        {
            intersections.push(ev.point1);
            tree.RemoveEvent(ev.event1);
            tree.RemoveEvent(ev.event2);
            sweepX = ev.point1[0];
            tree.InsertEvent(ev.event1);
            tree.InsertEvent(ev.event2);
            intersector.CheckIntersections(tree, eventQ, ev.event1);
            intersector.CheckIntersections(tree, eventQ, ev.event2);
        }
    }
    return intersections; 
}