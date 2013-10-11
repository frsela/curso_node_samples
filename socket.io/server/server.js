/* jshint node: true */
/**
 * Simple websocket server
 * (c) Telefonica Digital, 2013 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 */

var SocketIOServer = require('socket.io'),
    http = require('http');

function socketio_sample_server() {
}

socketio_sample_server.prototype = {
  init: function(ip, port) {
    this.ip = ip;
    this.port = port;
  },

  start: function() {
    // HTTP init
    this.server = http.createServer(this.onHTTPMessage.bind(this));
    this.server.listen(this.port, this.ip);
    console.log('Socket.IO server listening at ' + this.port);

    // Socket.IO init
    this.sioServer = SocketIOServer.listen(this.server);
    this.sioServer.on('connection', this.onSIOConnection);
  },

  close: function() {
    console.log('Bye');
    process.exit();
  },

  //////////////////////
  // HTTP Callback
  //////////////////////
  onHTTPMessage: function(request, response) {
    console.log('HTTP message received - ' + request.url);
    response.setHeader('Content-Type', 'text/html');
    response.statusCode = 200;
    response.write('This is a sample server. HTTP response');
    response.end();
  },

  //////////////////////
  // Socket.IO Callbacks
  //////////////////////
  onSIOConnection: function(socket) {
    //////////////////////
    // S.IO Callbacks
    //////////////////////
    

    //////////////////////
    // S.IO Connection
    //////////////////////
    socket.emit('Greetings', {
      hello: 'HELLO',
      pid: process.pid
    });
    socket.on('PingPong', function onSIOPingPong(data) {
      console.log('Socket.IO message received');
      console.log(' MessageType = ' + 'PingPong');
      console.log(' Message = ' + data);

      socket.emit('PingPong', 'PONG ' + data);
    });
    setInterval(function() {
      socket.emit('Time', new Date());
    }, 5000);
  }
}

/* Start */
var srv = new socketio_sample_server();
srv.init('0.0.0.0', 8888);
process.on('SIGTERM', srv.close);
process.on('SIGINT', srv.close);
srv.start();
