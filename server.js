var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);



const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200
}

app.use(cors(corsOptions)) //CORS정책

//다른 디렉토리 파일 이용
app.use("/public/TemplateData",express.static(__dirname + "/public/TemplateData"));
app.use("/public/Build",express.static(__dirname + "/public/Build"));
app.use(express.static(__dirname+'/public'));

var clients			= [];// to storage clients
var clientLookup = {};// clients search engine
var sockets = {};//// to storage sockets

function getDistance(x1, y1, x2, y2){
    let y = x2 - x1;
    let x = y2 - y1;
    
    return Math.sqrt(x * x + y * y);
}


io.on('connection', function(socket){

  console.log('준비완료!');
  
  var currentUser;

  //C#스크립트의 EmitJoin 함수, _data는 유니티로부터 받은 데이터 덩어리
	socket.on('JOIN', function (_data)
	{
	
	    console.log('접속 시도!');
		
		var data = JSON.parse(_data);

        currentUser = {
			       name:data.name,
				   model:data.model,
                   posX:data.posX,
				   posY:data.posY,
				   posZ:data.posZ,
				   rotation:'0',
			       id:socket.id,
				   socketID:socket.id,
				   muteUsers:[],
				   muteAll:false,
				   isMute:true
				   };
					
		console.log(currentUser.name+'님께서 접속했습니다');
		
		clientLookup[currentUser.id] = currentUser;
		 
		sockets[currentUser.id] = socket;

		clients.push(currentUser);
		 
		
		
		//Unity환경에서 좌표, 유저 이름, 유저 위치 등 반영
		socket.emit("JOIN_SUCCESS",currentUser.id,currentUser.name,currentUser.posX,currentUser.posY,currentUser.posZ,data.model);
		
		//다른 플레이어 정보 반영
        clients.forEach( function(i) {
		    if(i.id!=currentUser.id)
			{ 
		      socket.emit('SPAWN_PLAYER',i.id,i.name,i.posX,i.posY,i.posZ,i.model);
			  
		    }
	   
	     });
		
		//모든 클라이언트에게 내 정보 반영
		socket.broadcast.emit('SPAWN_PLAYER',currentUser.id,currentUser.name,currentUser.posX,currentUser.posY,currentUser.posZ,data.model);
		
  
	});//END_SOCKET_ON
	
	
	//실시간 움직임 좌표 반영
	socket.on('MOVE_AND_ROTATE', function (_data)
	{
	  var data = JSON.parse(_data);	
	  
	  if(currentUser)
	  {
	
	   currentUser.posZ = data.posZ;
       currentUser.posX= data.posX;
	   currentUser.posY = data.posY;
	   
	   currentUser.rotation = data.rotation;
	  
       socket.broadcast.emit('UPDATE_MOVE_AND_ROTATE', currentUser.id,currentUser.posX,currentUser.posY,currentUser.posZ,currentUser.rotation);
	
      
       }
	});
	
	
	//애니메이션 반영
	socket.on('ANIMATION', function (_data)
	{
	  var data = JSON.parse(_data);	
	  
	  if(currentUser)
	  {
	   
	   currentUser.timeOut = 0;
	   
	  
       socket.broadcast.emit('UPDATE_PLAYER_ANIMATOR', currentUser.id,data.key,data.value,data.type);
	
	   
      }
	  
	});
	
	
socket.on('GET_USERS_LIST',function(pack){

   if(currentUser)
   {
        clients.forEach( function(i) {
		    if(i.id!=currentUser.id)
			{ 
		      socket.emit('UPDATE_USER_LIST',i.id,i.name,i.publicAddress);
			  
		    }
	   
	     });
   
   }
  

});


		
	//메세지 전송
	socket.on('MESSAGE', function (_data)
	{
		
		
	  var data = JSON.parse(_data);	
	  
	  
	  if(currentUser)
	  {
	   
       socket.emit('UPDATE_MESSAGE', currentUser.id,data.message);
       socket.broadcast.emit('UPDATE_MESSAGE', currentUser.id,data.message);
	
      
       }
	});
	


	
	

	socket.on('SEND_OPEN_CHAT_BOX', function (_data)
	{
	  var data = JSON.parse(_data);	
	  
	  if(currentUser)
	  {
	
       socket.emit('RECEIVE_OPEN_CHAT_BOX', currentUser.id,data.player_id);
	   
         clients.forEach( function(i) {
		    if(i.id==data.player_id)
			{ 
		      console.log("send to : "+i.name);
		      
		      sockets[i.id].emit('RECEIVE_OPEN_CHAT_BOX',currentUser.id,i.id);
			  
		    }
	   
	     });
	
      
       }
	});
	
	
	
 socket.on("VOICE", function (data) {
		
		var minDistanceToPlayer = 3;
		


  if(currentUser )
  {
   
   var newData = data.split(";");
   
    newData[0] = "data:audio/ogg;";
    newData = newData[0] + newData[1];

     
    clients.forEach(function(u) {
		
		var distance = getDistance(parseFloat(currentUser.posX), parseFloat(currentUser.posY),parseFloat(u.posX), parseFloat(u.posY))
		
		var muteUser = false;
		
		 for (var i = 0; i < currentUser.muteUsers.length; i++)
		 {
			if (currentUser.muteUsers[i].id == u.id) 
			{
				muteUser = true;

			};
		};
     
      if(sockets[u.id]&&u.id!= currentUser.id&&!currentUser.isMute&& distance < minDistanceToPlayer &&!muteUser &&! sockets[u.id].muteAll)
      {
		 sockets[u.id].emit('UPDATE_VOICE',newData);
		 
		
         sockets[u.id].broadcast.emit('SEND_USER_VOICE_INFO', currentUser.id);
	
      }
	  
    });
    
    

  }
 
});


	socket.on('disconnect', function ()
	{
     
	    if(currentUser)
		{
		 currentUser.isDead = true;
		 

		 socket.broadcast.emit('USER_DISCONNECTED', currentUser.id);
		
		
		 for (var i = 0; i < clients.length; i++)
		 {
			if (clients[i].name == currentUser.name && clients[i].id == currentUser.id) 
			{

				console.log(clients[i].name+"님이 나가셨습니다.");
				clients.splice(i,1);

			};
		};
		
		}
		
    });
		
});



http.listen(process.env.PORT ||3000, function(){
	console.log('listening on *:3000');
});
console.log("서버 실행중");