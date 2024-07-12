class HalfEdge
{
    constructor(inputVtx, inputFace)
    {
        this.vertex = inputVtx;
        this.face = inputFace;
        this.next = null;
        this.prev = null;
        this.twin = null;
        this.outside = 1;
    }

    toString()
    {
        if (this.prev != null)
        {
            return this.prev.vertex.toString() + " -> " + this.vertex.toString();
        }
        return this.vertex.toString();
    }
}

class Vertex
{
    constructor(p)
    {
        this.point = p;
    }

    toString()
    {
        return "[" + this.point[0].toFixed(2) + ", " + this.point[1].toFixed(2) + "]";
    }
}

class Face
{
    constructor()
    {
        this.edge = null;
    }

    // Find an edge in this face given the X,Y coordinate of its vertex
    findEdgeFromPoint(inP)
    {
        var e = this.edge;
        while (e != null)
        {
            var v = e.vertex;
            var p = v.point;

            if ((p[0] == inP[0]) && (p[1] == inP[1]))
            {
                return e;
            }
            e = e.next;
            if (e == this.edge)
            {
                break;
            }
        }
        return null;        
    }

    // Find an edge in this face containing the given vertex
    findEdgeFromVertex(inV)
    {
        var e = this.edge;
        while (e != null)
        {
            var v = e.vertex;

            if (v == inV)
            {
                return e;
            }
            e = e.next;
            if (e == this.edge)
            {
                break;
            }
        }
        return null;        
    }

    // Add an edge to this face originating at the given vertex
    // No check is made to see if the edge already exists
    // returns: edge that was added
    addEdge(prevVtx, dstVtx)
    {
        // is it the first edge?
        if (this.edge == null)
        {
            this.edge = new HalfEdge(dstVtx, this);
            return;
        }
        var prevEdge = this.findEdgeFromVertex(prevVtx);

        if (prevEdge == null)
        {
            log("edge ending at " + prevVtx.toString() + " not found in this face");
            return null;
        }
        var e = new HalfEdge(dstVtx, this);  

        if (prevEdge.next != null)
        {
            e.prev = prevEdge;
            e.next = prevEdge.next;
            prevEdge.next.prev = e;
            prevEdge.next = e;
        }
        else
        {
            e.prev = prevEdge;
            prevEdge.prev = e;
            e.next = prevEdge;
            log(this.edgesToString());
            prevEdge.next = e;
        }       
        return e;
    }

    vertsToString()
    {
        var str = "";
        var e = this.edge;

        if (e == null)
        {
            return str;
        }
        str += e.prev.vertex.toString();
        while (e.next != null)
        {
            str += "->" + e.vertex.toString();
            e = e.next;
        }
        return str;
    }

    edgesToString()
    {
        var str = "";
        var first = this.edge;
        var e = first;

        if (e == null)
        {
            return str;
        }
        do
        {
            str += e.toString() + "\n";
            e = e.next;
        }
        while ((e != null) && (e != first))
        return str;
    }

    addFaceToBoard(board, color)
    {
        var edge = this.edge;
        var points = [];
        var i = 0;
        if (vtx == null)
        {
            return null;
        }
        do
        {
            var p = edge.vertex.point;
            points.push(board.create('point', [p[0], p[1]], { name: 'P' + i, size: 1 }));
            edge = edge.next;
            ++i;
        }
        while (edge != this.edge)
        var poly = board.create('polygon', points, { borders: { strokeColor: color }, hasInnerPoint: true });
        return poly;
    }
}

class PlanarMap
{
    constructor()
    {
        this.faces = [];
        this.edges = [];
        this.vertices = [];
    }

    // Find a vertex with the given X,Y coordinates in this face
    // returns: 0-based index of vertex found or -1 if not found
    findVertex(inP)
    {
        for (let i = 0; i < this.vertices.length; ++i)
        {
            var p = this.vertices[i];
            if ((p[0] == inP[0]) && (p[1] == inP[1]))
            {
                return i;
            }
        }
        return -1;
    }

    // Find an edge between the given X,Y points in this face
    // returns: 0-based index of edge found or -1 if not found
    findEdgeFromPoints(pt1, pt2)
    {
        for (let i = 0; i < this.edges.length; ++i)
            {
                var e = this.edges[i];
                var v = e.vertex;
                var p2 = v.point;
                if ((p2[0] != pt2[0]) || (p2[1] != pt2[1]))
                {
                    continue;
                }
                if (e.prev == null)
                {
                    if (pt1 == null)
                    {
                        return e;
                    }
                    break;
                }
                var p1 = e.prev.vertex.point;
                if ((p1[0] == pt1[0]) && (p1[1] == pt1[1]))
                {
                    return e;
                }
            }
            return null;        
    }

    // Add a new vertex to this map at the given X,Y coordinate
    // if it does not already exist
    // returns: vertex added
    addVertex(inP)
    {
        var vtxIdx = this.findVertex(inP);
        var v;

        // vertex not found in this face?
        if (vtxIdx < 0)
        {
            vtxIdx = this.vertices.length;
            v = new Vertex(inP);
            this.vertices.push(v);
        }
        // vertex already in the face
        else
        {
            v = this.vertices[vtxIdx];
            if (v != null)
            {
                log("vertex " + v.toString() + " already exists in face");
            }
        }
        return v;
    }

    addFace(inputVerts)
    {
        var face = new Face();
        var edge;

        this.faces.push(face);
        var firstVtx = this.addVertex(inputVerts[0], face);
        var prevVtx = firstVtx;
        for (let i = 1; i < inputVerts.length; ++i)
        {
            var curVtx = this.addVertex(inputVerts[i], face);
            edge = face.addEdge(prevVtx, curVtx);
            this.edges.push(edge);
            prevVtx = curVtx;
        }
        edge = face.addEdge(prevVtx, firstVtx);
        this.edges.push(edge);
        return face;
    }

    toString()
    {
        var str = "";
        for (let i = 0; i < this.faces.length; ++i)
        {
            var face = this.faces[i];
            str += "face " + i + " vertices: " + face.vertsToString() + "\n";
            str += "face " + i + " edges:\n" + face.edgesToString();
        }
        return str;     
    }

    addToBoard(board, color)
    {
        for (let i = 0; i < this.faces.length; ++i)
        {
            var face = this.faces[i];
            face.addFaceToBoard(board, color);
        }
    }

    getFace(idx)
    {
        if ((idx >= 0) && (idx < this.faces.length))
        {
            return this.faces[idx];
        }
        return null;
    }
}