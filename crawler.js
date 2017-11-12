var LOG = require('./log.js');
var os = require('os');
var child_process = require('child_process');
function socketCrawler(socket) {
	this.socket = socket;
	this.cspr = null;
	this.params = null;
}
socketCrawler.prototype.open = function (args) {
	this.params = args;
	var _this = this;
	var cspr = child_process.spawn('casperjs', ['browse.js', args.uid, args.ad]);
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
		console.log('child process exited with code ' + code);
		_this.close();
		if(_this.params) {
			_this.open(_this.params);
		}
		//_this.socket = null;
		//process.exit(code);
	});
	_this.cspr = cspr;
};
socketCrawler.prototype.close = function () {
	if(this.cspr) {
		if(os.platform() === 'win32') {
			child_process.exec('taskkill /pid '+this.cspr.pid+' /T /F');
		}else {
			this.cspr.kill('SIGINT');
		}
	}
};

module.exports = socketCrawler;