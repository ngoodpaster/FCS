'use strict';

var myFireId;
var calleeFireId = prompt("enter the callee's id", "theirId");
console.log("myId: " + myFireId + " ; calleeFireId: " + calleeFireId);

var counter = 0; //this was used to create new html objects (appended to id to create unique id)
var isChannelReady = false;
var isInitiator = false;
//var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var remoteStreams = [];
var inCall = false;
var connectedClients = [];
var myInfo;
var calleeId = null;
var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

var socket = io.connect();;
var room;

var localVideo;
var remoteVideo;
var videos;

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};


$.get('https://localhost:8080/loadpersonnel', function(data){
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
callButton.addEventListener("click",callHandler);

//this will tell server to set up connections with everyone
var callAll = document.getElementById("callAllButton");
callAll.addEventListener("click",callAllHandler);
//function will initiate the connection to the other firefighter
function callHandler(){
	//THIS IS HOW IT WILL BE
	//var calleeId = document.getElementById("calleeFireId").innerHTML;

  	//THIS IS FOR TESTING PURPOSES
  	calleeId = calleeFireId;
  	console.log("callee Id: " + calleeId)

	if (!inCall){
	  	
	  	console.log("button clicked");
	  	//isChannelReady = true;
	  	inCall = true;
	  	socket.emit("calling", {calleeFireId:calleeId});
	} else {
		hangup()
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
	socket.emit('callAll');
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


socket.on('join', function (data){
  	var room = data.room;
  	console.log(data)
  	var users = data.connectedUsers;
  	connectedClients = [];
	for (var i = 0 ; i < users.length ; i++){
		if (users[i].username != myFireId){
			connectedClients[connectedClients.length] = users[i];
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
});

socket.on('call busy', function(calleeId){
	alert("Unfortunately, " + calleeId + " is not available at this time. Try again later.");
});

socket.on('incoming call', function(callIds, callToAll){
	console.log("incoming call from socket: " + callIds.callerId);
	if (inCall && !callToAll){
		socket.emit('in call', callIds);
	} else {
		
		if (inCall){
			hangup();
		}

		inCall = true;
		maybeStart();
		//obtaining local session description
		//var sessionDescription = pc.createOffer();
		pc.createOffer().then(function(sessionDescription){ return setLocalAndEmit(callIds, sessionDescription);}, handleCreateOfferError);
		//pc.setLocalDescription(sessionDescription);
	  	// console.log('set Local description to: ', sessionDescription.PromiseValue);  	
	  	// console.log('setting local description of type (should be offer): ' + sessionDescription.PromiseValue.type + '\nid: ' + id);
	  	//socket.emit('offer', sessionDescription, callIds);
  	}
});


socket.on('incoming offer', function(remoteDescription, callIds){
	console.log("received an offer")
	if (remoteDescription.type === 'offer'){
		maybeStart();
		//set remote streams description with the offer
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
	pc.setLocalDescription(sessionDescription);
	console.log('set Local description to: ', sessionDescription);  	
	console.log('setting local description of type: ' + sessionDescription.type + '\nid:');
	socket.emit(sessionDescription.type,sessionDescription,callIds)
}

socket.on('incoming answer', function(remoteDescription, callIds){
	console.log("received an answer")
	if (remoteDescription.type === 'answer'){
		//set the remote dewcription to be the answer
		console.log("setting remote description")
		console.log("should call handler for remote stream")
		pc.setRemoteDescription(new RTCSessionDescription(remoteDescription));
		//at this point the remote stream handlers should both be triggered
	}
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

socket.on('bye', function(id){
	if (inCall){
		handleRemoteHangup();
	}
});

////////////////////////////////////////////////

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

// This client receives a message
// socket.on('message', function(message) {
//   console.log('Client received message:', message);
//   if (message === 'got user media') {
//     console.log("some client got user media")
//     maybeStart();
//   } else if (message.type === 'offer') {
//     if (!isInitiator && !isStarted) {
//       maybeStart();
//     }
//     //received the offer, add it to the remote description
//     //once this is called, onaddstream event is sent, and handleremotestream is called by peer who sent offer
//     pc.setRemoteDescription(new RTCSessionDescription(message));
//     //generate an answer
//     doAnswer();
//   } else if (message.type === 'answer' && isStarted) {
//     pc.setRemoteDescription(new RTCSessionDescription(message));
//   } else if (message.type === 'candidate' && isStarted) {
//     var candidate = new RTCIceCandidate({
//       sdpMLineIndex: message.label,
//       candidate: message.candidate
//     });
//     pc.addIceCandidate(candidate);
//   } else if (message === 'bye' && isStarted) {
//     handleRemoteHangup();
//   }
// });


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getLocalStream(){
	localVideo = document.querySelector('#localVideo');
	remoteVideo = document.querySelector('#remoteVideo');
	videos = document.getElementById("videos");


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


function maybeStart() {
  console.log('>>>>>>> maybeStart() ', localStream, isChannelReady);
  if (typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    //isStarted = true;
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

window.onbeforeunload = function() {
  sendMessage('bye');
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
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
      candidate: event.candidate.candidate
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
	console.log('handling the remote stream, and enabling the local stream')
	localStream.getTracks()[0].enabled = true;//!localStream.getTracks()[0].enabled;
	console.log("local stream: " + localStream.getTracks()[0].enabled)
  	document.querySelector('#localVideo').srcObject = localStream;

	console.log('Remote stream added.');
  	remoteStream = event.stream;
	remoteVideo.srcObject = remoteStream;

	callButton.innerHTML = "End Call";	

/*
  var remoteStream = event.stream;
  remoteStreams.push(remoteStream);
  //remoteVideo.srcObject = remoteStream;
  var video = document.createElement("video");
  video.id = "remoteVideo" + counter++;
  video.srcObject = remoteStream;
  video.setAttribute("autoplay","");
  videos.appendChild(video);*/
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
	if (calleeId != null){
  		console.log('Hanging up.');
	  	stop();
  		socket.emit('bye', calleeId);
  		calleeId = null;
  		callButton.innerHTML = "Call";
	}
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  calleeId = null;
  callButton.innerHTML = "Call";
  //isInitiator = false;
}

function stop() {
  inCall = false;
  //isStarted = false;
  pc.close();
  pc = null;
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



//when a peer joins room, add their socketID to key/value array on server, have key be something specific to them (name gathered from html or something)
//when a peer wants to set up a connection, they send name to server, server grabs socketId, and emits message along with the socketId of the socket making the call to only that socket. That client then starts the peer connection, and sends the offer to the socket that called it, sending both it's own and that sockets IDs in the message to the server.
//THis will allow a ton of people to be inside the room, and each client can choose which socket they want to contact.
//For broadcast, will need to turn off audio for clients sending the offers, so that just the original caller can talk (otherwise he would get tons of responses at the same time)
//timestamp and id for each conversation


// TODO
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO


//need to link with the front end -> especially the part dealing with getting the id of the firefighter you want to chat with
//need to figure out how to end a call, and reset back to square one when that happens
//need to re-work through the call all implementation and check if it's correct
//MORE TESTING
//need to test with more than two devices







//So I was able to get the username from the login page 
//Now the only issue is asynchronous server calls. I need the first $.get to run all the way through before doing anything else
//I think I need to use callbacks in order to implement this

//AS A GETAROUND, I PUT ALL STANDALONE CODE INSIDE THE GET CALL SO THAT IT ALL HAPPENS WHEN IT RETURNS 
//^ BAd practice

//Also, it is being inserted into db, but when I do the load, it doesn't include it?????????????

