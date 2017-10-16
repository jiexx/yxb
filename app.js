var fs = require('fs');

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var io = require('socket.io')(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

var server = app.listen(3000, function(){
    console.log("Listening on port %s...", server.address().port);
});

io.sockets.on('connection', function(socket) {
    socket.on('OPEN', function (data) {
        var crawler = require("./crawler.js")(socket);
        crawler.open();
    });
});

var routes = require("./routes.js")(app);
