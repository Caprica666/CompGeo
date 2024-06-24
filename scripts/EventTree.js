
class EventTree
{
    constructor(label, tree)
    {
        this.label = label;
        this.tree = tree;
        this.epsilon = 1e-13;
    }

    FindLowerBound(ev)
    {
        var iter = this.tree.lowerBound(ev);
        var data = iter.prev();
        if (data != null)
        {
            log("lower bound " + data.EventToString());
        }
        return data;
    }

    FindUpperBound(ev)
    {
        var iter = this.tree.upperBound(ev);
        var data = iter.data();
        if (data != null)
        {
            log("upper bound " + data.EventToString());
        }
        return data;
    }

    RemoveEvent(ev)
    {
        log(this.label + ": removing event " + ev.EventToString());
        var removed = this.tree.remove(ev);
        if (!removed)
        {
            log("Could not remove " + ev.name);
        }
    }

    InsertEvent(ev)
    {  
        log(this.label + ": inserting event " + ev.EventToString());
        this.tree.insert(ev);  
    }

    PrintTree()
    {
        var iter = this.tree.iterator();
        var str = this.label + ": ";
        var i = 0;
        var ev;

        while ((ev = iter.next()) !== null)
        {
            str += ev.EventToString() + " ";
            if ((++i % 6) == 0)
            {
                log(str);
                str = "";
            }
        }
        log(str);
    }
   
    Min()
    {
        return this.tree.min();
    }
}


// Sort events on X and then Y
function SortEventOnXY(e1, e2)
{
    var epsilon = 1e-13;
    if (e1 === e2)
    {
        return 0;
    }
    var x1 = e1.GetX();
    var x2 = e2.GetX();
    
    var dx = x1 - x2;
    if (Math.abs(dx) > epsilon)
    {
        return dx;
    }
    var y1 = e1.GetY();
    var y2 = e2.GetY();
    var dy = y1 - y2;
    if (Math.abs(dy) > epsilon)
    {
        return dy;
    }
    log("Error - endpoints " + e1.name + " and " + e2.name + " co-indicent!");
    return e1.name.localeCompare(e2.name);
}