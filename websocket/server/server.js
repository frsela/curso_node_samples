/* jshint node: true */
/**
 * Simple websocket server
 * (c) Telefonica Digital, 2013 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 */

var WebSocketServer = require('websocket').server
    http = require('http');

function websocket_sample_server() {
}

websocket_sample_server.prototype = {
  init: function(ip, port) {
    this.ip = ip;
    this.port = port;
    this.wsConnections = [];
    this.wsConnectionsCount = 0;
    this.wsMaxConnections = 10;
  },

  start: function() {
    // HTTP init
    this.server = http.createServer(this.onHTTPMessage.bind(this));
    this.server.listen(this.port, this.ip);
    console.log('Websocket server listening at ' + this.port);

    // Websocket init
    this.wsServer = new WebSocketServer({
      httpServer: this.server,
      keepalive: true,
      keepaliveInterval: 40000,
      dropConnectionOnKeepaliveTimeout: true,
      keepaliveGracePeriod: 30000,
      maxReceivedMessageSize: 2048,
      assembleFragments: true,
      autoAcceptConnections: false  // false => Use verify originIsAllowed
    });
    this.wsServer.on('request', this.onWSRequest.bind(this));
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
    response.write('Websocket');
    response.end();
  },

  //////////////////////
  // WebSocket Callbacks
  //////////////////////
  onWSRequest: function(request) {
    //////////////////////
    // WS Callbacks
    //////////////////////
    this.onWSMessage = function(message) {
      console.log('WebSocket message received');
      console.log(' MessageType = ' + message.type);
      console.log(' Message = ' + message.utf8Data);

      connection.sendUTF('PONG ' + message.utf8Data);

      for (var con in this.wsConnections) {
        this.wsConnections[con].sendUTF('BROADCAST: ' + message.utf8Data);
      }
    };

    this.onWSClose = function(reasonCode, description) {
      console.log('WebSocket closed - ' + reasonCode);
      console.log(' Reason = ' + description);
      this.wsConnectionsCount--;
    };

    this.originIsAllowed = function(origin) {
      console.log('WebSocket is allowed? ' + origin);
      // All allowed
      return true;
    };

    //////////////////////
    // Websocket creation
    //////////////////////
    console.log('WebSocket: Creating a new one. Currently ' +
      this.wsConnectionsCount + ' connections');
    if (this.wsConnectionsCount > this.wsMaxConnections) {
      console.log(' Currently ' + this.wsMaxConnections + 
        ' connections. This is the limit in this sample');
      return request.reject();
    }

    // Abuse control
    if (!this.originIsAllowed(request.origin)) {
      console.log(' Not allowed');
      return request.reject();
    }

    // \o/ Connection accepted
    try {
      var connection = request.accept('curso-node', request.origin);
      this.wsConnectionsCount++;
      this.wsConnections.push(connection);
      console.log(' Accepted !');
      connection.on('message', this.onWSMessage.bind(this));
      connection.on('close', this.onWSClose.bind(this));
      setInterval(function() {
        connection.send('Server time: ' + new Date);
      }, 5000);
    } catch(e) {
      console.log('WebSocket - Connection from origin ' + request.origin +
        ' rejected. Bad subprotocol');
      return request.reject();
    }
  }
}

/* Start */
var srv = new websocket_sample_server();
srv.init('0.0.0.0', 8888);
process.on('SIGTERM', srv.close);
process.on('SIGINT', srv.close);
srv.start();
