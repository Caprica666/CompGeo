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
        var hlsegs = CreateRandomHorizontalSegments(5 + Math.floor(Math.random() * 20), bounds);
        var vlsegs = CreateRandomVerticalSegments(5 + Math.floor(Math.random() * 20), bounds);
        lsegs = hlsegs.concat(vlsegs);
    }
    var board = JXG.JSXGraph.initBoard('box', { boundingbox: [0, 50, 50, 0], axis: true });
    AddLineSegmentsToBoard(board, lsegs, 'L');
    var result = FindIntersectionsOfLineSegments(lsegs);

    if (Array.isArray(result))
    {
        for (let i = 0; i < result.length; ++i)
        {
            var p = result[i];
            board.create('point', p, { name: "I" + i, size: 4, fillColor: "#0000ff"});
        }
        board.fullUpdate();
    }
}

let disjointSegments = null;
function line_segment_rectify()
{
    var bounds = [2, 2, 48, 48];

    if (disjointSegments == null)
    {
        disjointSegments = CreateDisjointLineSegments(10, bounds);
    }
    var board = JXG.JSXGraph.initBoard('box', { boundingbox: [0, 50, 50, 0], axis: true });
    AddLineSegmentsToBoard(board, disjointSegments, 'L');
    var result = RectifyLineSegments(lsedisjointSegmentsgs);

    if (Array.isArray(result))
    {
        AddLineSegmentsToBoard(board, result, 'R');
        board.fullUpdate();
    }
}

