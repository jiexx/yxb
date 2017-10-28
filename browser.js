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
var LOG = require('./log.js');
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
	LOG.i('Usage: browser.js <uid> <AD.>');
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
	this.echo("[remote] " + msg);
});

browser.on("page.created", function () {
	this.page.onResourceTimeout = function (request) {
		this.echo("[onResourceTimeout] " + request);
	};
});
browser.on("resource.received", function(resource){
    if (resource.url.indexOf(".json") != -1 && resource.stage == "end") {
        LOG.i(resource.url);
    }
});
var _prev = null, _curr = null;

browser.start();

browser.thenOpen('https://wx.qq.com');
LOG.i('Open');

browser.waitFor(function check() {
	return this.evaluate(function () {
		console.log(document.querySelector('div.qrcode img').src);
		return document.querySelectorAll('div.qrcode').length > 0;
	});
}, function () {
	//console.log(browser.getElementAttribute('div.qrcode img', 'src'));
	browser.download(browser.getElementAttribute('div.qrcode img', 'src'), 'qrcode/' + browser.cli.args[0] + '.jpg');
	LOG.json({cmd:'UPDATE', path:'qr/' + browser.cli.args[0] + '.jpg'});
	
	browser.waitFor(function check() {
		return this.evaluate(function () {
			return document.querySelectorAll('#navContact div div div.ng-isolate-scope').length > 0;
		});
	}, function () {
		LOG.json({cmd:'DOING'});
		
		var rr = Recursion.forRecursion(
		function(){ // when
			return browser.evaluate(function () {
				var e = document.querySelector('#navContact div div div.active');
				var r = (e && e.parentNode && e.parentNode.nextSibling && e.parentNode.nextSibling.isSameNode(document.querySelector('#navContact div div.bottom-placeholder')) ? true : false);
				console.log('=====when '+r);
				return r;
			});
		}, 
		function(args, next){ // func
			LOG.i('============================================web_wechat_tab_friends');
			browser.sendKeys('pre#editArea', browser.page.event.key.Escape );
			browser.click('a[ui-sref=contact]');
			
			browser.waitFor(function check() {
				return this.evaluate(function () {
					return document.querySelectorAll('i.web_wechat_tab_friends.web_wechat_tab_friends_hl').length > 0 && document.querySelectorAll('#navContact div').length > 5;
				});
			}, function(){
				LOG.i('============================================key.Down');
				_prev = browser.evaluate(function () {
					var e = {};
					if(document.querySelector('#navContact div div div.active div div.info h4.nickname')) {
						console.log('====active  _prev '+document.querySelector('#navContact div div div.active div div.info h4.nickname').innerHTML);
						e.name = document.querySelector('#navContact div div div.active div div.info h4.nickname').innerHTML;
						e.avatar = document.querySelector('#navContact div div div.active div div.avatar img').src;
					}
					
					var event = document.createEvent("Events");
					event.initEvent("keydown", true, true);
					event.keyCode = 40;
					document.querySelector('#navContact').dispatchEvent(event);
					
					return e;
				});
				browser.waitFor(function check() {
					//this.capture((new Date()).getTime()+'.jpg');
					_curr = this.evaluate(function () {
						var e = {};
						if(document.querySelector('#navContact div div div.active div div.info h4.nickname')) {
							console.log('====active  _curr '+document.querySelector('#navContact div div div.active div div.info h4.nickname').innerHTML);
							e.name = document.querySelector('#navContact div div div.active div div.info h4.nickname').innerHTML;
							e.avatar = document.querySelector('#navContact div div div.active div div.avatar img').src;
						}
						return e;
					});
					if(_prev && _curr && _prev.avatar == _curr.avatar) {
						return false;
					}else {
						LOG.i('====keypress  true');
						return true;
					}
				}, function(){
					LOG.i('============================================button to web_wechat_tab_chat');
					browser.click('div.action_area a.button');
					browser.waitFor(function check() {
						return this.evaluate(function () {
							return document.querySelectorAll('i.web_wechat_tab_chat.web_wechat_tab_chat_hl').length > 0;
						});
					}, function(){
						LOG.i('============================================sendKeys '+browser.cli.args[1]);
						browser.sendKeys('pre#editArea', browser.cli.args[1], {keepFocus: true});
						browser.sendKeys('pre#editArea', browser.page.event.key.Escape );
						browser.click('a.btn.btn_send');
						browser.waitFor(function check() {
							return this.evaluate(function () {
								return document.querySelectorAll('pre.js_message_plain').length > 0;
							});
						}, function(){
							LOG.i('+++++++++++++++++++++++++++++++++++++++++++++++++++');
							LOG.i(' ');
							LOG.i(' ');
							next();
						});
					});
				});
			});
		}, null, 
		function(){ // finish
			LOG.json({cmd:'DONE'});
			browser.click('body div.main div div.panel div.header div.info h3 a');
			browser.waitFor(function check() {
				return this.evaluate(function () {
					return document.querySelectorAll('#mmpop_system_menu').length > 0;
				});
			}, function(){
				browser.click('#mmpop_system_menu ul li.last_child a');
				LOG.json({cmd:'DONE'});
				browser.exit();
			});
		}, null);
        rr.loop();
	});
});

browser.then(function () {
	LOG.json({cmd:'DONE'});
	browser.exit();
});

browser.run();
}
