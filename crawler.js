var LOG = require('./log.js');
var socketCrawler = function(socket){
    socket: socket,
    _open: function(){
        var spawn = require('child_process').spawn;
		var _this = this;
        var cspr = spawn('casperjs',['browser.js', uid, ad]);
        cspr.stdout.setEncoding('utf8');
        cspr.stdout.on('data', function(data){
			if(LOG.isJson(data)){
				var msg = LOG.parse(data);
				_this.socket.emit(msg.cmd, msg);
			}   
        });

        cspr.stderr.on('data', function(data){
            data += '';
            console.log(data.replace("\n", "\nstderr:"));
        });

        cspr.on('exit', function(code){
            console.log('child process exited with code'+code);
			//_this.socket = null;
            //process.exit(code);
        });
		return 
    }
    open: function(socket){
		var sc = new socketCrawler(socket);
        sc._open();
		return sc;
    }
}

module.exports = socketCrawler;