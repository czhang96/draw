$(function(){
    
    var IO = {

        init : function(){
            //var url = "http://localhost:5000";
            var url = 'https://ancient-fjord-8441.herokuapp.com';
            IO.socket = io.connect(url);
            IO.bindEvents();

        },
        bindEvents: function(){
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated',IO.onNewGameCreated);
            IO.socket.on('playerJoinedRoom',IO.playerJoinedRoom);
            IO.socket.on('updatePlayerPlayers',IO.updatePlayerPlayers);
            IO.socket.on('newChatMessage',IO.newChatMessage);
        },
        onConnected: function(){
            App.mySocketId = IO.socket.socket.sessionid;
            console.log("bar");

        },
        onNewGameCreated: function(data){
            console.log("foobar");
            App.gameInit(data);

        },
        playerJoinedRoom: function(data){
            App.updatePlayers(data);
        },
        updatePlayerPlayers: function(data){
            App.updatePlayerScreen(data);
        },
        newChatMessage: function(data){
            App.updateChat(data);
        }

    }
    
    var App = {
        gameID:0,
        myRole: '',
        myName: '',
        mySocketID:'',
        players : [],
        init: function(){
            App.cacheElements();
            App.bindEvents();
        },
        cacheElements: function(){
            App.$doc = $(document);


        },
        bindEvents: function(){
            App.$doc.on('click','#create_room',App.onCreateClick);
            App.$doc.on('click','#join_room',App.onJoinRoom);
            App.$doc.on('click','#send_message',App.sendMessage);
        },
        onCreateClick: function(){
            data={playerName:$('#player_name').val() || 'anon'};
            IO.socket.emit('hostCreateNewGame',data);
        },
        gameInit: function(data){
            App.gameID=data.gameID;
            App.mySocketID=data.mySocketID;
            App.myRole='Host';
            App.myName=data.playerName;
            App.displayNewGameScreen(data);

        },
        displayNewGameScreen : function(data){
            $('#instructions').html("<h1>"+App.gameID+"</h1>")
            $('#players_waiting').append('<p>'+data.playerName+'</p>');
            App.players.push(data);
        },
        onJoinRoom: function(){
            var data = {gameID: $('#room_id').val(), 
                        playerName:$('#player_name').val() || 'anon'};
            IO.socket.emit('playerJoinGame',data);
            App.myRole = 'Player';
            App.myName=data.playerName;
            App.gameID=data.gameID;
        },
        updatePlayers: function(data){
            if (App.myRole == 'Host'){
                $('#instructions').html("<h1>"+App.gameID+"</h1>")
                $('#players_waiting').append('<p>'+data.playerName+'</p>');
                App.players.push(data);
                console.log(App.gameID);
                IO.socket.emit('updatePlayerPlayersServer',App.players);
            }
        },
        updatePlayerScreen: function(data){
            if (App.myRole == 'Player'){
                $('#instructions').html("<h1>"+App.gameID+"</h1>");
                $('#players_waiting').html("");
                for (var i = 0 ; i < data.length; i++){
                    $('#players_waiting').append('<p>'+data[i].playerName+'</p>');
                    App.players.push(data[i]);
                    console.log(JSON.stringify(App.players));           
                }
            }
        },
        sendMessage: function(){
            var data = { playerName:App.myName,message:$('#m').val(),gameID:App.gameID};
            IO.socket.emit('chatMessage',data);
            $('#m').val('');
        },
        updateChat: function(data){
            $('#messages').append($('<li>').text(data.playerName+": "+data.message));
        }
    }

    IO.init();
    App.init();



    

});