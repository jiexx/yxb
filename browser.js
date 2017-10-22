var Each = {
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
	forEach: function(count, func, funcArgs, onFinish, onceFinish) {
		var obj = {
			func:func,
			i:0,
			onFinish:onFinish,
			onceFinish:onceFinish,
			loop:Each.loop,
			funcArgs:funcArgs
		};
		return obj;
	},
};
var Recursion = {
	loop: function() {
		var _this = this;
		if(!_this.when() && _this.i < 3) {
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
		}else {
			if(_this.onFinish) {
				_this.onFinish();
			}
		}
	},
	forRecursion: function(when, func, funcArgs, onFinish, onceFinish) {
		var obj = {
			func:func,
			count:0,
			i:0,
			when:when,
			onFinish:onFinish,
			onceFinish:onceFinish,
			loop:Recursion.loop,
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
			waitTimeout: 200000,
			retryTimeout: 100,
			webSecurityEnabled: false,
			//userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1349.2 Safari/537.21'
			userAgent : 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
		}
		//logLevel: "debug",
		//verbose: true
	});
phantom.outputEncoding = "GBK";
browser.options.retryTimeout = 100;
browser.options.waitTimeout = 200000;
browser.options.onResourceRequested = function (C, requestData, request) {
	//if (!(/.*\.xunleitai\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
	//	|| (/.*\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/javascript'
	//)
	//{
	//	console.log('redirect Skipping JS file: ' + requestData['url']);
	//	request.abort();
	//} else {
	//	console.log('Down file: ' + requestData['url']);
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
browser.on("resource.received", function(resource){
    if (resource.url.indexOf(".json") != -1 && resource.stage == "end") {
        console.log(resource.url);
    }
});
var _prev = null, _curr = null;

browser.start();

browser.thenOpen('https://wx.qq.com');
console.log('Open');

browser.waitFor(function check() {
	return this.evaluate(function () {
		console.log(document.querySelector('div.qrcode img').src);
		return document.querySelectorAll('div.qrcode').length > 0;
	});
}, function () {
	console.log(browser.getElementAttribute('div.qrcode img', 'src'));
	browser.download(browser.getElementAttribute('div.qrcode img', 'src'), 'qrcode/' + browser.cli.args[0] + '.jpg');
	console.log('COMMAND: UPDATE');
	
	browser.waitFor(function check() {
		return this.evaluate(function () {
			return document.querySelectorAll('#navContact div div div.ng-isolate-scope').length > 0;
		});
	}, function () {
		console.log('COMMAND: DOING');
		
		var rr = Recursion.forRecursion(
		function(){ // when
			return browser.evaluate(function () {
				console.log('=====when '+(document.querySelectorAll('#navContact div div div.active + div.bottom-placeholder').length > 0));
				return document.querySelectorAll('#navContact div div div.active + div.bottom-placeholder').length > 0;
			});
		}, 
		function(args, next){ // func
			console.log('============================================web_wechat_tab_friends');
			browser.click('a[ui-sref=contact]');
			browser.waitFor(function check() {
				return this.evaluate(function () {
					//console.log(document.querySelectorAll('#navContact div.ng-isolate-scope').length);
					return document.querySelectorAll('i.web_wechat_tab_friends.web_wechat_tab_friends_hl').length > 0 && document.querySelectorAll('#navContact div.ng-isolate-scope').length > 5;
				});
			}, function(){
				console.log('============================================key.Down');
				if(!_prev) {
					_prev = browser.evaluate(function () {
						var e = null;
						if(document.querySelector('#navContact div div div.active h4.nickname')) {
							console.log('====active  '+document.querySelector('#navContact div div div.active h4.nickname').innerHTML);
							e = document.querySelector('#navContact div div div.active h4.nickname').innerHTML;
						}
						
						var event = document.createEvent("Events");
						event.initEvent("keydown", true, true);
						event.keyCode = 40;
						document.querySelector('#navContact div').dispatchEvent(event);
						
						return e;
					});
				}else {
					browser.evaluate(function () {
						var event = document.createEvent("Events");
						event.initEvent("keydown", true, true);
						event.keyCode = 40;
						document.querySelector('#navContact div').dispatchEvent(event);
					});
				}
				//browser.page.sendEvent('keydown', browser.page.event.key.Down);
				browser.waitFor(function check() {
					//this.capture((new Date()).getTime()+'.jpg');
					_curr = this.evaluate(function () {
						var e = null;
						if(document.querySelector('#navContact div div div.active h4.nickname')) {
							//console.log('====active  '+document.querySelector('#navContact div div div.active h4.nickname').innerHTML);
							e = document.querySelector('#navContact div div div.active h4.nickname').innerHTML;
						}
						
						var event = document.createEvent("Events");
						event.initEvent("keydown", true, true);
						event.keyCode = 40;
						document.querySelector('#navContact div').dispatchEvent(event);
						
						return e;
					});
					if(_prev) {
							console.log('====_prev  '+_prev);
						}
					if(_curr) {
							console.log('====_curr  '+_curr);
						}
					if(_prev && _curr && _prev == _curr) {
						//console.log('====keypress  false ');
						//this.capture((new Date()).getTime()+'.jpg');
						return false;
					}else {
						console.log('====keypress  true');
						_prev = _curr;
						//this.capture((new Date()).getTime()+'true.jpg');
						return true;
					}
				}, function(){
					console.log('============================================button to web_wechat_tab_chat');
					browser.click('div.action_area a.button');
					browser.waitFor(function check() {
						return this.evaluate(function () {
							return document.querySelectorAll('i.web_wechat_tab_chat.web_wechat_tab_chat_hl').length > 0;
						});
					}, function(){
						console.log('============================================sendKeys '+browser.cli.args[1]);
						browser.sendKeys('pre#editArea', browser.cli.args[1], {keepFocus: true});
						browser.click('a.btn.btn_send');
						browser.waitFor(function check() {
							return this.evaluate(function () {
								return document.querySelectorAll('pre.js_message_plain').length > 0;
							});
						}, function(){
							console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++');
							console.log(' ');
							console.log(' ');
							next();
						});
					});
				});
			});
		}, null, 
		function(){ // finish
			console.log('COMMAND: DONE');
			browser.exit();
		}, null);
        rr.loop();
	});
});

browser.then(function () {
	console.log('COMMAND: DONE');
	browser.exit();
});

browser.run();
}
