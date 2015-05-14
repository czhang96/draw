var io;
var gameSocket;
var rooms = {};
var wordList=[];

exports.initGame = function(sio,socket,wordList){
	io = sio;
	gameSocket = socket;
    words=wordList;
	gameSocket.emit('connected', { message: "You are connected!" });
    // Host Events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('playerJoinGame',playerJoinGame);
    gameSocket.on('updatePlayerPlayersServer',updatePlayerPlayersServer);
    gameSocket.on('chatMessage',chatMessage);
    gameSocket.on('startGame',startGame);
    gameSocket.on('mousemove',mousemove);
    gameSocket.on('gameEnd',gameEnd);
    gameSocket.on('updateServerChatHistory',updateServerChatHistory);
    gameSocket.on('startDrawingTimer', startDrawingTimer);
}
function randomProperty(object) {
  var keys = Object.keys(object);
  return keys[Math.floor(keys.length * Math.random())];
};

function hostCreateNewGame(data){

	var gameID =  (Math.random()*100000) | 0 ;
	data.gameID = gameID;
	data.mySocketID = this.id;
	this.emit('newGameCreated',data);
	this.join(gameID.toString());
}
function playerJoinGame(data) {
   console.log('joined game');
    var sock = this;
    var room = gameSocket.manager.rooms["/" + data.gameID];
    var gameID = data.gameID;
    console.log(gameSocket.manager.rooms["/" + data.gameID]);
    if( room != undefined ){
        data.mySocketID = sock.id;
        sock.join(data.gameID);
        io.sockets.in(data.gameID).emit('playerJoinedRoom', data);

    } else {
        this.emit('error',{message: "This room does not exist."} );
    }
    if (rooms[gameID] == undefined){
        rooms[gameID] = "waiting";
    }
    console.log(rooms);
    if (rooms[gameID]=="playing"){
        this.emit('prepareStartGame',{id:"not_you",word:""});
    }
}
function updatePlayerPlayersServer(data) {
   	io.sockets.in(data[0].gameID).emit('updatePlayerPlayers',data);
}
function chatMessage(chat_data) {
   	io.sockets.in(chat_data.gameID).emit('newChatMessage',chat_data);
}
function startGame(data) {
    console.log(data);
    io.sockets.in(data).emit('prepareStartGame',
                            {id:io.sockets.clients(data)[Math.floor(io.sockets.clients(data).length * Math.random())].id,
                            word:words.arr[Math.floor(words.arr.length * Math.random())]});
    rooms[data] = "playing";
}
function mousemove(data){
    this.broadcast.to(data.gameID).emit('isMoving',data);
}
function gameEnd(data){
    //{winner_name}
    console.log(data);
    rooms[data.gameID]="waiting";
    io.sockets.in(data.gameID).emit('gameEnded',data.name);
}
function updateServerChatHistory(data, chat_history){
    io.sockets.in(data.gameID).emit('saveChatHistory',chat_history);
}
function startDrawingTimer(gameID){
    function startTimer(secs){
        var timeInSecs = parseInt(secs)-1;
        var ticker = setInterval(function(){ tick(); }, 1000);
        function tick() {
            var secs = timeInSecs;
            if (secs>=0) {
            timeInSecs--;
            io.sockets.in(gameID).emit('updateDrawingTimer',secs);
            }
            else {
            console.log('cleared?');
            stopTick(); // stop counting at zero
                // startTimer(60);  // remove forward slashes in front of startTimer to repeat if required
            }
        }
        function stopTick(){
            clearInterval(ticker);
        }
    }

    startTimer(5);

    
}