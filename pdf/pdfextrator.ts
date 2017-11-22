var GAP: number = 0.033;

class Segment {
    x: number = 0;
    y: number = 0;
    w: number = 0;
    h: number = 0;
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    overlap(a1, a2, b1, b2) {
        a1 = a1 - GAP;
        a2 = a2 + GAP;
        return (b1 >= a1 && b1 <= a2) || (b2 >= a1 && b2 <= a2);
    }
    intersect(s: Segment) {
        var ox = this.overlap(this.x, this.x + this.w, s.x, s.x + s.w);
        var oy = this.overlap(this.y, this.y + this.h, s.y, s.y + s.h);
        return ox && oy;
    }
    merge(s: Segment): Segment {
        var nx = Math.min(this.x, s.x);
        var ny = Math.min(this.y, s.y);
        var nw = Math.max(this.x + this.w, s.x + s.w) - nx;
        var nh = Math.max(this.y + this.h, s.y + s.h) - ny;
        return new Segment(nx, ny, nw, nh);
    }
};

class Table {
    ss: Array<Segment>;
    outline: Segment;
    constructor(s, outline) {
        this.ss = [s];
        this.outline = outline;
    }
    add(s: Segment) {
        this.outline = !this.outline ? s : this.outline.merge(s);
        this.ss.push(s);
    }
    intersect(tab: Table) {
        return this.outline.intersect(tab.outline);
    }
    merge(tab: Table): Table {
        var t = new Table(tab.ss, tab.outline);
        t.ss = this.ss || tab.ss;
        t.outline = this.outline.merge(tab.outline);
        return t;
    }
}

class Line {
    point: Array<number> = [];
    add(a: number) {
        var i = 0;
        for (i = 0; i < this.point.length; i++) {
            if (Math.abs(this.point[i]-a)<GAP) {
                return;
            }else if (this.point[i] > a) {
                this.point.splice(i, 0, a);
                return;
            }
        }
        this.point.splice(i, 0, a);
    }
    contain(a: number) {
        var i = 0;
        if (a < this.point[0] || a > this.point[this.point.length-1]) {
            return -1;
        } else {
            for (i = 1; i < this.point.length; i++) {
                if (this.point[i] > a) {
                    break;
                }
            }
        }
        return i - 1;
    }
}

class Grid {
    Lx: Line = new Line();
    Ly: Line = new Line();
    out: any = null;
    add(s: Segment) {
        if (s.w > s.h && Math.abs(s.h-GAP)<GAP) { //horizontal line
            this.Lx.add(s.x);
            this.Lx.add(s.x+s.w);
        } else if (s.w < s.h && Math.abs(s.w-GAP)<GAP) {
            this.Ly.add(s.y);
            this.Ly.add(s.y+s.h);
        }
    }
    put(x: number, y: number, str: string) {
        if (this.out) {
            var j = this.Lx.contain(x);
            var i = this.Ly.contain(y);
            if (i > -1 && j > -1) {
                if (!this.out[i][j]) {
                    this.out[i][j] = str;
                } else if(this.out[i][j] != str){
                    this.out[i][j] = this.out[i][j]+str;
                }
            }
        }
    }
    constructor(t: Table) {
        for (var i in t.ss) {
            this.add(t.ss[i]);
        }
        if (this.Lx.point.length > 0 && this.Ly.point.length > 0) {
            this.out = new Array(this.Ly.point.length);
            for (var n = 0; n < this.out.length; n++) {
                this.out[n] = new Array(this.Lx.point.length);
            }
        }
    }
}

class Page {
    tabs: Array<Table> = [];
    tabsMerged: Array<Table> = [];
    grids: Array<Grid> = [];
    put(x: number, y: number, w: number, h: number) {
        var s = new Segment(x, y, w, h);
        var inside = false;
        for (var i in this.tabs) {
            var tab = this.tabs[i];
            if (tab.outline.intersect(s)) {
                tab.add(s);
                inside = true;
            }
        }
        if (!inside) {
            var tab = new Table(s, s);
            //tab.add(s);
            this.tabs.push(tab);
        }
    }
    _gather(t: Table) {
        var has = false;
        for (var i = 0; i < this.tabsMerged.length; i++) {
            if (t.intersect(this.tabsMerged[i])) {
                this.tabsMerged[i] = t.merge(this.tabsMerged[i]);
                has = true;
            }
        }
        if (!has) {
            this.tabsMerged.push(t);
        }
    }
    constructor(Fills: any, Texts: any) {
        for (var i = 0; i < Fills.length; i++) {
            this.put(Fills[i].x, Fills[i].y, Fills[i].w, Fills[i].h);
        }
            
        for (var i = 0; i < this.tabs.length; i++) {
            this._gather(this.tabs[i]);
        }
        for (var i = 0; i < this.tabsMerged.length; i++) {
            var g = new Grid(this.tabsMerged[i]);
            this.grids.push(g);
        }

        for (var k in Texts) {
            var text = '';
            var item = Texts[k];
            for (var r in item.R) {
                text += item.R[r].T;
            }
            this.pull(item.x, item.y, item.w, text);
        }
        
    }
    pull(x: number, y: number, w: number, str: string) {
        for (var i in this.grids) {
            this.grids[i].put(x+(w/2.0), y+GAP, str);
        }
    }

}

class PdfExtractor {
    pages: Array<Page> = [];
    constructor(json_pages: any) {
        for (var i in json_pages) {
            var page = new Page(json_pages[i].Fills, json_pages[i].Texts);
            this.pages.push(page);            
        }
    }
    extract() {
        var out = [];
        for (var i in this.pages) {
            var page = this.pages[i];
            var grids = this.pages[i].grids;
            for (var j in grids) {
                if (grids[j].out) {
                    out.push(grids[j].out);
                }
            }
        }
        return out;
    }
    output() {
        var out = [];
        for (var i in this.pages) {
            var page = this.pages[i];
            var grids = this.pages[i].grids;
            out[i] = [];
            for (var j in grids) {
                if (grids[j].out) {
                    out[i].push({ outlinex: grids[j].Lx.point, outliney: grids[j].Ly.point, out: grids[j].out });
                }
            }
        }
        return out;
    }
}