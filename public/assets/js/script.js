$(function(){
    
    var IO = {

        init : function(){
            var url = "http://localhost:5000";
            //var url = 'https://draw-prototype.herokuapp.com/';
            //var url = 'https://ancient-fjord-8441.herokuapp.com';
            IO.socket = io.connect(url);
            IO.bindEvents();

        },
        bindEvents: function(){
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated',IO.onNewGameCreated);
            IO.socket.on('playerJoinedRoom',IO.onplayerJoinedRoom);
            IO.socket.on('updatePlayerPlayers',IO.updatePlayerPlayers);
            IO.socket.on('newChatMessage',IO.newChatMessage);
            IO.socket.on('prepareStartGame',IO.prepareStartGame);
            IO.socket.on('isMoving',IO.isMoving);
            IO.socket.on('gameEnded',IO.gameEnded);
            IO.socket.on('saveChatHistory', IO.saveChatHistory);
            IO.socket.on('startTimer', IO.startTimer);
            IO.socket.on('updateTimer', IO.updateTimer);
            IO.socket.on('updateUserPoints', IO.updateUserPoints);
            IO.socket.on('receiveNewColor', IO.receiveNewColor);
            IO.socket.on('receiveNewDrawThickness', IO.receiveNewDrawThickness);
        },
        onConnected: function(){
            App.mySocketID = IO.socket.socket.sessionid;

        },
        onNewGameCreated: function(data){
            App.gameInit(data);
        },
        onplayerJoinedRoom: function(data){
            App.updatePlayers(data);
        },
        updatePlayerPlayers: function(data){
            App.updatePlayerScreen(data);
        },
        newChatMessage: function(data){
            App.updateChat(data);
        },
        prepareStartGame: function(data){
            App.prepareStartGame(data);
        },
        isMoving: function(data){
            App.moving(data);
        },
        gameEnded: function(data){
            App.gameEnded(data);
        },
        saveChatHistory: function(data){
            chatHistory = data;
            //console.log(chatHistory);
        },
        startTimer: function(turnLength, start){
            App.startTimer(turnLength, start);
        },
        updateTimer: function(secs){
            App.updateTimer(secs);
        },
        updateUserPoints: function(data){
            App.updateUserPoints(data);
        },
        receiveNewColor: function(data){
            color = data;
        },
        receiveNewDrawThickness: function(data){
            drawThickness = data;
        }
    }
    var drawThickness = 1;
    var color = '#000';
    var ticker;
    var turnLength = 40;
    var firstCorrectAnswer = true;
    var turn = 0;
    var usersHistory = '';
    var pointsHistory = '';
    var chatHistory = '';
    var App = {
        gameID:0,
        myRole: '',
        myName: '',
        mySocketID:'',
        players : [],
        clients:{},
        word:"",
        gameRole: 'guess',
        gameState: 'lobby',
        init: function(){
            App.cacheElements();
            App.bindEvents();
        },
        cacheElements: function(){
            App.$doc = $(document);
            App.$chat_template = $('#chat_template').html();
            App.$game_area  = $('#game_area').html();
            App.$lobby = $('#lobby').html();
            App.$palette = $('#palette_template').html();
        },
        bindEvents: function(){
            App.$doc.on('click','#create_room',App.onCreateClick);
            App.$doc.on('click','#join_room',App.onJoinRoom);
            App.$doc.on('click','#send_message',App.sendMessage);
            App.$doc.on('click','#start_game',App.startGame);
            App.$doc.on('click','.palette-color',App.updateDrawColor);
            App.$doc.on('click','.palette-thickness',App.updateDrawThickness);
        },
        onCreateClick: function(){
            data={playerName:$('#player_name').val() || 'anon',
                  myPoints: 0,
                  hasAlreadyWon: false,
                  };
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
            $('#main_area').html(App.$lobby);
            $('#instructions').html("<h1>Game ID: "+App.gameID+"</h1><p>Give your friends this ID to join or this <a href='http://draw-prototype.herokuapp.com/g/"+App.gameID+"'>link</a></p><h1>Users</h1>");
            $('#room_number_header').html('Game ID: '+ App.gameID);
            $("#chat_area").html(App.$chat_template);
            $('#messages').append(chatHistory);
            App.$cont = $('#chat');
            $("#m").keyup(function(event){
                if(event.keyCode == 13){
                    $("#send_message").click();
                    
                }
            });

        
        },
        onJoinRoom: function(){
            //console.log('onjoinroom');
            var data = {gameID: $('#room_id').val(), 
                        playerName:$('#player_name').val() || 'anon',
                        myPoints: 0,
                        hasAlreadyWon: false,
                        };
            IO.socket.emit('playerJoinGame',data);
            App.myRole = 'Player';
            App.myName=data.playerName;
            App.gameID=data.gameID;
            App.myPoints=0;
            //console.log(data);
            
        },
        updatePlayers: function(data){
            if (App.myRole == 'Host'){
                $('#players_waiting').append('<p>'+data.playerName+'</p>');
                App.players.push(data);
                IO.socket.emit('updatePlayerPlayersServer',App.players);
            }
        },
        updatePlayerScreen: function(data){
            if (App.myRole == 'Player'){
                $('#main_area').html(App.$lobby);
                $("#chat_area").html(App.$chat_template);
                $('#messages').append(chatHistory);
                App.$cont = $('#chat');
                $("#m").keyup(function(event){
                    if(event.keyCode == 13){
                        $("#send_message").click();    
                    }
                });
                $('#players_waiting').html("");
                App.players = data;
                for (var i = 0 ; i < data.length; i++){
                    $('#players_waiting').append('<p>'+data[i].playerName+'</p>');
                }
            }
            var userList = "<li class='pure-menu-item'>Users</li>";
            var pointsList = "<li class='pure-menu-item'>Score</li>";
            for(var i = 0; i < data.length; i++){
                userList = userList + "<li id='user"+data[i].mySocketID+"' class='pure-menu-item'>"+data[i].playerName+"</li>";
                pointsList = pointsList + "<li id='"+data[i].mySocketID+"score' class='pure-menu-item'>"+data[i].myPoints+"</li>";
            }
            //console.log(data);
            //console.log(userList);
            //console.log(pointsList);
            $("#userlist").html(userList);
            $("#score").html(pointsList);
            usersHistory = userList;
            pointsHistory = pointsList;
            IO.socket.emit('updateUserList', data);
        },
        sendMessage: function(){
            var chat_message=$('#m').val();
            //console.log(chat_message);
            //console.log(App.word);
            //console.log('App.hasAlreadyWon = '+App.hasAlreadyWon);
            if (App.gameState == "playing" && chat_message.toUpperCase().indexOf(App.word) != -1 && App.gameRole != 'drawer' && !App.hasAlreadyWon){
                $("#drawer_word").html("You Guessed the Right Word: "+App.word);
                App.hasAlreadyWon = true;
                data= {name:App.myName, gameID:App.gameID, socketID:App.mySocketID};
                IO.socket.emit('givePoints',data);
                return;
            }
            if (App.gameState == "playing" && chat_message.toUpperCase().indexOf(App.word) != -1){
                return;
            }
            var data = { playerName:App.myName,message:chat_message,gameID:App.gameID};
            IO.socket.emit('chatMessage',data);
            $('#m').val('');
        },
        updateChat: function(data){
            $('#messages').append($('<li class="pure-menu-item">').text(data.playerName+": "+data.message));
            App.$cont[0].scrollTop = App.$cont[0].scrollHeight;
            App.$cont[0].scrollTop = App.$cont[0].scrollHeight;
            //console.log('chat data data');
            //console.log(data);
            IO.socket.emit('updateServerChatHistory', data, $('#messages').html());
        },
        startGame: function(){
            //console.log(App.gameID);
            IO.socket.emit('startDrawingTimer', App.gameID, turnLength, true);
            IO.socket.emit('startGame',App.gameID);
        },
        prepareStartGame: function(data){
            //console.log(App.players);
            //console.log(turn);
            App.hasAlreadyWon = false;
            firstCorrectAnswer = true;
            for(var i = 0; i < App.players.length; i++){
                App.players[i].hasAlreadyWon = false;
            }
            $("#palette_area").html('');
            $("#main_area").html(App.$game_area);
            $("#chat_area").html(App.$chat_template);
            $('#messages').append(chatHistory);
            $("#userlist").html(usersHistory);
            $("#score").html(pointsHistory);
            App.$cont = $('#chat');
            $("#m").keyup(function(event){
                if(event.keyCode == 13){
                    $("#send_message").click();
                    
                }
            });
            App.gameState = "playing";
            App.drawing = false;
            App.canvas = $('#paper');
            App.canvas[0].width=window.innerWidth;
            App.canvas[0].height=window.innerHeight;
            App.temp_canvas = $('#temp_canvas');
             window.addEventListener('resize',function(){
                App.temp_canvas[0].width = App.canvas[0].width;
                App.temp_canvas[0].height = App.canvas[0].height;
                App.temp_canvas[0].getContext('2d').drawImage(App.canvas[0],0,0);
                App.canvas[0].width=window.innerWidth;
                App.canvas[0].height=window.innerHeight;
                App.canvas[0].getContext('2d').drawImage(App.temp_canvas[0],0,0,App.temp_canvas[0].width,App.temp_canvas[0].height);
            },false);
            App.ctx = App.canvas[0].getContext('2d');
            App.clients = {};
            App.cursors = {};
            App.prev = {};
            App.lastEmit = $.now();
            App.hasAlreadyWon = false;
            App.gameRole = (App.mySocketID==App.players[turn].mySocketID?"drawer":"guesser");
            App.word=data.word;
            $("#current-word").html((App.gameRole=="drawer")?"Word: "+App.word:"");
            App.canvas.on('mousedown',function(e){
                App.ctx.beginPath();
                if(App.gameRole == "drawer"){
                    e.preventDefault();
                    App.drawing = true;
                    App.prev.x = e.pageX;
                    App.prev.y = e.pageY;
                }
            });
            App.$doc.bind('mouseup mouseleave',function(){
                App.drawing = false;
            });
            App.$doc.on('mousemove',function(e){
                if($.now() - App.lastEmit > 30 && App.gameRole == 'drawer'){
                    var moveData = {
                        'gameID': App.gameID,
                        'x': e.pageX,
                        'y': e.pageY,
                        'drawing': App.drawing,
                        'id': App.mySocketID
                    };

                    IO.socket.emit('mousemove',moveData);
                    App.lastEmit = $.now();
                }
                if(App.drawing){

                    App.drawLine(App.prev.x, App.prev.y, e.pageX, e.pageY);

                    App.prev.x = e.pageX;
                    App.prev.y = e.pageY;
                }
            });
            if(App.gameRole == "drawer"){
                //console.log("i am the drawer");
                //console.log(App.word);
                $("#palette_area").html(App.$palette);
                $("#your_role").html("You are the Drawer");
                $("#drawer_word").html("The Word is: "+App.word);

            }
            if(App.gameRole == "guesser"){
                var hint = '&nbsp;&nbsp;';
                for( var i = 0; i < App.word.length; i++){
                    //console.log(App.word[i]);
                    	if(App.word[i]==' '){
                            //console.log(true);
            			   hint = hint + '&nbsp;&nbsp;&nbsp;';
                        }
            			else
            			   hint = hint+'_ ';
                }
                $("#your_role").html("You are a Guesser");
                $("#drawer_word").html("Hint "+hint);
                //console.log("i am the guesser");
                //console.log("i dont know the word is"+ App.word);
            }
            $("#user"+App.players[turn].mySocketID).html(App.players[turn].playerName+' (drawer)');
            //console.log('bar');
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
            App.ctx.lineWidth = drawThickness;
            App.ctx.strokeStyle = color;
            App.ctx.lineTo(tox, toy);
            App.ctx.stroke();
        },
        gameEnded: function(data){
            //update points
            var userList = "<li class='pure-menu-item'>Users</li>";
            var pointsList = "<li class='pure-menu-item'>Score</li>";
            for(var i = 0; i < App.players.length; i++){
                userList = userList + "<li id='user"+App.players[i].mySocketID+"' class='pure-menu-item'>"+App.players[i].playerName+"</li>";
                pointsList = pointsList + "<li id='"+App.players[i].mySocketID+"score' class='pure-menu-item'>"+App.players[i].myPoints+"</li>";
            }
            usersHistory = userList;
            pointsHistory = pointsList;
            //console.log('all players list');
            //console.log(App.players);
            if(turn < App.players.length -1)
                turn++;
            else
                turn = 0;
            //console.log(chatHistory);
            App.gameState = "lobby";
            //console.log("i know who won");
            if(App.myRole == 'Host')
                IO.socket.emit('startGame',App.gameID);
            //console.log(chatHistory);
            // $("#main_area").html(App.$lobby);
            // $('#instructions').html("<h1>"+App.gameID+"</h1><h2>Winner: "+data+"</h2");
            for (var i  = 0 ; i < App.players.length ; i ++ ){
                //console.log(App.players);
                $('#players_waiting').append('<p>'+App.players[i].playerName+'</p>');
            }
        },
        startTimer: function(turnLength, start){
            if(App.myRole == 'Host'){
                if(!start){
                    clearInterval(ticker);
                }
                var timeInSecs = parseInt(turnLength);
                ticker = setInterval(function(){ tick(); }, 1000);
                function tick() {
                    var secs = timeInSecs;
                    if (secs>=0) {
                    timeInSecs--;
                    IO.socket.emit('broadcastTimer', App.gameID, secs);
                    //console.log('it is pushing to this room');
                    //console.log(data);
                    }
                    else {
                    //console.log('cleared?');
                    clearInterval(ticker);
                    App.startTimer(turnLength, true);
                    // stop counting at zero
                        // startTimer(60);  // remove forward slashes in front of startTimer to repeat if required
                    }
                }
            }
        //App.startTimer(turnLength, true);
        },
        updateTimer: function(secs){
            $('#timer').html(secs);  
            if(secs == 0){
                if(App.players[turn].hasAlreadyWon == false)
                    App.players[turn].myPoints -=2;
                App.gameEnded();
            }          
        },
        updateUserPoints: function(data){
            App.players[turn].myPoints +=1;
            App.players[turn].hasAlreadyWon = true;
            for(var i = 0; i < App.players.length; i++){
                if(App.players[i].mySocketID == data.socketID){
                    if(firstCorrectAnswer){
                        App.players[i].myPoints += 5;
                        firstCorrectAnswer = false;
                    }
                    else{
                        App.players[i].myPoints +=2;
                    }
                    App.players[i].hasAlreadyWon = true;
                    $("#user"+App.players[i].mySocketID).html(App.players[i].playerName+' (&#10004)');
                    $("#"+App.players[i].mySocketID+'score').html(App.players[i].myPoints);
                    $("#"+App.players[turn].mySocketID+'score').html(App.players[turn].myPoints);

                }
            }
            for(i = 0; i<App.players.length; i ++){
                if(App.players[i].hasAlreadyWon == false)
                    return;
            }
            if(App.myRole =='Host'){
                IO.socket.emit('startDrawingTimer', App.gameID, turnLength, false);
            }
            App.gameEnded();
        },
        updateDrawColor: function(){
            $(".palette-color").css("border-color", "#777");
            $(".palette-color").css("border-style", "solid");
            $(this).css("border-color", "#fff");
            $(this).css("border-style", "dashed");
            color = $(this).css("background-color");
            IO.socket.emit('broadcastNewColor',App.gameID, color);
        },
        updateDrawThickness: function(){
            $(".palette-thickness").css("background", "#979E71");
            $(this).css("background", "#ECF1E7");
            var drawThicknessId = $(this)[0].id;
            drawThickness = drawThicknessId.split("_")[0];
            IO.socket.emit('broadcastNewThickness',App.gameID, drawThickness);
        }
    }

    IO.init();
    App.init();



    

});
