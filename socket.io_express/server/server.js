/* jshint node: true */
/**
 * Simple websocket server
 * (c) Telefonica Digital, 2013 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 */

var SocketIOServer = require('socket.io'),
    express = require('express'),
    http = require('http');

function socketio_express_sample_server() {
}

socketio_express_sample_server.prototype = {
  init: function(ip, port) {
    this.ip = ip;
    this.port = port;
  },

  start: function() {
    // Express init
    var app = express();

    // HTTP init
    this.server = http.createServer(app);
    app.configure(function() {
      app.use(express.static(__dirname + '/public'));
      app.use(app.router);
    })

    app.get('/', function(req, res) {
      res.send('Hello');
    });

    this.server.listen(8888, '0.0.0.0');
    console.log('Express server listening at 8888');

    // Socket.IO init
    this.sioServer = SocketIOServer.listen(this.server);
    console.log('Socket.IO joined to express server');
    this.sioServer.on('connection', this.onSIOConnection);
  },

  close: function() {
    console.log('Bye');
    process.exit();
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
var srv = new socketio_express_sample_server();
srv.init('0.0.0.0', 8888);
process.on('SIGTERM', srv.close);
process.on('SIGINT', srv.close);
srv.start();
