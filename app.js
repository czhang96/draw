/* 
	- No win check unless game started

-*/

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

app.get('/', function(req, res) {
  res.sendfile('index.html');
});
app.get('/1', function(req, res) {
  res.sendfile('index1.html');
});
// app.get('/:id', function(req,res) {
//   if (req.params.id=="foo"){
//   	res.sendfile('index.html');
//   }
// });
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



