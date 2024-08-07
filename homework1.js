function Part1C_polygon_intersection()
{
    var board = JXG.JSXGraph.initBoard('box1', { boundingbox: [0, 0, 50, 50], axis: true });
    var bounds = [2, 2, 20, 20]
    var polyCreator = new CreatePolygon('convex', 15, bounds);
    var verts = polyCreator.getPolygon().getVertices();
    var poly = polyCreator.AddPolygonToBoard(board);
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
    var board = JXG.JSXGraph.initBoard('box1', { boundingbox: [0, 50, 50, 0], axis: true });
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

let randomSegments = null;
let showRandomLines = 0;

function line_segment_rectify()
{
    var bounds = [5, 5, 45, 45];
    var board1 = JXG.JSXGraph.initBoard('box1', { boundingbox: [0, 50, 50, 0], axis: true });;

    if (randomSegments == null)
    {
        randomSegments = CreateRandomLineSegments(10, bounds);
    } 
    var disjointSegments = CreateDisjointLineSegments(randomSegments, board1, showRandomLines);
    AddLineSegmentsToBoard(board1, disjointSegments, 'S', color = "#FF0000");

    var board2 = JXG.JSXGraph.initBoard('box2', { boundingbox: [0, 50, 50, 0], axis: true });
    var result = RectifyLineSegments(disjointSegments);

    if (Array.isArray(result))
    {
        AddLineSegmentsToBoard(board2, result, 'R', color = "#00FF00");
    }
}

