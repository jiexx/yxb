var GAP = 0.03;
var Segment = /** @class */ (function () {
    function Segment(x, y, w, h) {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    Segment.prototype.overlap = function (a1, a2, b1, b2) {
        a1 = a1 - GAP;
        a2 = a2 + GAP;
        return (b1 >= a1 && b1 <= a2) || (b2 >= a1 && b2 <= a2);
    };
    Segment.prototype.intersect = function (s) {
        var ox = this.overlap(this.x, this.x + this.w, s.x, s.x + s.w);
        var oy = this.overlap(this.y, this.y + this.h, s.y, s.y + s.h);
        return ox && oy;
    };
    Segment.prototype.merge = function (s) {
        var nx = Math.min(this.x, s.x);
        var ny = Math.min(this.y, s.y);
        var nw = Math.max(this.x + this.w, s.x + s.w) - nx;
        var nh = Math.max(this.y + this.h, s.y + s.h) - ny;
        return new Segment(nx, ny, nw, nh);
    };
    return Segment;
}());
;
var Table = /** @class */ (function () {
    function Table() {
        this.ss = [];
        this.outline = null;
    }
    Table.prototype.add = function (s) {
        this.outline = !this.outline ? s : this.outline.merge(s);
        this.ss.push(s);
    };
    Table.prototype.intersect = function (tab) {
        return this.outline.intersect(tab.outline);
    };
    Table.prototype.merge = function (tab) {
        var t = new Table();
        t.ss = this.ss || tab.ss;
        t.outline = this.outline.merge(tab.outline);
        return t;
    };
    return Table;
}());
var Line = /** @class */ (function () {
    function Line() {
        this.point = [];
    }
    Line.prototype.add = function (a) {
        var i = 0;
        for (i = 0; i < this.point.length; i++) {
            if (this.point[i] > a) {
                this.point.splice(i, 0, a);
                return;
            }
        }
        this.point.splice(i, 0, a);
    };
    Line.prototype.contain = function (a) {
        var i = 0;
        if (a < this.point[0]) {
            return -1;
        }
        else {
            for (i = 1; i < this.point.length; i++) {
                if (this.point[i] > a) {
                    break;
                }
            }
        }
        return i - 1;
    };
    return Line;
}());
var Grid = /** @class */ (function () {
    function Grid(t) {
        this.Lx = new Line();
        this.Ly = new Line();
        for (var i in t.ss) {
            this.add(t.ss[i]);
        }
        console.log('Grid create..');
        this.out = new Array(this.Lx.point.length);
        for (var n = 0; n < this.out.length; n++) {
            this.out[i] = new Array(this.Ly.point.length);
        }
        console.log('Grid :'+JSON.stringify(this.out));
    }
    Grid.prototype.add = function (s) {
        if (s.w > s.h && Math.abs(s.h - GAP) < GAP) {
            this.Lx.add(s.x);
            this.Lx.add(s.x + s.w);
        }
        else if (s.w < s.h && Math.abs(s.w - GAP) < GAP) {
            this.Ly.add(s.y);
            this.Ly.add(s.y + s.h);
        }
    };
    Grid.prototype.put = function (x, y, str) {
        var i = this.Lx.contain(x);
        var j = this.Ly.contain(y);
        console.log('put Grid :'+JSON.stringify(this.out));
        if (i > -1 && j > -1) {
            this.out[i][j] = str;
        }
    };
    return Grid;
}());
var Page = /** @class */ (function () {
    function Page() {
        this.tabs = [];
        this.tabsMerged = [];
        this.grids = [];
    }
    Page.prototype.put = function (x, y, w, h) {
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
    };
    Page.prototype._gather = function (t) {
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
    };
    Page.prototype.gather = function () {
        for (var i = 0; i < this.tabs.length; i++) {
            this._gather(this.tabs[i]);
        }
        for (var i = 0; i < this.tabsMerged.length; i++) {
            var g = new Grid(this.tabsMerged[i]);
            this.grids.push(g);
        }
    };
    Page.prototype.pull = function (x, y, str) {
        for (var i in this.grids) {
            this.grids[i].put(x, y, str);
        }
    };
    return Page;
}());
var PdfExtractor = /** @class */ (function () {
    function PdfExtractor(json_pages) {
        this.pages = [];
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
    PdfExtractor.prototype.extract = function () {
        var out = [];
        for (var i in this.pages) {
            var page = this.pages[i];
            out[i] = page.grids;
        }
        return out;
    };
    PdfExtractor.prototype.print = function () {
        console.log(JSON.stringify(this.extract()));
    };
    return PdfExtractor;
}());


module.exports = PdfExtractor;
