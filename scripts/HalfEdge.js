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

    setFace(face)
    {
        var e = this;

        face.edge = e;
        do
        {
            e.face = face;
            e = e.next;
        }
        while (e != this);
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
        if (e == null)
        {
            return null;
        }
        do
        {
            var v = e.vertex;
            var p = v.point;

            if ((p[0] == inP[0]) && (p[1] == inP[1]))
            {
                return e;
            }
            e = e.next;
        }
        while ((e != null) && (e != this.edge));
        return null;        
    }

    // Find an edge in this face containing the given vertex
    findEdgeFromVertex(inV)
    {
        var e = this.edge;
        if (e == null)
        {
            return null;
        }
        do
        {
            var v = e.vertex;

            if (v == inV)
            {
                return e;
            }
            e = e.next;
        }
        while ((e != null) && (e != this.edge));
        return null;        
    }

    // Add an edge to this face originating at the given vertex
    // No check is made to see if the edge already exists
    // returns: edge that was added
    addEdge(vtx1, vtx2)
    {
        // is it the first edge?
        if (this.edge == null)
        {
            this.edge = new HalfEdge(vtx2, this);
            return this.edge;
        }
        var v1Prev = this.findEdgeFromVertex(vtx1);
        var v2Prev = this.findEdgeFromVertex(vtx2);

        if (v1Prev == null)
        {
            log("edge ending at " + vtx1.toString() + " not found in this face");
            return null;
        }
        var e = new HalfEdge(vtx2, this);

        // destination vertex not found in this face.
        // assume this edge comes after previous edge
        if (v2Prev == null)
        {
            v2Prev = v1Prev.next;
            e.prev = v1Prev;
            v1Prev.next = e;
            if (v2Prev != null)
            {
                e.next = v2Prev;
                v2Prev.prev = e;
            }
            else
            {
                v1Prev.prev = e;
                e.next = v1Prev;
            }
            return e;
        }
        // both vertices are in this face
        // this edge splits the face into two faces
        // it is an interior edge between two faces
        // make a new face and add the twin edge
        e.outside = false;

        var v2Next = v2Prev.next;
        var v1Next = v1Prev.next;
        if ((v1Prev == v2Next) || (v2Prev == v1Next))
        {
            log("Cannot split triangular face");
            return null;
        }
        var newFace = new Face();
        var twin = new HalfEdge(vtx1, newFace);

        e.prev = v1Prev;
        e.next = v2Next;
        v1Prev.next = e;
        v2Next.prev = e;
        v2Prev.next = null;
        this.edge = e; 
        e.twin = twin;
        twin.twin = e;
        twin.next = v1Next;
        twin.prev = v2Prev;
        v1Next.prev = twin;
        v2Prev.next = twin; 
        twin.setFace(newFace);
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
        if (e.prev != null)
        {
            str += e.prev.vertex.toString();
        }
        while ((e.next != null) && (e.next != this.edge))
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
        if (edge == null)
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
        this.epsilon = 0.000001;
    }

    // Find a vertex with the given X,Y coordinates in this face
    // returns: vertex found or null if not found
    findVertex(inP)
    {
        for (let i = 0; i < this.vertices.length; ++i)
        {
            var p = this.vertices[i].point;
            if ((Math.abs(p[0] - inP[0]) < this.epsilon) && (Math.abs(p[1] - inP[1]) < this.epsilon))
            {
                return this.vertices[i];
            }
        }
        return null;
    }

    // Find an edge between the given X,Y points in this face
    // returns: edge found or null if not found
    findEdgeFromPoints(pt1, pt2)
    {
        for (let i = 0; i < this.edges.length; ++i)
            {
                var e = this.edges[i];
                var v = e.vertex;
                var p2 = v.point;
                if ((Math.abs(p2[0] - pt2[0]) > this.epsilon) || (Math.abs(p2[1] - pt2[1]) > this.epsilon))
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

    findEdgeFromVerts(vtx1, vtx2)
    {
        for (let i = 0; i < this.edges.length; ++i)
        {
            var e = this.edges[i];

            if (e.vertex != vtx2)
            {
                continue;
            }
            if (e.prev == null)
            {
                break;
            }
            if (e.prev.vertex == vtx1)
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
        var v = this.findVertex(inP);

        // vertex not found in this face?
        if (v == null)
        {
            v = new Vertex(inP);
            this.vertices.push(v);
        }
        // vertex already in the face
        else
        {
            if (v != null)
            {
                log("vertex " + v.toString() + " already exists in face");
            }
        }
        return v;
    }

    addEdgeFromPoints(p1, p2, face)
    {
        var vtx1 = this.findVertex(p1);
        var vtx2 = this.findVertex(p2);
        if ((vtx1 == null) || (vtx2 == null))
        {
            log("Cannot find point(s) in map");
        }
        this.addEdge(vtx1, vtx2, face);
    }

    addEdge(vtx1, vtx2, face)
    {
        var edge = this.findEdgeFromVerts(vtx1, vtx2);

        if (edge != null)
        {
            return edge;
        }
        edge = face.addEdge(vtx1, vtx2);
        if (!edge.outside && (edge.twin != null))
        {
            var newFace = edge.twin.face;
            this.faces.push(newFace);
            log("old face: " + face.edgesToString());
            log("new face: " + newFace.edgesToString());
        }
        return edge;
    }

    findTwin(edge)
    {
        var prevEdge = edge.prev;

        if (edge.twin != null)
        {
            return edge.twin;
        }
        if (prevEdge == null)
        {
            return null;
        }
        return this.findEdgeFromVerts(edge.vertex, prevEdge.vertex);
    }

    addFace(inputVerts)
    {
        var face = new Face();
        var edge;

        this.faces.push(face);
        var firstVtx = this.addVertex(inputVerts[0]);
        var prevVtx = firstVtx;
        for (let i = 1; i < inputVerts.length; ++i)
        {
            var curVtx = this.addVertex(inputVerts[i], face);
            edge = face.addEdge(prevVtx, curVtx);
            this.edges.push(edge);
            prevVtx = curVtx;
        }
        edge = this.addEdge(prevVtx, firstVtx, face);
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