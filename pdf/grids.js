function Point() {
	this.x = 0;
	this.y = 0;
	this.c = 0;
}

function Grid() {
	this.x = [];
	this.y = [];
}
Grid.prototype.contain = function () {

};

function Grids() {
	this.grids = [][];
}
Grids.prototype.extract = function () {

};


module.exports = Grids;