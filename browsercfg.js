function browsercfg(csper) {
	var browser = csper.create({
			pageSettings : {
				loadImages : true,
				loadPlugins : true,
				javascriptEnabled : true,
				resourceTimeout : 50000,
				waitTimeout: 200000,
				retryTimeout: 100,
				webSecurityEnabled: false,
				userAgent : 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
			}
		});
	phantom.page.outputEncoding = "GBK";
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
	return browser;
}



module.exports = browsercfg;