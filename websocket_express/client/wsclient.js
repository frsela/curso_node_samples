
function wsclient() {
  window._connections = [];
}

wsclient.prototype = {
  init: function() {
    var self = this;
    document.getElementById('new_connection').onclick = function() {
      self.newConnection();
    };
  },

  createConnectionDivs: function(id) {
    var _div = document.createElement('div');
    _div.id = 'connection_' + id;
    var _h1 = document.createElement('h1');
    _h1.innerHTML = 'Connection number ' + id;
    _div.appendChild(_h1);
    var _log = document.createElement('div');
    _log.id = 'log_' + id;
    _div.appendChild(_log);
    var _input = document.createElement('input');
    _input.id = 'input_' + id;
    _div.appendChild(_input);
    var _sendButton = document.createElement('button');
    _sendButton.id = 'sendButton_' + id;
    _sendButton.innerHTML = "Send message";
    _div.appendChild(_sendButton);
    var _closeButton = document.createElement('button');
    _closeButton.id = 'closeButton_' + id;
    _closeButton.innerHTML = "Close websocket";
    _div.appendChild(_closeButton);
    document.getElementById('connections').appendChild(_div);
  },

  webSocketLog: function(msg, id, type) {
    var target = document.getElementById('log_' + id);
    target.innerHTML += '<br /><span class="' + type + '">' + msg + '</span>';
  },
  webSocketMsgLog: function(msg, id) {
    this.webSocketLog('Received: ' + msg, id, 'message');
  },
  webSocketInfoLog: function(msg, id) {
    this.webSocketLog('Info: ' + msg, id, 'info');
  },
  webSocketErrorLog: function(msg, id) {
    this.webSocketLog(msg, id, 'error');
  },

  newConnection: function() {
    // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket?redirectlocale=en-US&redirectslug=WebSockets%2FWebSockets_reference%2FWebSocket
    window._connections.push(new WebSocket('ws://localhost:8888','curso-node'));
    var id = window._connections.length;

    this.createConnectionDivs(id);
    document.getElementById('sendButton_' + id).onclick = function() {
      window._connections[id-1].send(
        document.getElementById('input_' + id).value);
    };
    document.getElementById('closeButton_' + id).onclick = function() {
      window._connections[id-1].close();
    };

    var self = this;
    window._connections[id-1].onerror = function(event) {
      self.webSocketErrorLog(event, id);
    }
    window._connections[id-1].onopen = function(event) {
      self.webSocketInfoLog('WebSocket opened', id);
      self.webSocketInfoLog('Accepted protocol: ' +
        window._connections[id-1].protocol, id);
    }
    window._connections[id-1].onclose = function(event) {
      self.webSocketInfoLog('WebSocket closed code: ' + event.code, id);
      self.webSocketInfoLog('WebSocket closed reason: ' + event.reason, id);
      self.webSocketInfoLog('WebSocket closed cleanly: ' + event.wasClean, id);
    }
    window._connections[id-1].onmessage = function(event) {
      self.webSocketMsgLog(event.data, id);
    }
  }
};

(function() {
  var client = new wsclient();
  client.init();
})();