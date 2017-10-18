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
			var a = document.querySelectorAll('a.btn.btn_send').length > 0;
			console.log('====='+document.querySelector('a.btn.btn_send').outerHTML);
			return a;
		});
	}, function () {
		console.log('COMMAND: DOING');
		var e = browser.getElementsInfo('a.chat_item.slide-left');
		var i = 0;
		e.forEach(function (element) {
			browser.click('a.chat_item.slide-left:nth-child(' + i + ')');
			browser.waitFor(function check() {
				return this.evaluate(function () {
					var a = document.querySelectorAll('a.btn.btn_send').length > 0;
					return a;
				});
			}, function () {
				browser.sendKeys('pre#editArea', browser.cli.args[1]);
				browser.click('a.btn.btn_send');
			});
			i++;
			if (i == e.length) {
				console.log('COMMAND: DONE');
			}
		});
	});
});

browser.then(function () {
	browser.exit();
	console.log('browser exit');
});

browser.run();
}
