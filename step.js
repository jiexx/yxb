function Recursion(steps, max, onFinish) {
	this.index = 0;
	this.steps = steps;
	this.maxSteps = max;
	this.onFinish = onFinish;
}
Recursion.prototype.untilloop = function () {
	var _this = this;
	if (_this.index < _this.maxSteps) {
		var step = _this.steps;
		if (step.check()) {
			step.then(function(){
				_this.index++;
				_this.loop();
			});
		}
		else {
			_this.onFinish();
		}
	}
	else {
		_this.onFinish();
	}
};
Recursion.prototype.waitFor = function (check, then, onFinish) {
	var timeout = 0;
	var retry = setInterval(function () {
		timeout += this.retryTimeout;
		if (timeout >= this.stepTimeout) {
			clearInterval(retry);
			onFinish();
		}
		else {
			if (!check()) {
				clearInterval(retry);
				then();
			}
		}
	}, this.retryTimeout);
};
Recursion.prototype.waitloop = function () {
	var _this = this;
	if (_this.index < _this.maxSteps && _this.index < _this.steps.length) {
		var step = _this.steps[_this.index];
		_this.waitFor(step.check, function () {
			step.then(function(){
				_this.index++;
				_this.waitloop();
			});
		}, _this.onFinish);
	}
	else {
		_this.onFinish();
	}
};

module.exports = Recursion;
