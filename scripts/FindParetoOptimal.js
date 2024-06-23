function removeAt(arr, i)
{
    var first = [];
    var second = [];

    if (i > 0)
    {
        first = arr.slice(0, i);
    }
    if (i + 1 < arr.length)
    {
        second = arr.slice(i + 1);
    }
    return first.concat(second);
}

function insertAfter(arr, i, newelem)
{
    var first = [];
    var second = [];

    if (i >= 0)
    {
        first = arr.slice(0, i + 1);
    }
    first.push(newelem);
    if (i + 1 < arr.length)
    {
        second = arr.slice(i + 1);
        return first.concat(second);
    }
    return first;
}

function print_points(pts)
{
    var str = "";
    for (let i = 0; i < pts.length; ++i)
    {
        p = pts[i];
        str += p.name + "(" + p.X() + ", " + p.Y() + ") ";
    }
    log(str);
}

function FindParetoOptimal(inpoints)
{
    var points = []
    points.push(inpoints[0]);
    for (let i = 1; i < inpoints.length; ++i)
    {
        var p = inpoints[i];
        var j = points.length - 1;
    
        while (j >= 0)
        {
            var ptx = points[j].X();
            var pty = points[j].Y();
            var px = p.X();
            var py = p.Y();
            // new point is to the right of the PO point
            if (ptx <= px)
            {
                // new point is above and to the right of the PO point
                // remove the PO point
                if (pty <= py)
                {
                    // remove PO point
                    points = removeAt(points, j);
                    print_points(points);
                }
                // new point is below and to the right of the PO point
                // put it after the PO point
                else
                {
                    // new point has same x as PO point but is below
                    // so skip it
                    if (ptx == px)
                    {
                         break;                       
                    }
                    // new point is below and to the right of the PO point
                    // put it after the PO point
                    points = insertAfter(points, j, p);
                    print_points(points);
                    break;
                }
            }
            // new point is to the left and below the PO point
            // skip the new point
            else if (py <= pty)
            {
                break;
            }
            // new point is to the right and above the PO point
            // if at the start, insert in front of ALL PO points
            if (j == 0)
            {
                points.unshift(p);
                break;
            }
            --j;
        }
    }
    return points;
}