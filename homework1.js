function Part1C_polygon_intersection()
{
    var board = JXG.JSXGraph.initBoard('box', { boundingbox: [0, 0, 50, 50], axis: true });
    var bounds = [2, 2, 20, 20]
    var poly = CreateRandomConvexPolygon(board, 15, bounds);
    var endpoints = CreateRandomPoints('L', board, 2, bounds);
    var line = board.create('line', endpoints);
    log("slope = " + line.getSlope() + " yinter = " + line.getRise());
    var result = LinePolyIntersect(poly.vertices, line);
    if (Array.isArray(result))
    {
        board.create('point', result, {name: 'Intersection', size: 5, fillColor: "#ff0000" });
    }
}

function Part2B_pareto_optimal()
{
    var board = JXG.JSXGraph.initBoard('box', { boundingbox: [0, 50, 50, 0], axis: true });
    var bounds = [2, 2, 48, 48]
    var points = CreateRandomPoints('P', board, 10, bounds);
    var result = FindParetoOptimal(points);
    var str = "";
    if (Array.isArray(result))
    {
        for (let i = 0; i < result.length; ++i)
        {
            var p = result[i];
            p.setAttribute({fillColor: "#0000ff"});
            str += p.name + " ";
        }
        log(str);
        board.fullUpdate();
    }
}

let lsegs = null;

function line_segment_intersection()
{
    var bounds = [2, 2, 48, 48]

    if (lsegs == null)
    {
        lsegs = CreateRandomLineSegments(10, bounds);
    }
    var board = JXG.JSXGraph.initBoard('box', { boundingbox: [0, 50, 50, 0], axis: true });
    var lines = AddLineSegmentsToBoard(board, lsegs, 'L');
    var result = FindIntersectionsOfLineSegments(lines);
    var str = "";
    if (Array.isArray(result))
    {
        for (let i = 0; i < result.length; ++i)
        {
            var p = result[i];
            var point = board.create('point', p, { name: "I" + i, size: 4, fillColor: "#0000ff"});
        }
        board.fullUpdate();
    }
}

