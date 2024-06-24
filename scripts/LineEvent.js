class LineEvent
{
    // Describes an intersection event
    // type: type of event, 'first' or 'last'
    // line: JSX line being intersected
    constructor(name, type, p1, p2, link = null)
    {
        this.type = type;
        this.name = name;
        this.type = type;
        this.point1 = p1;
        this.point2 = p2;
        this.link = link;

        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        if (Math.abs(dx) < 1e-13)
        {
            this.slope = Number.MAX_SAFE_INTEGER;
        }
        else
        {
            this.slope = dy / dx;
        }
    }

    GetX()
    {
        if (this.type == 'last')
        {
            return this.point2[0];
        }
        return this.point1[0];
    }

    GetY()
    {
        if (this.type == 'last')
        {
            return this.point2[1];
        }
        return this.point1[1];
    }   

    EventToString()
    {
        var x = this.GetX();
        var y = this.GetY();
        
        return this.name + "-" + this.type + "[" + x + ", " + y + "]";
    }
    
    YIntersection(x)
    {
        if (this.slope == Number.MAX_SAFE_INTEGER)
        {
            return this.point1[1];
        }
        var b = this.point1[1] - this.slope * this.point1[0];
        var y = this.slope * x + b;
        return y;
    }
}