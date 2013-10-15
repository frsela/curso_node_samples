/* jshint node: true */
/**
 * Simple AMQP producer
 * (c) Telefonica Digital, 2013 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 */

var amqp = require('amqp');

var amqp_producer = {
  init: function() {
    this.host = 'localhost';
    this.port = 5672; //AMQP default port
    this.login = 'guest';
    this.password = 'guest';
  },

  connect: function(onConnected) {
    this.conn = amqp.createConnection({
      port: this.port,
      host: this.host,
      login: this.login,
      password: this.password
    });

    // Events for this connection
    this.conn.on('ready', (function() {
      console.log('connection.ready --> Connected to one Message Broker');
      onConnected();
    }).bind(this));

    this.conn.on('close', (function() {
      console.log('connection --> one message broker disconnected!!!');
    }).bind(this));

    this.conn.on('error', (function(error) {
      console.log('connection.onerror --> There was an error in one of the connections: ' + error);
    }).bind(this));
  },

  push: function(queueName, body) {
    console.log('push --> Sending to the queue ' + queueName + ' the package: ' + JSON.stringify(body));
    // We'll send the body into different formats. See consumer results !
    this.conn.publish(queueName, body);                         // Sends a raw string
    this.conn.publish(queueName, JSON.stringify({msg0: body})); // Sends an object stringified
    this.conn.publish(queueName, {msg1: body});                 // Sends a JSON object
  },

  start: function(num) {
    for (var i = 0; i < num; i++) {
      this.push('messages', 'AMQP message number: ' + i);
    }
  }
};

amqp_producer.init();

amqp_producer.connect(function () {
  amqp_producer.start(1000);
});
