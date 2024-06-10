// Create a set of random points
// nameprefix: prefix for name of each point
// board: JSX board to contain points
// npoints: number of points wanted
// bounds: bounding box of points
function CreateRandomPoints(nameprefix, board, npoints, bounds)
{
    var width = (bounds[2] - bounds[0]);
    var height = (bounds[3] - bounds[1]);
    var x;
    var y;
    var points = [];
    for (let i = 0; i < npoints; i++)
    {
        x = Math.floor(bounds[0] + Math.random() * width);
        y = Math.floor(bounds[1] + Math.random() * height);
        points[i] = board.create('point', [x, y], { name: nameprefix + i, size: 4})
    }
    return points;
}