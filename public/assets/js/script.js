$(function(){
    
    var IO = {

        init : function(){
            var url = "http://localhost:5000";
            //var url = 'https://ancient-fjord-8441.herokuapp.com';
            IO.socket = io.connect(url);
            IO.bindEvents();

        },
        bindEvents: function(){
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated',IO.onNewGameCreated);
            IO.socket.on('playerJoinedRoom',IO.playerJoinedRoom);
            IO.socket.on('updatePlayerPlayers',IO.updatePlayerPlayers);
            IO.socket.on('newChatMessage',IO.newChatMessage);
            IO.socket.on('prepareStartGame',IO.prepareStartGame);
            IO.socket.on('isMoving',IO.isMoving);
        },
        onConnected: function(){
            App.mySocketId = IO.socket.socket.sessionid;

        },
        onNewGameCreated: function(data){
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
        },
        prepareStartGame: function(){
            App.prepareStartGame();
        },
        isMoving: function(data){
            App.moving(data);
        }

    }
    
    var App = {
        gameID:0,
        myRole: '',
        myName: '',
        mySocketID:'',
        players : [],
        
        gameRole: 'guess',

        init: function(){
            App.cacheElements();
            App.bindEvents();
        },
        cacheElements: function(){
            App.$doc = $(document);
            App.$chat_template = $('#chat_template').html();
            App.$game_area  = $('#game_area').html();
        },
        bindEvents: function(){
            App.$doc.on('click','#create_room',App.onCreateClick);
            App.$doc.on('click','#join_room',App.onJoinRoom);
            App.$doc.on('click','#send_message',App.sendMessage);
            App.$doc.on('click','#start_game',App.startGame);



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
            $("#chat_area").html(App.$chat_template);
        },
        onJoinRoom: function(){
            var data = {gameID: $('#room_id').val(), 
                        playerName:$('#player_name').val() || 'anon'};
            IO.socket.emit('playerJoinGame',data);
            App.myRole = 'Player';
            App.myName=data.playerName;
            App.gameID=data.gameID;
            $("#chat_area").html(App.$chat_template);
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
        },
        startGame: function(){
            IO.socket.emit('startGame',App.gameID);
        },
        prepareStartGame: function(){
            console.log(App.$game_area);
            $("#main_area").html(App.$game_area);


            App.drawing = false;
            App.canvas = $('#paper');
            App.ctx = App.canvas[0].getContext('2d');
            App.clients = {};
            App.cursors = {};
            App.prev = {};
            App.lastEmit = $.now();

            App.canvas.on('mousedown',function(e){
                e.preventDefault();
                App.drawing = true;
                App.prev.x = e.pageX;
                App.prev.y = e.pageY;
            });
            App.$doc.bind('mouseup mouseleave',function(){
                App.drawing = false;
            });
            App.$doc.on('mousemove',function(e){
                if($.now() - App.lastEmit > 30){
                    var data = {
                        'gameID': App.gameID,
                        'x': e.pageX,
                        'y': e.pageY,
                        'drawing': App.drawing,
                        'id': App.mySocketId
                    };

                    IO.socket.emit('mousemove',data);
                    App.lastEmit = $.now();

                }

                if(App.drawing){

                    App.drawLine(App.prev.x, App.prev.y, e.pageX, e.pageY);

                    App.prev.x = e.pageX;
                    App.prev.y = e.pageY;
                }
            });
        },

        moving: function (data) {

            if(! (data.id in App.clients)){
                App.cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
            }
            App.cursors[data.id].css({
                'left' : data.x,
                'top' : data.y
            });
            if(data.drawing && App.clients[data.id]){

                App.drawLine(App.clients[data.id].x, App.clients[data.id].y, data.x, data.y);
            }
            App.clients[data.id] = data;
            App.clients[data.id].updated = $.now();
        },
        drawLine: function(fromx, fromy, tox, toy){
            App.ctx.moveTo(fromx, fromy);
            App.ctx.lineTo(tox, toy);
            App.ctx.stroke();
        }
    }

    IO.init();
    App.init();



    

});