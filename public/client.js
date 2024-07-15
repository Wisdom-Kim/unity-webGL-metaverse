var socket = io() || {};
socket.isReady = false;
var account;

window.addEventListener('load', function() {
	
	socket.on('PONG', function(socket_id,msg) {
				      		
	  var currentUserAtr = socket_id+':'+msg;
	  
	 if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnPrintPongMsg', currentUserAtr);
		}
	  
	});

					      
	socket.on('JOIN_SUCCESS', function(id,name,posX,posY,posZ,model) {
				      		
	  var currentUserAtr = id+':'+name+':'+posX+':'+posY+':'+posZ+':'+model;
	  
	   if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnJoinGame', currentUserAtr);
		}
	  
	});
	
		
	socket.on('SPAWN_PLAYER', function(id,name,posX,posY,posZ,model) {
	
	    var currentUserAtr = id+':'+name+':'+posX+':'+posY+':'+posZ+':'+model;
		
		if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnSpawnPlayer', currentUserAtr);
		
		}
		
	});
	

	
    socket.on('UPDATE_MOVE_AND_ROTATE', function(id,posX,posY,posZ,rotation) {
		
	    var currentUserAtr = id+':'+posX+':'+posY+':'+posZ+':'+rotation;
		 	
		if(window.unityInstance!=null)
		{
		   window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateMoveAndRotate',currentUserAtr);
		}
		
	});
	
		socket.on('UPDATE_PLAYER_ANIMATOR', function(id,key,value,type) {
	
	     var currentUserAtr = id+':'+key+':'+value+':'+type;
		
		
		if(window.unityInstance!=null)
		{
				window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateAnim', currentUserAtr);
		
		}
		
	});
	
	
	socket.on('UPDATE_USER_LIST', function(id,name,publicAddress) {
	
	    var currentUserAtr = id+':'+name+':'+publicAddress;
		
		if(window.unityInstance!=null)
		{
		  window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateUsersList', currentUserAtr);
		
		}
		
	});
	
	 socket.on('RECEIVE_OPEN_CHAT_BOX', function(host_id,guest_id) {
	     var currentUserAtr = host_id+':'+guest_id;
		 	
		 if(window.unityInstance!=null)
		{
		   window.unityInstance.SendMessage ('NetworkManager', 'OnReceiveOpenChatBox',currentUserAtr);
		}
		
	});
	
	  socket.on('UPDATE_MESSAGE', function(id,message) {
	     var currentUserAtr = id+':'+message;
		 	
		 if(window.unityInstance!=null)
		{
		   window.unityInstance.SendMessage ('NetworkManager', 'OnReceiveMessage',currentUserAtr);
		}
		
	});
	
	
		socket.on('SEND_USER_VOICE_INFO', function(id) {
	     var currentUserAtr = id+':'+'';
		 	
		 if(window.unityInstance!=null)
		{
		   window.unityInstance.SendMessage ('NetworkManager', 'OnUpdateUserVoiceInfo',currentUserAtr);
		}
		
	});
	
	
	
	
		        
	socket.on('USER_DISCONNECTED', function(id) {
	
	     var currentUserAtr = id;
		 
		if(window.unityInstance!=null)
		{
		 window.unityInstance.SendMessage ('NetworkManager', 'OnUserDisconnected', currentUserAtr);
		}
	});

});



window.onload = (e) => {
	mainFunction(1000);
  };
  
  
  function mainFunction(time) {
  
  
	navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
	  var madiaRecorder = new MediaRecorder(stream);
	  madiaRecorder.start();
  
	  var audioChunks = [];
  
	  madiaRecorder.addEventListener("dataavailable", function (event) {
		audioChunks.push(event.data);
	  });
  
	  madiaRecorder.addEventListener("stop", function () {
		var audioBlob = new Blob(audioChunks);
  
		audioChunks = [];
  
		var fileReader = new FileReader();
		fileReader.readAsDataURL(audioBlob);
		fileReader.onloadend = function () {
   
  
		  var base64String = fileReader.result;
		  socket.emit("VOICE", base64String);
  
		};
  
		madiaRecorder.start();
  
  
		setTimeout(function () {
		  madiaRecorder.stop();
		}, time);
	  });
  
	  setTimeout(function () {
		madiaRecorder.stop();
	  }, time);
	});
  
  
   socket.on("UPDATE_VOICE", function (data) {
	  var audio = new Audio(data);
	  audio.play();
	});
	
	
  }

