var express = require('express');

var app = express();
var http = require('http');
var server = http.createServer(app)
var io = require('socket.io').listen(server);
var game = require('./agxgame');
// var static = require('node-static');
// var fileServer = new static.Server

server.listen(process.env.PORT || 5000);

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.sendfile('index.html');
});
//
io.on('connection', function(socket){

	game.initGame(io,socket);
    // socket.on('mousemove', function (data) {

    //     // This line sends the event (broadcasts it)
    //     // to everyone except the originating client.
    //     socket.broadcast.emit('moving', data);
    //     console.log("foooobar");
    // });

});



