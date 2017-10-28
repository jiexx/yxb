var fs = require('fs');

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var server = require('http').Server(app);
var ws = require('socket.io');
var io = new ws(3001);
var crawler = require("./crawler.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view options', {
    layout: false
});
app.use('/', express.static(__dirname + '/views'));
app.use('/keeper', express.static(__dirname + '/views'));
app.use('/qr', express.static(__dirname + '/qrcode'));

var server = app.listen(3000, function(){
    console.log("Listening on port %s...", server.address().port);
});

io.sockets.on('connection', function(socket) {
	console.log('NEW');
	var cs = null;
	socket.emit('NEW', { hello: 'world' });
    socket.on('OPEN', function (data) {
		console.log('OPEN '+data.uid);
        cs = new crawler(socket);
        cs.open(data);
    });
	socket.on('disconnect', function (data) {
		if(cs) {
			cs.close();
		}
	});
});

if(!fs.existsSync('./qrcode')){
	fs.mkdirSync('./qrcode');
}
if(!fs.existsSync('./keeper')){
	fs.mkdirSync('./keeper');
}
if(!fs.existsSync('./keeper/ad')){
	fs.mkdirSync('./keeper/ad');
}

var routes = require("./router.js")(app);
