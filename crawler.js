var LOG = require('./log.js');
function socketCrawler(socket) {
	this.socket = socket;
	this.cspr = null;
}
socketCrawler.prototype.open = function (args) {
	var spawn = require('child_process').spawn;
	var _this = this;
	var cspr = spawn('casperjs', ['browse.js', args.uid, args.ad]);
	cspr.stdout.setEncoding('utf8');
	cspr.stdout.on('data', function (data) {
		console.log('---------->'+data);
		if (LOG.isJson(data)) {
			var msg = LOG.parse(data);
			console.log(msg.cmd);
			_this.socket.emit(msg.cmd, msg);
		}
	});
	cspr.stderr.on('data', function (data) {
		data += '';
		console.log(data.replace("\n", "\nstderr:"));
	});
	cspr.on('exit', function (code) {
		console.log('child process exited with code' + code);
		//_this.socket = null;
		//process.exit(code);
	});
	_this.cspr = cspr;
};
socketCrawler.prototype.close = function () {
	if(this.cspr) {
		this.cspr.kill(this.cspr.pid, 'SIGHUP');
	}
};

module.exports = socketCrawler;