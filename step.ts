interface Step {
    check(): boolean;
    then();
}

class Recursion {
    steps: Step[] = new Array<Step>();
    index: number = 0;
    maxSteps: number = 1024;
    onFinish: any;
    retryTimeout: 100;
    setpTimeout: 60000;
    constructor(steps: Step[], max: number, onFinish: any) {
        this.steps = steps;
        this.maxSteps = max;
        this.onFinish = onFinish;
    }
    loop() {
        var _this = this;
        if (_this.index < _this.maxSteps && _this.index < _this.steps.length) {
            var step = _this.steps[_this.index];
            if (step.check()) {
                step.then();
                _this.index ++;
                _this.loop();
            } else {
                _this.onFinish();
            }
        } else {
            _this.onFinish();
        }
    }
    waitFor(check: any, then: any, onFinish: any) {
        var timeout = 0;
        var retry = setInterval(function () {
            timeout += this.retryTimeout;
            if (timeout >= this.stepTimeout) {
                clearInterval(retry);
                onFinish();
            } else {
                if(!check()) {
                    clearInterval(retry);
                    then();
                }
            }
        }, this.retryTimeout);
    }
    waitloop() {
        var _this = this;
        if (_this.index < _this.maxSteps && _this.index < _this.steps.length) {
            var step = _this.steps[_this.index];
            _this.waitFor(
                step.check,
                function () {
                    step.then();
                    _this.index ++;
                    _this.waitloop();
                },
                _this.onFinish
            );
        } else {
            _this.onFinish();
        }
	}
}

