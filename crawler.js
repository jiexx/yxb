var socketCrawler = function(socket){
    socket: socket,
    _open: function(socket){
        var spawn = require('child_process').spawn;

        var cspr = spawn('casperjs',['browser.js']);
        cspr.stdout.setEncoding('utf8');
        cspr.stdout.on('data', function(data){
            var msg = JSON.parse(data);
            socket.emit(msg.cmd, msg);
        });

        cspr.stderr.on('data', function(data){
            data += '';
            console.log(data.replace("\n", "\nstderr:"));
        });

        cspr.on('exit', function(code){
            console.log('child process exited with code'+code);
            process.exit(code);
        });
    }
    open: function(){
        this._open(this.socket);
    }
}

module.exports = socketCrawler;