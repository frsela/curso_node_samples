/* jshint node: true */
/**
 * Simple AMQP consumer
 * (c) Telefonica Digital, 2013 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 */

var amqp = require('amqp');

var amqp_consumer = {
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

  start: function() {
    // Create a new queue (volatile)
    this.conn.queue("messages", {
      durable: false,
      autoDelete: true
    }, function(q) {
        console.log('Queue: Connected to the queue');
        q.bind('#');    // AMQP binding topics
        q.subscribe(function(message) {
          console.log('\n\nMessage received into this queue (RAW): ', message);
          console.log('Message received into this queue (stringify): ', JSON.stringify(message));
        });
    });
  }
};

amqp_consumer.init();

amqp_consumer.connect(function () {
  amqp_consumer.start();
});
