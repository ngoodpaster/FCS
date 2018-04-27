'use strict';

var https = require('https');
var fs = require('fs');
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var session = require("express-session");


var express = require('express');
var app = express();
app.use(express.static('public'));
app.use(session({secret: 'somesecret'}));
app.use(bodyParser());

var connectedUsers = []

var sess;

var options = {
  key: fs.readFileSync('www_firefightercomm_com_ssl_cert/private-key.key'),
  cert: fs.readFileSync('www_firefightercomm_com_ssl_cert/www_firefightercomm_com.crt')
  //key: fs.readFileSync('server.key'),
  //cert: fs.readFileSync('server.crt')
};

var currSockets = new Map();
var PORT = 8080;
var room = 'foo';

//Create a server
//var fileServer = new(nodeStatic.Server)();
//var server = https.createServer(options, function(req, res) {
//  fileServer.serve(req, res);
//});

app.get('/', function(req,res){
  //res.sendFile(path.join(__dirname + '/index.html'));
  res.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/personnel', function(req,res){
  sess = req.session;

  var fireId = req.query.username;

  
  console.log(fireId)
  //res.sendFile(path.join(__dirname + '/index.html'));
  console.log("loading index.html")
  res.sendFile(path.join(__dirname + '/personnel.html'));
});



var server = https.createServer(options,app);
 
//Start server
server.listen(PORT, function(){
  console.log("Server listening on: https://localhost:" + PORT);
});

var http = require('http');
http.createServer(app).listen(80);

/*
var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8080);
*/


var mongoUrl = "mongodb://localhost:27017";

var users = [];
loadUsers();

function loadUsers(){
  //users = [];
  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db("firefightercomm");
    dbo.collection("personnel").find({},{_id:0}).toArray(function(err,res){
      if (err) throw err;
      console.log(res);
      users = res;
      console.log(users);
      db.close();
    });
  });
  console.log(users)
}

function addConnectedUser(username){
  for (var i = 0 ; i < users.length ; i++){
    if (users[i].username == username){
      connectedUsers[connectedUsers.length] = users[i];
      break;
    }  
  }
}

function removeConnectedUser(username){
  for (var i = 0 ; i < connectedUsers.length ; i++){
    if (connectedUsers[i].username == username){
      connectedUsers[i] = connectedUsers[connectedUsers.length - 1];
      connectedUsers.splice(-1,1);
    }
  }
}

app.get('/loadpersonnel', function(req,res){
  sess = req.session;
  if (sess.username){
    console.log("HELL YEAH")
  }
  console.log("USERS:")
  //var connectedUsers = [];
  
  loadUsers();
  
  // for (var i = 0; i < users.length ; i++){
  //   if (currSockets.get(users[i].username)){
  //     connectedUsers[connectedUsers.length] = users[i];
  //   }
  // }
  console.log(connectedUsers)
  //res.send(connectedUsers)  
  res.send({username:sess.username,users:connectedUsers})
});

app.post('/validatelogin', function(req,res){
  sess = req.session;
  var user = req.body;

  console.log(user);

  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db("firefightercomm");
    dbo.collection("personnel").find({username:user.username}).toArray(function(err,result){
      if (err) throw err;
      if (result.length === 1){
        if (result[0].password === user.password){
          sess.username = user.username;
          addConnectedUser(user.username);
          res.end('success');
        } else {
          res.end('fail');
        }
      } else {
        res.end('fail');
      }
    });
  });  


});


app.post('/createaccount', function(req,res){
  sess = req.session;
  var user = req.body;
  
  console.log(user)

  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db("firefightercomm");
    dbo.collection("personnel").insertOne(user, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });

  loadUsers();
  addConnectedUser(user.username);

  sess.username = user.username;
  res.end('done');

});

var io = socketIO.listen(server);
io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  //message will include the fireId of who they want to connect with
  socket.on('calling', function(message){
    //message has a field called calleeFireId, grab the socketId from currSockets using that as the key
    var callee = currSockets.get(message.calleeFireId);
    //setting callToAll variable to false tells the receiving client that this is just a 2 way connection.
    var callToAll = false;
    //send message with the socket id of who wanted to connect with it
    io.to(callee).emit('incoming call',{'callerUsername':message.callerFireId, 'calleeUsername':message.calleeFireId, 'callerId':socket.id, 'calleeId':callee}, callToAll);
  });

  socket.on('offer', function(sessionDescription, callIds){
    //send offer back to caller
    io.to(callIds.callerId).emit('incoming offer', sessionDescription, callIds);
  });

  socket.on('answer', function(sessionDescription, callIds){
    //send answer back to callee
    io.to(callIds.calleeId).emit('incoming answer', sessionDescription, callIds);
  });

  socket.on('callAll', function(callerFireId){
    //call every socket
    currSockets.forEach(function(value,key,map){
      if (value != socket.id){
        var callToAll = true;
        io.to(value).emit('incoming call',{'callerUsername':callerFireId, 'calleeUsername':key, 'callerId':socket.id, 'calleeId':value}, callToAll);
      }
    });
  });

  socket.on('in call', function(callIds){
    io.to(callIds.callerId).emit('callee busy',callIds.calleeId);
  });

  socket.on('create or join', function(fireId) {
    log('Received request to create or join room ' + room + ' from socket: ' + socket.id + ' and fireID: ' + fireId);
    // add the current socket to the map of connected sockets
    currSockets.set(fireId,socket.id);
    //addConnectedUser(fireId);
    log('size of sockets array: ' + currSockets.size);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? io.sockets.adapter.rooms[room].length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('joined', {'room':room,'connectedUsers':connectedUsers});//'socketId':socket.id});
    }else {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', {'room':room,'connectedUsers':connectedUsers});
      socket.join(room);
      socket.emit('joined', {'room':room,'connectedUsers':connectedUsers});//'socketId':socket.id});
      io.sockets.in(room).emit('ready');
    }
  });

  socket.on('leaving', function(fireId){
    currSockets.delete(fireId);
    removeConnectedUser(fireId);
    io.sockets.in(room).emit('left',{'fireId':fireId, 'connectedUsers':connectedUsers});
  });

  socket.on('bye', function(toUsername, fromUsername){
    var callee = currSockets.get(toUsername);
    io.to(callee).emit('bye',fromUsername);
  });
  socket.on('broadcast', function(message) {
  	// emit broadcast message to all in the room
  	socket.broadcast.emit('broadcast');
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });
});