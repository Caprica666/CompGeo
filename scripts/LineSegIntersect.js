let sweepX = Number.MIN_SAFE_INTEGER;
var epsilon = 1e-13;

function Determinant(p1, p2, p3)
{
    var det = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p3[0] - p1[0]) * (p2[1] - p1[2]);
    return det;
}

function YIntersection(line, x)
{
    var y = line.Slope() * x + line.getRise();
    return y;
}

// Find the intersection of two line segments
// Returns intersection point or none if segments don't intersect
function LineSegmentIntersection(p1, p2, p3, p4)
{ 
    // line 1 equation: a1 * x + b1 * y = c1
    var a1 = p2.Y() - p1.Y();
    var b1 = p1.X() - p2.X();
    var c1 = a1 * p1.X() + b1 * p1.Y();

    // line 2 equation: a2 * x + b2 * y = c2
    var a2 = p4.Y() - p3.Y();
    var b2 = p3.X() - p4.X();
    var c2 = a2 * p3.X() + b2 * p3.Y();

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
    if ((p1.X() == p2.X())) // line is vertical, check Y
    {
        if (p1.Y() < p2.Y())
        {
            if ((y < p1.Y()) || (y > p2.Y()))
            {
                return null;
            }            
        }
        else
        {
            if ((y < p2.Y()) || (y > p1.Y()))
            {
                return null;
            }             
        }               
    }
    else
    {
        if (p1.X() < p2.X())
        {
            if ((x < p1.X()) || (x > p2.X()))
            {
                return null;
            }            
        }
        else
        {
            if ((x < p2.X()) || (x > p1.X()))
            {
                return null;
            }             
        }          
    }
    // check if x, y is outside second segment
    if ((p3.X() == p4.X())) // line is vertical, check Y
    {
        if (p3.Y() < p4.Y())
        {
            if ((y < p4.Y()) || (y > p4.Y()))
            {
                return null;
            }            
        }
        else
        {
            if ((y < p4.Y()) || (y > p3.Y()))
            {
                return null;
            }             
        } 
    }
    else
    {
        if (p3.X() < p4.X())
        {
            if ((x < p3.X()) || (x > p4.X()))
            {
                return null;
            }            
        }
        else
        {
            if ((x < p4.X()) || (x > p3.X()))
            {
                return null;
            }             
        }    
    }
    return [x, y];
}

function GetX(ev)
{
    if (ev.type == 'first')
    {
        return ev.line.point1.X();
    }
    if (ev.type == 'last')
    {
        return ev.line.point2.X();
    }
    return ev.intersection[0];
}

function GetY(ev)
{
    if (ev.type == 'first')
    {
        return ev.line.point1.Y();
    }
    if (ev.type == 'last')
    {
        return ev.line.point2.Y();
    }
    return ev.intersection[1];
}

function SortEventOnX(e1, e2)
{
    if (e1.name == e2.name)
    {
        return 0;
    }
    var x1 = GetX(e1);
    var x2 = GetX(e2);
    
    var dx = x1 - x2;
    if (Math.abs(dx) > epsilon)
    {
        return dx;
    }
    var y1 = GetY(e1);
    var y2 = GetY(e2);
    var dy = y1 - y2;
    if (Math.abs(dy) > epsilon)
    {
        return dy;
    }
    log("Error - endpoints " + e1.name + " and " + e2.name + " co-indicent!");
    return 0;
}

function SortEventOnY(e1, e2)
{
    if (e1 === e2)
    {
        return 0;
    }
    var x = e1.line.point1.X();

    if (e2.line.point1.X() > x)
    {
        x = e2.line.point1.X();
    }
    x = sweepX;
    var y1 = YIntersection(e1.line, x);
    var y2 = YIntersection(e2.line, x);
    var dy = y1 - y2;

    if (Math.abs(dy) > epsilon)
    {
        return dy;
    }
    var slope2 = e2.line.Slope();
    var slope1 = e1.line.Slope();
    if (e1.line.isVertical())
    {
        slope1 = Number.MAX_SAFE_INTEGER;
    }
    if (e2.line.isVertical())
    {
        slope2 = Number.MAX_SAFE_INTEGER;
    }
    var dslope = slope1 - slope2; 
    return dslope; 
}

function SortEventOnDet(e1, e2)
{
    if (e1 === e2)
    {
        return 0;
    }
    var det = Determinant(e2.intersection, [ e2.line.point2[0], e2.line.point2[1] ], e1.intersection);

    if (det != 0)
    {
        return det;
    }
    var slope2 = e2.line.Slope();
    var slope1 = e1.line.Slope();
    if (e1.line.isVertical())
    {
        slope1 = Number.MAX_SAFE_INTEGER;
    }
    if (e2.line.isVertical())
    {
        slope2 = Number.MAX_SAFE_INTEGER;
    }
    var dslope = slope1 - slope2; 
    return dslope; 
}

function EventIntersection(e1, e2)
{
    result = LineSegmentIntersection(e1.line.point1, e1.line.point2, e2.line.point1, e2.line.point2);
    if (result != null)
    {
        log("INTERSECTION " + e1.line.name + " and " + e2.line.name);
    }
    return result;
}

// Describes an intersection event
// type: type of event, 'first', 'last' or 'cross'
// line: JSX line being intersected

function LineEvent(type, line, link = null)
{
    this.type = type;
    this.name = line.name + '-' + type;
    this.type = type;
    this.line = line;
    this.link = link;
}

function CrossEvent(event1, event2, isect)
{
    this.name = event1.line.name + 'x' + event2.line.name;
    this.type = 'cross';
    this.event1 = event1;
    this.event2 = event2;
    this.intersection = isect;
}

function EventToString(ev)
{
    var x = GetX(ev);
    var y = GetY(ev);

    return ev.name + "[" + x + ", " + y + "] ";
}

function PrintTree(tree, label)
{
    var iter = tree.iterator();
    var str = label + ": ";
    var i = 0;
    var ev;

    while ((ev = iter.next()) !== null)
    {
        str += EventToString(ev);
        if ((++i % 6) == 0)
        {
            log(str);
            str = "";
        }
    }
    log(str);
}

function findLowerBound(tree, ev)
{
    var iter = tree.lowerBound(ev);
    var data = iter.prev();
    if (data != null)
    {
        log("lower bound " + EventToString(data));
    }
    return data;
}

function findUpperBound(tree, ev)
{
    var iter = tree.upperBound(ev);
    data = iter.data();
    if (data != null)
    {
        log("upper bound " + EventToString(data));
    }
    return data;
}

function removeEvent(tree, ev, label)
{
    log(label + ": removing event " + EventToString(ev));
    var removed = tree.remove(ev);
    if (!removed)
    {
        log("Could not remove " + ev.name);
    }
}

function InsertEvent(tree, ev, label)
{  
    log(label + ": inserting event " + EventToString(ev));
    tree.insert(ev);  
}

function CheckIntersections(tree, eventQ, ev)
{  
    var lower = findLowerBound(tree, ev);
    var upper = findUpperBound(tree, ev);
    var isect;

    // check for intersection with current event and its predecessor
    if (lower != null)
    {
        isect = EventIntersection(lower, ev);
        if ((isect != null) && (isect[0] > sweepX))
        {
            eventQ.insert(new CrossEvent(lower, ev, isect))
        }
    }
    // check for intersection with current event and its successor
    if ((upper != null) && (lower != upper))
    {
        isect = EventIntersection(ev, upper);
        if ((isect != null) && (isect[0] > sweepX))
        {
            eventQ.insert(new CrossEvent(ev, upper, isect))
        }    
    }   
}

// Find all the intersection points of a set of line segments
//
function FindIntersectionsOfLineSegments(lineSegmentArray)
{
    // sort line segments based on X
    var eventQ = new RBTree(SortEventOnX);
    for (const idx in lineSegmentArray)
    {
        var line = lineSegmentArray[idx];
        var ev1 = new LineEvent('first', line);
    
        eventQ.insert(ev1);
        var ev2 = new LineEvent('last', line, ev1);
        eventQ.insert(ev2);
    }

    // create balanced binary search tree and add first segment
    var tree = new RBTree(SortEventOnY);
    var intersections = [];

    while ((ev = eventQ.min()) != null)
    {
        log("processing event " + EventToString(ev));
        PrintTree(eventQ, "EventQ");
        PrintTree(tree, "Tree");
        removeEvent(eventQ, ev, 'eventQ');
        if (ev.type == 'last')
        {
            var lower = findLowerBound(tree, ev.link);
            var upper = findUpperBound(tree, ev.link);
            var isect;
    
            removeEvent(tree, ev.link, 'eventQ');
            if ((lower != null) && (upper != null))
            {
                isect = EventIntersection(lower, upper);
                if ((isect != null) && (isect[0] > sweepX))
                {
                    eventQ.insert(new CrossEvent(lower, upper, isect))
                }               
            }
        }
        else if (ev.type == 'first')
        {
            sweepX = GetX(ev);
            InsertEvent(tree, ev, 'tree');
            CheckIntersections(tree, eventQ, ev); 
        }
        else
        {
            intersections.push(ev.intersection);
            removeEvent(tree, ev.event1, 'tree');
            removeEvent(tree, ev.event2, 'tree');
            sweepX = ev.intersection[0];
            InsertEvent(tree, ev.event1, 'tree');
            InsertEvent(tree, ev.event2, 'tree');
            CheckIntersections(tree, eventQ, ev.event1);
            CheckIntersections(tree, eventQ, ev.event2);
            PrintTree(tree, "Tree After Cross");
        }
    }
    return intersections; 
}