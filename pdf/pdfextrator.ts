
var GAP: number = 0.03;

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
    ss: Array<Segment> = [];
    outline: Segment = null;
    add(s: Segment) {
        this.outline = !this.outline ? s : this.outline.merge(s);
        this.ss.push(s);
    }
    intersect(tab: Table) {
        return this.outline.intersect(tab.outline);
    }
    merge(tab: Table): Table {
        var t = new Table();
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
            if (this.point[i] > a) {
                this.point.splice(i, 0, a);
                return;
            }
        }
        this.point.splice(i, 0, a);
    }
    contain(a: number) {
        var i = 0;
        if (a < this.point[0]) {
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
    out: any;
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
        var i = this.Lx.contain(x);
        var j = this.Ly.contain(y);
        if (i > -1 && j > -1) {
            this.out[i][j] = str;
        }
        
    }
    constructor(t: Table) {
        for (var i in t.ss) {
            this.add(t.ss[i]);
        }
        this.out = new Array(this.Lx.point.length);
        for (var n = 0; n < this.out.length; n++) {
            this.out[i] = new Array(this.Ly.point.length);
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
            var tab = new Table();
            tab.add(s);
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
    gather() {
        for (var i = 0; i < this.tabs.length; i++) {
            this._gather(this.tabs[i]);
        }
        for (var i = 0; i < this.tabsMerged.length; i++) {
            var g = new Grid(this.tabsMerged[i]);
            this.grids.push(g);
        }
    }
    pull(x: number, y: number, str: string) {
        for (var i in this.grids) {
            this.grids[i].put(x, y, str);
        }
    }

}

class PdfExtractor {
    pages: Array<Page> = [];
    constructor(json_pages: any) {
        for (var i in json_pages) {
            var jpf = json_pages[i].Fills;
            var jpt = json_pages[i].Texts;
            var page = new Page();
            for (var j in jpf) {
                page.put(jpf[j].x, jpf[j].y, jpf[j].w, jpf[j].h);
            }
            page.gather();
            for (var k in jpt) {
                var text = '';
                var item = jpt[k];
                for (var r in item.R) {
                    text += item.R[r].T;
                }
                page.pull(item.x, item.y, text);
            }
            this.pages.push(page);
        }
    }
    extract() {
        var out = [];
        for (var i in this.pages) {
            var page = this.pages[i];
            out[i] = page.grids;
        }
        return out;
    }
    print() {
        console.log(JSON.stringify(this.extract()));
    }
}