// Create a set of random line segments
// nsegs: number of segments wanted
// bounds: bounding box of segments
// returns: array of nsegs * 2 points [x, y], 2 points per line segment
function CreateRandomLineSegments(nsegs, bounds)
{
    var width = (bounds[2] - bounds[0]);
    var height = (bounds[3] - bounds[1]);
    var lsegs = [];
    for (let i = 0; i < nsegs; i++)
    {
        var x1 = Math.floor(bounds[0] + Math.random() * width);
        var y1 = Math.floor(bounds[1] + Math.random() * height);
        var x2 = Math.floor(bounds[0] + Math.random() * width);
        var y2 = Math.floor(bounds[1] + Math.random() * height);
        if ((x1 == x2) && (y1 == y2))
        {
            i -= 2;
            continue;
        } 
        if ((x1 < x2) || ((x1 == x2) && (y1 <= y2)))
        {
            lsegs.push([ x1, y1 ]);
            lsegs.push([ x2, y2 ]);
        }  
        else
        {
            lsegs.push([ x2, y2 ]);
            lsegs.push([ x1, y1 ]);
        }
    }
    return lsegs;
}

// Add line segments to board
// nameprefix: prefix for name of each line
// board: JSX board to contain points
// lsegs: array of points [x, y], 2 points per line segment
function AddLineSegmentsToBoard(board, lsegs, nameprefix)
{
    lines = [];
    for (let i = 0; i < lsegs.length; i += 2)
    {
        var j = Math.floor(i / 2);
        var pt = lsegs[i];
        var p1 = board.create('point', [pt[0], pt[1]], { name: "P" + j + "-1", size: 4});
        pt = lsegs[i + 1];
        var p2 = board.create('point',  [pt[0], pt[1]], { name: "P" + j + "-2", size: 4});
        lines.push(board.create('line', [ p1, p2 ], { name: nameprefix + j, straightFirst:false, straightLast:false }));
    }
    return lines;
}