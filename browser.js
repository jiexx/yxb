var QueueLooper = {
	loop: function() {
		var _this = this;
		if(_this.i == _this.count) {
			if(_this.onFinish) {
				_this.onFinish();
			}
		}
		if(_this.i < _this.count) {
			_this.func(_this.funcArgs, function(){
				if(_this.onceFinish) {
					var args = new Array(arguments.length+1);
					args[0] = _this.funcArgs;
					for(var i = 1; i < arguments.length; ++i) {
						args[i+1] = (arguments[i]);
					}
					_this.onceFinish.apply(this, args);
				}
				_this.i ++;
				_this.loop();
			});
		}
	},
	create: function(count, func, funcArgs, onFinish, onceFinish) {
		var obj = {
			func:func,
			count:count,
			i:0,
			onFinish:onFinish,
			onceFinish:onceFinish,
			loop:QueueLooper.loop,
			funcArgs:funcArgs
		};
		return obj;
	}
};

var browser = require('casper').create({
		pageSettings : {
			loadImages : true,
			loadPlugins : true,
			javascriptEnabled : true,
			resourceTimeout : 50000,
			webSecurityEnabled: false,
			//userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1349.2 Safari/537.21'
			userAgent : 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
		}
		//logLevel: "debug",
		//verbose: true
	});
phantom.outputEncoding = "GBK";
browser.options.retryTimeout = 20;
browser.options.waitTimeout = 200000;
browser.options.onResourceRequested = function (C, requestData, request) {
	//if (!(/.*\.xunleitai\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
	//	|| (/.*\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/javascript'
	//)
	//{
	//	console.log('redirect Skipping JS file: ' + requestData['url']);
	//	request.abort();
	//} else {
		console.log('redirect Down JS file: ' + requestData['url']);
	//}
};

if (browser.cli.args.length != 2) {
	console.log('Usage: browser.js <uid> <AD.>');
	browser.exit();
}else {

var fs = require('fs');

browser.on('error', function (msg, backtrace) {
	fs.write('err/browser_' + new Date().getTime().toString() + '.txt', msg + "\n\n" + backtrace, 'w');
});

browser.on("page.error", function (msg, backtrace) {
	fs.write('err/browser_' + new Date().getTime().toString() + '.txt', msg + "\n\n" + backtrace, 'w');
});

browser.on("remote.message", function (msg) {
	this.echo("console.log: " + msg);
});

browser.on("page.created", function () {
	this.page.onResourceTimeout = function (request) {
		this.echo("onResourceTimeout: " + request);
	};
});

browser.start();

browser.thenOpen('https://wx.qq.com');
console.log('Open');

browser.waitFor(function check() {
	return this.evaluate(function () {
		var a = document.querySelectorAll('div.qrcode').length > 0;
		console.log(document.querySelector('div.qrcode img').src);
		return a;
	});
}, function () {
	console.log(browser.getElementAttribute('div.qrcode img', 'src'));
	browser.download(browser.getElementAttribute('div.qrcode img', 'src'), 'qrcode/' + browser.cli.args[0] + '.jpg');
	console.log('COMMAND: UPDATE');
	browser.waitFor(function check() {
		return this.evaluate(function () {
			console.log('====='+document.querySelector('div.chat_item.slide-left').innerHTML);
			return document.querySelectorAll('div.chat_item.slide-left').length > 0;
		});
	}, function () {
		console.log('COMMAND: DOING');
		var e = browser.getElementsInfo('#J_NavChatScrollBody div');
		var ql = QueueLooper.create(e.length, function(funcArgs, onFinish){
			browser.click('#J_NavChatScrollBody div:nth-child(' + ql.i + ')');
			browser.waitFor(function check() {
				return this.evaluate(function () {
					var a = document.querySelector('a.title_name').innerHTML == element.innerHTML;
					return a;
				});
			}, function () {
				browser.sendKeys('pre#editArea', browser.cli.args[1]);
				browser.click('a.btn.btn_send');
				browser.waitFor(function check() {
					return this.evaluate(function () {
						var a = document.querySelector('pre.js_message_plain').innerHTML == browser.cli.args[1];
						return a;
					});
				}, onFinish);
			});
		}, null, 
		function(){
			console.log('COMMAND: DONE');
			browser.exit();
		}, null);
        ql.loop();
	});
});

browser.then(function () {
	browser.exit();
	console.log('browser exit');
});

browser.run();
}
