'use strict';

var address = "192.168.4.1";
/*
if (screen.width > 480){
	address = "localhost";
} else {
	// address = "172.20.72.2";
	address = "192.168.4.1";
}
*/

var myFireId;
var calleeFireId;// = prompt("enter the callee's id", "theirId");
console.log("myId: " + myFireId + " ; calleeFireId: " + calleeFireId);

var counter = 0; //this was used to create new html objects (appended to id to create unique id)
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
//var pc;
var pcs = new Map();
var remoteStream;
var turnReady;
var remoteStreams = [];
var inCall = false;
var connectedClients = [];
var myInfo;
//var calleeId = null;
var muteAll = false;
var broadcast = false;
var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};


var shouldStop = false;
var stopped = true;
var options;
var recordedChunks;
var mediaRecorder;

var socket = io.connect();
var room;

// var localVideo;
// var remoteVideo;
// var videos;
var	localVideo = document.querySelector('#localVideo');
var	remoteVideo = document.querySelector('#remoteVideo');
var	videos = document.getElementById("videos");


// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

//load active personnel from server
$.get('https://' + address + ':8080/loadpersonnel', function(data){
	console.log(data);
	myFireId = data.username;
	var users = data.users;
	for (var i = 0 ; i < users.length ; i++){
		if (users[i].username == myFireId){
			myInfo = users[i];
		} else {
			connectedClients[connectedClients.length] = users[i];
		}
	}
	console.log(connectedClients);
	connectToServer();
	getLocalStream();
});

//connect to socket room
function connectToServer(){
	room = 'foo';
	// Could prompt for room name:
	// room = prompt('Enter room name:');

	//socket = io.connect();

	//while (myFireId == null){console.log("waiting")}

	if (room !== '') {
	  socket.emit('create or join', myFireId);
	  console.log('Attempted to create or  join room', room);
	}
}
	// localVideo = document.querySelector('#localVideo');
	// remoteVideo = document.querySelector('#remoteVideo');
	// videos = document.getElementById("videos");

	// console.log("about to get user media")
	// navigator.mediaDevices.getUserMedia({
	//   audio: true,
	//   video: false
	// })
	// .then(gotStream)
	// .catch(function(e) {
	//   alert('getUserMedia() error: ' + e.name);
	// });



//this needs to go in js code for interface
var callButton = document.getElementById("callButton");
//callButton.addEventListener("click",callHandler);

//this will tell server to set up connections with everyone
//var callAll = document.getElementById("callAllButton");
//callAll.addEventListener("click",callAllHandler);
//function will initiate the connection to the other firefighter
function callHandler(username){
	console.log("call button clicked");
	//THIS IS HOW IT WILL BE
	//var calleeId = document.getElementById("calleeFireId").innerHTML;

  	//THIS IS FOR TESTING PURPOSES
  	//calleeId = username;
  	//console.log("callee Id: " + calleeId);
  	muteAll = false;
	if (!inCall){
	  	
	  	console.log("button clicked");
	  	//isChannelReady = true;
	  	//cant set inCall here (in case the other client is already in a call)
	  	//inCall = true;
	  	socket.emit("calling", {calleeFireId:username, callerFireId:myInfo.username});
	} else {
		hangup();
	}

	//MOVE THIS INTO THE HANDLER FOR REMOTE STREAM ADDED/REMOVED

 //  	localStream.getTracks()[0].enabled = !localStream.getTracks()[0].enabled;
	// console.log("stream: " + localStream.getTracks()[0].enabled)
 //  	document.querySelector('#localVideo').srcObject = localStream;
 //  	if (localStream.getTracks()[0].enabled)
	//     callButton.innerHTML = "End Call";
 //  	else
	//     callButton.innerHTML = "Call";
};

function callAllHandler(){
	muteAll = true;
	if (!inCall){
		socket.emit('callAll', myInfo.username);
	} else {
		hangup();
	}

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var room = 'foo';
// // Could prompt for room name:
// // room = prompt('Enter room name:');

// var socket = io.connect();

// //while (myFireId == null){console.log("waiting")}

// if (room !== '') {
//   socket.emit('create or join', myFireId);
//   console.log('Attempted to create or  join room', room);
// }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//No Longer Used
socket.on('created', function(room) {
  console.log('Created room ' + room);
  isChannelReady = true;
//  isInitiator = true;
});

//when someone else has joined the room
socket.on('join', function (data){
  	var room = data.room;
  	console.log(data);
  	var users = data.connectedUsers;
  	connectedClients = [];

	$("#team").empty();

	groupTemplate();
	for (var i = 0 ; i < users.length ; i++){
		if (users[i].username != myFireId){
			connectedClients[connectedClients.length] = users[i];
			memberTemplate(users[i]);
		}
	}


	console.log("connected clients: " + connectedClients.length);
	console.log(connectedClients);
	
	console.log('Another peer made a request to join room ' + room);
	//console.log('This peer is the initiator of room ' + room + '!');
  	//isChannelReady = true;
});


socket.on('joined', function(data) {
  	console.log('joined: ' + data.room);
  	isChannelReady = true;
  	var room = data.room;
  	console.log(data);
  	var users = data.connectedUsers;
  	connectedClients = [];

	$("#team").empty();
	
	groupTemplate();
	for (var i =  0 ; i < users.length ; i++){
		if (users[i].username != myFireId){
			connectedClients[connectedClients.length] = users[i];
			memberTemplate(users[i])
		}
	}
});

socket.on('callee busy', function(calleeId){
	alert("Unfortunately, " + calleeId + " is not available at this time. Try again later.");
});

//callee runs this code
socket.on('incoming call', function(callIds, callToAll){
	console.log("incoming call from socket: " + callIds.callerId);
	
	if (inCall && !callToAll){
		socket.emit('in call', callIds);
	} else {
		//calleeId = callIds.callerUsername;
		muteAll = false;	
		if (inCall){
			hangup();
		}
		if (callToAll){
			broadcast = true;
		}
		// inCall = true;
		var pcId = callIds.callerUsername;
		maybeStart(pcId);
		//obtaining local session description
		//var sessionDescription = pc.createOffer();
		var pc = pcs.get(pcId)
		pc.createOffer().then(function(sessionDescription){ return setLocalAndEmit(callIds, sessionDescription);}, handleCreateOfferError);
		//pc.setLocalDescription(sessionDescription);
	  	// console.log('set Local description to: ', sessionDescription.PromiseValue);  	
	  	// console.log('setting local description of type (should be offer): ' + sessionDescription.PromiseValue.type + '\nid: ' + id);
	  	//socket.emit('offer', sessionDescription, callIds);
  	}
});

//caller runs this code
socket.on('incoming offer', function(remoteDescription, callIds){
	console.log("received an offer")
	if (remoteDescription.type === 'offer'){
		//inCall = true;
		var pcId = callIds.calleeUsername;
		maybeStart(pcId);
		//set remote streams description with the offer
		var pc = pcs.get(pcId)
    	pc.setRemoteDescription(new RTCSessionDescription(remoteDescription));
    	//create local description
		// var sessionDescription = pc.createAnswer();
		pc.createAnswer().then(function(sessionDescription){ return setLocalAndEmit(callIds,sessionDescription);}, onCreateSessionDescriptionError);
		// pc.setLocalDescription(sessionDescription);
		// console.log('set Local description', sessionDescription);
  // 		console.log('setting local description of type (should be answer): ' + sessionDescription.type + '\nid: ' + id);
  // 		socket.emit('answer', sessionDescription, callIds);
  	}
});


function setLocalAndEmit(callIds,sessionDescription){
	console.log("callIds: " + callIds	)
	var pcId;
	console.log(sessionDescription.type)
	if (sessionDescription.type == "offer"){
		console.log("hey1");
		pcId = callIds.callerUsername;
	} else if (sessionDescription.type == "answer"){
		console.log("hey2");
		pcId = callIds.calleeUsername;
	}
	console.log("pcId: " + pcId);
	console.log("pcs:");
	console.log(pcs)
	
	pcs.forEach(function(value,key,map){
		console.log("key: " + key);
		console.log("value");
		console.log(value);
	});

	var pc = pcs.get(pcId);
	pc.setLocalDescription(sessionDescription);
	console.log('set Local description to: ', sessionDescription);  	
	console.log('setting local description of type: ' + sessionDescription.type + '\nid:');
	socket.emit(sessionDescription.type,sessionDescription,callIds)
}

//callee runs this code
socket.on('incoming answer', function(remoteDescription, callIds){
	console.log("received an answer")
	if (remoteDescription.type === 'answer'){
		//inCall = true;

		//set the remote dewcription to be the answer
		console.log("setting remote description")
		console.log("should call handler for remote stream")
		var pcId = callIds.callerUsername;
		var pc = pcs.get(pcId);
		pc.setRemoteDescription(new RTCSessionDescription(remoteDescription));
		//at this point the remote stream handlers should both be triggered
	}
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

socket.on('bye', function(pcId){
	if (inCall){
		handleRemoteHangup(pcId);
	}
});

socket.on('left',function(data){
	if (data.fireId != myFireId){
		$("#" + data.fireId).remove();
	}

	connectedClients = data.connectedUsers;
});

////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

//This client receives a message
socket.on('message', function(message) {
  console.log('Client received message:', message);
  // if (message === 'got user media') {
  //   console.log("some client got user media")
  //   maybeStart();
  // } else if (message.type === 'offer') {
  //   if (!isInitiator ){//&& !isStarted) {
  //     maybeStart();
  //   }
  //   //received the offer, add it to the remote description
  //   //once this is called, onaddstream event is sent, and handleremotestream is called by peer who sent offer
  //   pc.setRemoteDescription(new RTCSessionDescription(message));
  //   //generate an answer
  //   doAnswer();
  // } else if (message.type === 'answer'){// && isStarted) {
  //   pc.setRemoteDescription(new RTCSessionDescription(message));
  // } else
  if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    var pcId = message.senderUsername;
    pcs.forEach(function(value,key,map){
    	value.addIceCandidate(candidate);
    });

  } 
  // else if (message === 'bye'){//} && isStarted) {
  //   handleRemoteHangup();
  // }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getLocalStream(){

	console.log("about to get user media")
	navigator.mediaDevices.getUserMedia({
	  audio: true,
	  video: false
	})
	.then(gotStream)
	.catch(function(e) {
	  alert('getUserMedia() error: ' + e.name);
	});
}
//
// function gotStream
//

function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  
  //at this point, the client has access to it's own media stream

  localStream.getTracks()[0].enabled = false;
  localVideo.srcObject = stream;
  
  

  /*
  //where the connection begins
  sendMessage('got user media');

  if (isInitiator) {
    console.log("I am initiator...inside gotStream...about to run maybeStart()")
    maybeStart();
  }
  */
}




//$("#capture-video-button").click(captureVideo);

function captureAudio(){
	if(stopped == false){
		shouldStop = true;
	} else if (stopped == true){
		//$( "#capture-video-button > span" ).removeClass( "glyphicon-facetime-video" ).addClass( "glyphicon-stop" );
		//stopped = false;
		handleSuccess(localStream);
	}
}

var blobToBase64 = function(blob, cb) {
  var reader = new FileReader();
  reader.onload = function() {
    var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
    cb(base64);
  };
  reader.readAsDataURL(blob);
};

function handleSuccess(stream) {
    options = {mimeType: 'audio/webm'};
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, options);
    console.log("im in here! handle success" + stream);
    shouldStop = false; 

    mediaRecorder.ondataavailable = function(e) {
      if (e.data.size > 0) {
      	console.log("data!");
        recordedChunks.push(e.data);
      }
      if(shouldStop === true && stopped === false) {
        mediaRecorder.stop();
        stopped = true;
      }
    };

    mediaRecorder.onstop = function(e) {
      console.log("stopping convo recording");
      var audio_blob = new Blob(recordedChunks, {type: 'audio/webm'});

      blobToBase64(audio_blob, function(base64){ // encode
      	
      	var to = $('#username').text();

        var update = {'blob': base64, 'to':to, 'from':myInfo.username};
        $.post('https://' + address + ':8080/storerecording', update,  function(data){
          console.log("success");
          
        });
      });  


      console.log(audio_blob);
      //$( "#capture-video-button > span" ).removeClass( "glyphicon-stop" ).addClass( "glyphicon-facetime-video" );
      stopped = true;
    };

    mediaRecorder.onstart = function(e){
    	stopped = false;
    }

    console.log(mediaRecorder);
    mediaRecorder.start(20);
    
};


//
//
//

var constraints = {
  video: true
};

console.log('Getting user media with constraints', constraints);

if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}


function maybeStart(pcId) {
  console.log('>>>>>>> maybeStart() ', localStream, isChannelReady);
  if (typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection(pcId, localStream);
    isStarted = true;
    // console.log('isInitiator', isInitiator);
    // if (isInitiator) {
    //   //creates and sends an offer
    //   doCall();
    // }
  }
}

//
//
//

window.onunload = window.onbeforeunload = function() {
	socket.emit("leaving", myFireId);
};


/////////////////////////////////////////////////////////

function createPeerConnection(pcId, localStream) {
  try {
    var pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    pc.addStream(localStream)
    console.log("About to add to pcs map.....pcId: " + pcId)
    pcs.set(pcId,pc);
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
      senderUsername: myInfo.username
    });
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}
/*
function doCall() {
  console.log("doing offer\nid:" + id);
  console.log('Sending offer to peer');
  var sessionDescription = pc.createOffer();
  return sessionDescription;
}
*/

/*
function doAnswer() {
  console.log("doing answer\nid:" + id);
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}
*/

/*
function setLocalAndSendMessage(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  //  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  console.log('setting local description of type: ' + sessionDescription.type + '\nid: ' + id);
  sendMessage(sessionDescription);
}
*/

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function requestTurn(turnURL) {
  var turnExists = false;
  for (var i in pcConfig.iceServers) {
    if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
      turnExists = true;
      turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turnURL);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pcConfig.iceServers.push({
          'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        turnReady = true;
      }
    };
    xhr.open('GET', turnURL, true);
    xhr.send();
  }
}


//CURRENTLY, THIS WORKS BY ADDING A VIDEO ELEMENT 
//TO THE HTML DOM WHEN A REMOTE STREAM IS ADDED

function handleRemoteStreamAdded(event) {
	inCall = true;
	console.log("remote stream added event")
	console.log(event)


	console.log('handling the remote stream, and enabling the local stream')
	console.log(localStream.getTracks())
	localStream.getTracks()[0].enabled = true;//!localStream.getTracks()[0].enabled;
	console.log("local stream: " + localStream.getTracks()[0].enabled)
  	document.querySelector('#localVideo').srcObject = localStream;

	console.log('Remote stream added:');
	console.log(event.stream)
	console.log('remote stream tracks')
	console.log(event.stream.getTracks())
	console.log("remote stream: " + event.stream.getTracks()[0].enabled)
  	
	remoteStream = event.stream;
	remoteStreams.push(remoteStream);
	
	if (!muteAll){
		console.log(remoteStream.getTracks()[0].enabled)
  		var video = document.createElement("video");
  		video.id = "remoteVideo" + counter++;
		video.width = 0;
		video.height = 0;
	 	video.srcObject = remoteStream;
  		video.setAttribute("autoplay","");	
	
  		/*if (muteAll){
  			video.setAttribute("muted","muted")
  		}*/

  		videos.appendChild(video);
	}

	var pcIter = pcs.keys();
        var pcId = pcIter.next().value;

	if ($("#mySidenav").width() != 0){
		console.log("mySidenav width = 0")
//		var pcIter = pcs.keys();
//		var pcId = pcIter.next().value;
		//openNav(pcId);
		closeNav();
	}
	openNav(pcId);
	
	$("#callButton").css("background-color","red");
	$("#callButton > span").html("End Call");

	if (broadcast){
		console.log("broadcasting")
		//var pcIter = pcs.keys();
		//var pcId = pcIter.next().value;
		$(pcId + "-name").text("Broadcast From: " + pcId);
	}

	captureAudio()

/*
  var remoteStream = event.stream;
  remoteStreams.push(remoteStream);
  //remoteVideo.srcObject = remoteStream;
  */
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
	console.log("hanging up")
	console.log("pcs connected to:");
	var temp = pcs;
	console.log(temp);
	while(pcs.size != 0){
		var pcIter = pcs.keys();
		var pcId = pcIter.next().value;
		console.log('Hanging up.');
	  	stop(pcId);
  		socket.emit('bye', pcId, myInfo.username);
  		//calleeId = null;
  		//callButton.innerHTML = "Call";
	}
}

function handleRemoteHangup(pcId) {
  console.log('Session terminated.');
  stop(pcId);
  //calleeId = null;
  //callButton.innerHTML = "Call";
  //isInitiator = false;
}

function stop(pcId) {
  	//isStarted = false;
  	captureAudio();
  	var pc = pcs.get(pcId)
  	pc.close();
  	pc = null;
  	pcs.delete(pcId)
	
	if (videos.childElementCount > 1){
		videos.removeChild(videos.lastChild)
	}

  	if (pcs.size == 0){
		$("#callButton").css("background-color","green");
		$("#callButton > span").html("Call");
		inCall = false;
  		
		/*$(".circle").unbind("click");
		$(".circle.member").click(function(){
			console.log("member clicked");
			openNav(this.id);
		});
		
		$("#call-all-logo").click(function(){
	                console.log("in click handler for call all"); 
        	        openNav("callAll");
        	});*/


	}
	

}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
  var sdpLines = sdp.split('\r\n');
  var mLineIndex;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('m=audio') !== -1) {
      mLineIndex = i;
      break;
    }
  }
  if (mLineIndex === null) {
    return sdp;
  }

  // If Opus is available, set it as the default in m line.
  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) {
        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex],
          opusPayload);
      }
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) { // Format of media starts from the fourth.
      newLine[index++] = payload; // Put target payload to the first.
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(' ');
  // Scan from end for the convenience of removing an item.
  for (var i = sdpLines.length - 1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}



///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

function memberTemplate(user){
	// Here is where we will need the socketid. We will make the socket id into the 
	// id for each member. In addition, we will have to search the database for the
	// team member to get the relevant information for them. We can also just load all 
	// the team data from the database and store it on the client side at the beginning so we don't have 
	// to worry about making a bunch of calls to the database
	console.log("creating memberTemplate");
	var container = $("<div> </div>").addClass("circle").addClass("member").attr("id", user.username).css("border-color", getRandomColor());
	container.append("<img src='/js/griffin.jpg' alt='firefighter' class='headshot' >")
	var desc = $("<p> </p>").attr("id", user.username + "-name").text(user.firstName);
	container.append(desc);
	$("#team").append(container);

	$("#" + user.username).click(function(){
		console.log("member pic clicked");
		openNav(this.id);
	});
}

function groupTemplate(){
	var container = $("<div> </div>").addClass("circle").addClass("member").attr("id", "call-all-logo").css("border-color", "black");
	container.append("<img src='/js/group.png' alt='firefighter' class='headshot' >")
	var desc = $("<p> </p>").text("All");
	container.append(desc);
	$("#team").append(container);

	$("#call-all-logo").click(function(){
	   	console.log("in click handler for call all"); 
		openNav("callAll");
	});
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function openNav(username) {
	console.log(username)
	var user = {};
	if (username == "callAll"){
		user.firstName = "All Firefighters";
	} else {
		for (var i = 0 ; i < connectedClients.length ; i++){
			if (connectedClients[i].username == username){
				user = connectedClients[i];
				break;
			}
		}
	}
	$("#mySidenav").css("width", "25vw");
    $("#team").css("width", "75vw");
    $("#username").text(username);
    $(".card-title").text(user.firstName);
	$("#callButton").css({"background-color" :"green", "color":"white"});
    
    $("#callButton").unbind('click');
	
	if (username == "callAll"){
	    $('.userAvatar').children('img').attr('src', '/js/group.png');
      	    $("#callButton").click(function(){
                callAllHandler();
 	    });
	} else {
            $('.userAvatar').children('img').attr('src', '/js/griffin.jpg');
            $("#callButton").click(function(){
    		callHandler($("#username").text());
    	    });
       }
}

function closeNav() {
    $("#mySidenav").css("width", "0");
    $("#team").css("width", "100vw");
    //document.getElementById("main").style.marginLeft= "0";
    document.body.style.backgroundColor = "white";
}








//when a peer joins room, add their socketID to key/value array on server, have key be something specific to them (name gathered from html or something)
//when a peer wants to set up a connection, they send name to server, server grabs socketId, and emits message along with the socketId of the socket making the call to only that socket. That client then starts the peer connection, and sends the offer to the socket that called it, sending both it's own and that sockets IDs in the message to the server.
//THis will allow a ton of people to be inside the room, and each client can choose which socket they want to contact.
//For broadcast, will need to turn off audio for clients sending the offers, so that just the original caller can talk (otherwise he would get tons of responses at the same time)
//timestamp and id for each conversation


//ok so now i am getting people to load and unload when they enter/leave









//NEXT TODO 
//work on fixing up the situation when someone calls someone who is already in a call
//implement a call all button

//move on to the recording side of things
//figure out the taking pictures side as well


//need to have an array of all the pcs as well (I keep overwriting the pc)
