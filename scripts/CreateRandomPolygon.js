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

    addVertices(varr)
    {
        this.vertices = this.vertices.concat(varr);
    }

    getVertices()
    {
        return this.vertices;
    }
}

class CreatePolygon
{
    constructor(type, npoints, bounds, board)
    {
        this.polygon = new Polygon();
        this.board = board;
        if (type == 'convex')
        {
            this.createRandomConvexPolygon(npoints, bounds);
        }
        else if (type == 'simple')
        {
            this.createRandomSimplePolygon(npoints, bounds);
        }
        else
        {
            log("CreatePolygon: unknown polygon type " + type);
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

    createEllipse(npoints, bounds)
    {
        var a = (bounds[2] - bounds[0]) / 2;
        var b = (bounds[3] - bounds[1]) / 2;
        var twoPi = Math.PI * 2;
        var tinc  = twoPi / npoints;
        var t;
        var offset = [ bounds[0] + a, bounds[1] + b ];

        for (t = 0; t < twoPi; t += tinc)
        {
            var x = a * Math.cos(t)
            var y = b * Math.sin(t);
            this.polygon.addVertex([x + offset[0], y + offset[1]]);
        }
        this.polygon.vertices.pop();
    }

    createRandomSimplePolygon(npoints, bounds)
    {
        this.createEllipse(npoints, bounds);
        if (this.board != null)
        {
            this.AddPolygonToBoard(this.board);
        }
        var maxDiff = [ (bounds[2] - bounds[0]) / 2, (bounds[3] - bounds[1]) / 2];
        var i;
        var n = this.polygon.vertices.length - 1;

        for (i = 0; i <= n; ++i)
        {
            var perturb = [ Math.random() * maxDiff[0], Math.random() * maxDiff[1] ];
            var p = [ this.polygon.vertices[i][0] + perturb[0],
                      this.polygon.vertices[i][1] + perturb[1] ];
            this.MovePolyPoint(i, p);
            if (this.intersectsPolygon(i, 3, p))
            {
                log("P." + i + "[" + this.polygon.vertices[i][0].toFixed(2) + ", " +
                    this.polygon.vertices[i][1].toFixed(2) + "] -> " + p[0].toFixed(2) + ", " + p[1].toFixed(2));   
                this.MovePolyPoint(i, this.polygon.vertices[i]);
            }
            else
            {
                this.polygon.vertices[i][0] = p[0];
                this.polygon.vertices[i][1] = p[1];
            }
        }
    }

    modPoly(i)
    {
        if (i < 0)
        {
            return this.polygon.vertices.length + i;
        }
        return i;
    }

    lineSegmentIntersection(p1, p2, p3, p4)
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

    intersectsPolygon(i, nsteps, p)
    {
        var j;
        var n = this.polygon.vertices.length;
        var is1 = this.modPoly(i - 1);
        var is2 = (i + 1) % n;
        var s1 = this.polygon.vertices[is1];
        var s2 = this.polygon.vertices[is2];

        for (j = 1; j <= nsteps; ++j)
        {
            var i1 = this.modPoly(i - j - 1);
            var i2 = this.modPoly(i - j);
            var i3 = (i + j) % n;
            var i4 = (i + j + 1) % n;
            var p1 = this.polygon.vertices[i1];
            var p2 = this.polygon.vertices[i2];
            var p3 = this.polygon.vertices[i3];
            var p4 = this.polygon.vertices[i4];
            var result = ComputeLineIntersection(p3, p4, s1, p);
            if ((result != null) && (result.intersection != null))
            {
                log("P." + is1 + "-P." + i + " intersects P." + i3 + "-P." + i4);
                return true;
            }
            if (is2 != i3)
            {
                result = ComputeLineIntersection(p3, p4, p, s2);
                if ((result != null) && (result.intersection != null))
                {
                    log("P." + i + "-P." + is2 + " intersects P." + i3 + "-P." + i4);
                    return true;
                }               
            }
            result = ComputeLineIntersection(p1, p2, p, s2);
            if ((result != null) && (result.intersection != null))
            {
                log("P." + i1 + "-P." + i2 + " intersects P." + i + "-P." + is2);
                return true;
            }
            if (i2 != is1)
            {
                result = ComputeLineIntersection(p1, p2, s1, p);
                if ((result != null) && (result.intersection != null))
                {
                    log("P." + i1 + "-P." + i2 + " intersects P." + is1 + "-P." + i);
                    return true;
                }                    
            }
        }
        return false;
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
            points.push(board.create('point', [v[0], v[1]], { name: 'P' + i, size: 1}));
        }
        this.boardPoly = board.create('polygon', points, { borders: { strokeColor: 'black' }, hasInnerPoint: true });
        return this.boardPoly;
    }

    MovePolyPoint(i, newPt)
    {
        if (this.boardPoly == null)
        {
            return null;
        }
        this.boardPoly.vertices[i].moveTo(newPt);
    }
}