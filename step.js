function Recursion(steps, max, onFinish, browser) {
	this.index = 0;
	this.steps = steps;
	this.maxSteps = max;
	this.onFinish = onFinish;
    this.retryTimeout = 100;
    this.loopTimeout = 60000;
	this.timer = 0;
	this.browser = browser;
}
Recursion.prototype.untilloop = function () {
	var _this = this;
	var step = _this.steps;
	if (_this.index < _this.maxSteps && !step.check()) {
		step.then(function(){
			_this.index++;
			_this.untilloop();
		});
	}
	else {
		_this.onFinish();
	}
};
Recursion.prototype.waitFor = function (step) {
	console.log('waitFor 2: ');
	this.timer += this.retryTimeout;
	if(this.timer >= this.loopTimeout){
		this.onFinish();
	}else if ( step.check() ) {
		var _this = this;
		console.log('waitFor 1: ');
		step.then(function(){
				_this.index++;
				_this.waitloop();
			});
	}else {
		console.log('waitFor 3: ');
		setTimeout(this.waitFor, this.retryTimeout, step);
	}
};
Recursion.prototype.waitloop = function () {
	if (this.index < this.maxSteps && this.index < this.steps.length) {
		var step = this.steps[this.index];
		var _this = this;
		this.browser.waitFor(step.check, function(){
					step.then(function(){
						_this.index++;
						_this.waitloop();
					});
				});
	} else {
		this.onFinish();
	}
};

module.exports = Recursion;
