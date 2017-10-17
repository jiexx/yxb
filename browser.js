var browser = require('casper').create({
		pageSettings : {
			loadImages : false,
			loadPlugins : false,
			javascriptEnabled : true,
			resourceTimeout : 50000,
			//userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1349.2 Safari/537.21'
			userAgent : 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
		}
		//logLevel: "debug",
		//verbose: true
	});
phantom.outputEncoding = "GBK";
browser.options.retryTimeout = 20;
browser.options.waitTimeout = 20000;
browser.options.onResourceRequested = function (C, requestData, request) {
	if (!(/.*\.xunleitai\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
		/*|| (/.*\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/javascript'*/
	)
	{
		console.log('redirect Skipping JS file: ' + requestData['url']);
		request.abort();
	} else {
		console.log('redirect Down JS file: ' + requestData['url']);
	}
};

if (browser.cli.args.length != 2) {
	console.log('Usage: browser.js <uid> <AD.>');
	browser.exit();
}

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

browser.thenOpen('http://wx.qq.com');
console.log('thenOpen');

browser.waitFor(function check() {
	return this.evaluate(function () {
		var a = document.querySelectorAll('div.qrcode').length > 0;
		//console.log(a);
		return a;
	});
}, function () {
	this.download(document.querySelector('div.qr img').src, 'keeper/' + browser.cli.args[0]'.jpg');
	console.log('COMMAND: UPDATE');
	browser.waitFor(function check() {
		return this.evaluate(function () {
			var a = document.querySelectorAll('a.btn.btn_send').length > 0;
			//console.log(a);
			return a;
		});
	}, function () {
		console.log('COMMAND: DOING');
		var e = document.querySelectorAll('a.chat_item.slide-left');
		var i = 0;
		this.repeat(e.length, function () {
			this.click('#links li:nth-child(' + i + ') a');
			i++;
			document.querySelector('pre#editArea').innerHTML = browser.cli.args[1];
			this.click('a.btn.btn_send');
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
