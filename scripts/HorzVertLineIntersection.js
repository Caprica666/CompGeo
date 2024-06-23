let sweepX = Number.MIN_SAFE_INTEGER;
var epsilon = 1e-13;

// Intersection of vertical lines
function VertIntersect(ev1, ev2, intersections)
{
    var intersections = [];
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
        intersections.push(p1);
        PrintIntersection(ev1, ev2, p1);
    }
    else
    {
        intersections.push(p3);
        PrintIntersection(ev1, ev2, p3);
    }
    if (p2[1] <= p4[1])
    {
        intersections.push(p2);
        PrintIntersection(ev1, ev2, p2);
    }
    else
    {
        intersections.push(p4);
        PrintIntersection(ev1, ev2, p4);
    }
}

// Intersection of horizontal lines
function HorzIntersect(ev1, ev2, intersections)
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
        intersections.push(p1);
        PrintIntersection(ev1, ev2, p1);
    }
    else
    {
        intersections.push(p3);
        PrintIntersection(ev1, ev2, p3);
    }
    if ((p2[1] <= p4[1]))
    {
        intersections.push(p2);
        PrintIntersection(ev1, ev2, p2);
    }
    else
    {
        intersections.push(p4);
        PrintIntersection(ev1, ev2, p4);
    }
    return intersections;
}

function GetX(ev)
{
    if (ev.type == 'last')
    {
        return ev.point2[0];
    }
    return ev.point1[0];
}

function GetY(ev)
{
    if (ev.type == 'last')
    {
        return ev.point2[1];
    }
    return ev.point1[1];
}

// Sort events on X and then Y
function SortOnXY(e1, e2)
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
    return e1.name.localeCompare(e2.name);
}

// Sort on Y and X
function SortOnYX(e1, e2)
{
    if (e1.name == e2.name)
    {
        return 0;
    }
    var y1 = GetY(e1);
    var y2 = GetY(e2);
    
    var dy = y1 - y2;
    if (Math.abs(dy) > epsilon)
    {
        return dy;
    }
    var x1 = GetX(e1);
    var x2 = GetX(e2);
    var dx = x1 - x2;
    if (Math.abs(dx) > epsilon)
    {
        return dx;
    }
    log("Error - endpoints " + e1.name + " and " + e2.name + " co-indicent!");
    return e1.name.localeCompare(e2.name);
}

function CheckVertical(ev1, ev2, intersections)
{
    if (ev2 != null)
    {
        if (ev2.type == 'vert')
        {
            VertIntersect(ev1, ev2, intersections);
        }
        // ev vertical, ev2 horizontal
        else if ((ev1.point1[1] <= ev2.point1[1]) && (ev2.point1[1] <= ev1.point2[1]) &&
                 (ev2.point1[0] <= ev1.point1[0]) && (ev1.point1[0] <= ev2.point2[0]))
        {
            var p = [ ev1.point1[0], ev2.point1[1] ];
            intersections.push(p);
            PrintIntersection(ev1, ev2, p);
        }           
    }
}

function CheckHorizontal(ev1, ev2, intersections)
{
    if (ev2 != null)
    {
        if (ev2.type == 'horz')
        {
            HorzIntersect(ev1, ev2, intersections);
        }
        // ev horizontal, ev2 vertical
        else if ((ev1.point1[0] <= ev2.point1[0]) && (ev2.point1[0] <= ev1.point2[0]) &&
                 (ev2.point1[1] <= ev1.point1[1]) && (ev1.point1[1] <= ev2.point2[1]))
        {
            var p = [ ev2.point1[0], ev1.point1[1] ];
            intersections.push(p);
            PrintIntersection(ev1, ev2, p);
        }           
    }
}

function PrintIntersection(e1, e2, p)
{
    var str = "INTERSECTION: " + e1.name + " x " + e2.name + " at";
    str += " [" + p[0] + "," + p[1] + "]";
    log(str);
}


// Describes an intersection event
// type: type of event, 'horz' or  'vert'
// point1: endpoint with smallest X or Y
// point2: endpoint with smallest X or Y
function LineEvent(type, name, p1, p2, link = null)
{
    this.type = type;
    this.name = name + '-' + type;
    this.type = type;
    this.point1 = p1;
    this.point2 = p2;
    this.link = link;
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

function FindLowerBound(tree, ev)
{
    var iter = tree.lowerBound(ev);
    var data = iter.prev();
    if (data != null)
    {
        log("lower bound " + EventToString(data));
    }
    return data;
}

function FindUpperBound(tree, ev)
{
    var iter = tree.upperBound(ev);
    data = iter.data();
    if (data != null)
    {
        log("upper bound " + EventToString(data));
    }
    return data;
}

function CheckIntersections(ev1, ev2, intersections)
{
    if ((ev1 != null) && (ev2 != null))
    {
        if (ev1.type == 'vert')
        {
            result = CheckVertical(ev1, ev2, intersections);
        }
        else
        {
            result = CheckHorizontal(ev1, ev2, intersections);
        }
        if (result != null)
        {
            intersections = intersections.concat(result);
            PrintIntersections(dv1, ev2, result);
        }
    }
}

function EventIntersections(tree, ev, intersections)
{
    var lower = FindLowerBound(tree, ev);
    var upper = FindUpperBound(tree, ev);

    if (ev.type == 'vert')
    {
        while ((lower != null) && (lower.point1[1] <= ev.point1[1]))
        {
             CheckIntersections(ev, lower, intersections);
             lower = FindLowerBound(tree, lower);
        }
        while ((upper != null) && (upper.point1[1] <= ev.point2[1]))
        {
            CheckIntersections(ev, upper, intersections);
            upper = FindUpperBound(tree, upper);
        }
    }
    else
    {
        CheckIntersections(ev, lower, intersections);
        CheckIntersections(ev, upper, intersections);    
    }

}

function RemoveEvent(tree, ev, label)
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


// Find all the intersection points of a set of line segments
//
function FindIntersectionsOfLineSegments(lineSegmentArray)
{
    // sort line segments based on X and then Y
    var eventQ = new RBTree(SortOnXY);
    for (let idx = 0; idx < lineSegmentArray.length; idx += 2)
    {
        var p1 = lineSegmentArray[idx];
        var p2 = lineSegmentArray[idx + 1];
        var isVert = Math.abs(p1[0] - p2[0]) < epsilon;
        var type = isVert ? 'vert' : 'horz';
        var name = "L" + (idx / 2);
        var ev1 = new LineEvent(type, name, p1, p2);
    
        eventQ.insert(ev1);
        var ev2 = new LineEvent('last', name, p1, p2, ev1);
        eventQ.insert(ev2);
    }

    // create balanced binary search tree and add first segment
    var tree = new RBTree(SortOnYX);
    var intersections = [];

    while ((ev = eventQ.min()) != null)
    {
        log("processing event " + EventToString(ev));
        PrintTree(eventQ, "EventQ");
        PrintTree(tree, "Tree");
        RemoveEvent(eventQ, ev, 'eventQ');
        if (ev.type == 'last')
        {
            var lower = FindLowerBound(tree, ev.link);
            var upper = FindUpperBound(tree, ev.link);
    
            RemoveEvent(tree, ev.link, 'eventQ');
            CheckIntersections(lower, upper, intersections);
        }
        else
        {
            sweepX = GetX(ev);
            InsertEvent(tree, ev, 'tree');
            EventIntersections(tree, ev, intersections); 
        }
    }
    return intersections; 
}