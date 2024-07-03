class Polygon
{
    constructor()
    {
        this.vertices = [];
    }

    addVertex(v)
    {
        this.vertices.push(v);
    }

    getVertices()
    {
        return this.vertices;
    }
}

class CreatePolygon
{
    constructor(type, npoints, bounds)
    {
        this.polygon = new Polygon();
        if (type == 'convex')
        {
            this.createRandomConvexPolygon(npoints, bounds);
        }
    }

    getPolygon()
    {
        return this.polygon;
    }

    // shuffle elements of array
    shuffle(arr)
    {
        let shuffled = arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value) ;
        return shuffled;  
    }

    convert_to_vectors(arr, minc, maxc)
    {
        var vecs = []
        var lastmin = minc;
        var lastmax = minc;
        for (let i = 1; i < arr.length - 1; ++i)
        {
            var c = arr[i];
            if (Math.random() < 0.5)
            {
                vecs.push(c - lastmin);
                lastmin = c;
            }
            else
            {
                vecs.push(lastmax - c);
                lastmax = c;
            }
        }
        vecs.push(maxc - lastmin);
        vecs.push(lastmax - maxc);
        return vecs;
    }

    // Create a random convex polygon
    // npoints: number of points in polygon
    // bounds: bounding box of polygon
    createRandomConvexPolygon(npoints, bounds)
    {
        var startx = bounds[0];
        var starty = bounds[1];
        var width = (bounds[2] - bounds[0]);
        var height = (bounds[3] - bounds[1]);
        var x;
        var y;
        // Generate two lists of random X and Y coordinates
        var xpool = [];
        var ypool = [];
        for (let i = 0; i < npoints; i++)
        {
            xpool[i] = Math.floor(startx + Math.random() * width)
            ypool[i] = Math.floor(starty + Math.random() * height)
        }

        // Sort them
        xpool.sort();
        ypool.sort();

        // Isolate the extreme points
        var minx = xpool[0];
        var maxx = xpool[npoints - 1];
        var miny = ypool[0];
        var maxy = ypool[npoints - 1];

        // Divide the interior points into two chains & Extract the vector components
        var xvec = this.convert_to_vectors(xpool, minx, maxx);
        var yvec = this.convert_to_vectors(ypool, miny, maxy);
    
        // Randomly pair up the X and Y components
        yvec = this.shuffle(yvec);

        // Combine the paired up components into vectors
        var vecs = []
        for (let i = 0; i < npoints; ++i)
        {
            vecs.push([xvec[i], yvec[i]]);
        }

        // Sort based on angle
        vecs.sort(function(v1, v2)
        {
            var a1 = Math.atan2(v1[1], v1[0]);
            var a2 = Math.atan2(v2[1], v2[0]);
            if (a1 < a2)
            {
                return -1;
            }
            if (a1 > a2)
            {
                return 1;
            }
            return 0;
        });

        // Lay them end to end
        var minpolyx = 0;
        var minpolyy = 0;
        var pts = [];
        x = 0;
        y = 0;
        for (let i = 0; i < npoints; ++i)
        {
            pts.push([x, y]);
            x += vecs[i][0];
            y += vecs[i][1];
            minpolyx = Math.min(minpolyx, x);
            minpolyy = Math.min(minpolyy, y);
        }
        // Move the polygon to the original min and max coordinates
        var xshift = minx - minpolyx;
        var yshift = miny - minpolyy;
        for (let i = 0; i < npoints; ++i)
        {
            var p = pts[i];
            x = p[0];
            y = p[1];
            if ((i > 0) && (pts[i - 1][0] != x) && (pts[i - 1][1] != y))
            {
                this.polygon.addVertex([x + xshift, y + yshift]);
            }
        }
        return this.polygon.vertices;
    }

    AddPolygonToBoard(board)
    {
        var verts = this.polygon.getVertices();
        var points = [];
        for (let i = 0; i < verts.length; ++i)
        {
            var v = verts[i];
            points.push(board.create('point', [v[0], v[1]], { name: 'P' + i, size: 4}));
        }
        var poly = board.create('polygon', points, { borders: { strokeColor: 'black' }, hasInnerPoint: true });
        return poly;
    }
}