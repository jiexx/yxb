var LOG = require('./log.js');
var socketCrawler = /** @class */ (function () {
    function socketCrawler(socket) {
        this.socket = socket;
    }
    socketCrawler.prototype.open = function (data) {
        var spawn = require('child_process').spawn;
        var _this = this;
        var cspr = spawn('casperjs', ['browser.js', uid, ad]);
        cspr.stdout.setEncoding('utf8');
        cspr.stdout.on('data', function (data) {
            if (LOG.isJson(data)) {
                var msg = LOG.parse(data);
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
    };
    return socketCrawler;
}());
var sc = new socketCrawler(o);

module.exports = socketCrawler;