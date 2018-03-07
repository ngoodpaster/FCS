'use strict';

var https = require('https');
var fs = require('fs');
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');

// For an express server (also need to put css and js folders into public folder)

// var path = require('path');

// var express = require('express');
// var app = express();
// app.use(express.static('public'));
// app.get('/', function(req,res){
//   res.sendFile(path.join(__dirname + '/index.html'));
// });

var options = {
  key: fs.readFileSync('www_firefightercomm_com_ssl_cert/private-key.key'),
  cert: fs.readFileSync('www_firefightercomm_com_ssl_cert/www_firefightercomm_com.crt')
  //key: fs.readFileSync('server.key'),
  //cert: fs.readFileSync('server.crt')
};

var PORT = 8080;

//Create a server
var fileServer = new(nodeStatic.Server)();
var server = https.createServer(options, function(req, res) {
  fileServer.serve(req, res);
});

//create the express server
// var server = https.createServer(options,app);
 
//Start server
server.listen(PORT, function(){
  console.log("Server listening on: https://localhost:" + PORT);
});

//For http traffic
//var http = require('http');
//http.createServer(server).listen(80);


/*
var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8080);
*/


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

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? io.sockets.adapter.rooms[room].length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
    }else if (numClients === 3){ // max two clients
      socket.emit('full', room);
    }else {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    }
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