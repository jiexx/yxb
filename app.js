var fs = require('fs');

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view options', {
    layout: false
});
app.use('/keeper', express.static(__dirname + '/keeper'));
app.use('/', express.static(__dirname + '/views'));

var server = app.listen(3000, function(){
    console.log("Listening on port %s...", server.address().port);
});

io.sockets.on('connection', function(socket) {
	socket.emit('NEW', { hello: 'world' });
    socket.on('OPEN', function (data) {
        var crawler = require("./crawler.js")(socket);
        crawler.open(data.uid, data.ad);
    });
});

var routes = require("./router.js")(app);
