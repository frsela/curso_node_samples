#!/usr/bin/env node
/* jshint node: true */
/**
 * Simple STOMP consumer
 * (c) Telefonica Digital, 2013 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 */

var sys = require('util');
var stomp = require('stomp');

// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
var stomp_args = {
    port: 61613,
    host: 'localhost',
    debug: true,
    login: 'guest',
    passcode: 'guest',
};

var client = new stomp.Stomp(stomp_args);

// 'activemq.prefetchSize' is optional.
// Specified number will 'fetch' that many messages and dump it to the client.
var headers = {
    destination: '/queue/messages',
    ack: 'client',
//  activemq.prefetchSize: '10'
};

var messages = 0;

client.connect();

client.on('connected', function() {
    client.subscribe(headers);
    console.log('Connected');
});

client.on('message', function(message) {
    console.log("\n--8<----8<----8<----8<----8<----8<----8<----8<----8<--\n");
    console.log("HEADERS: " + sys.inspect(message.headers));
    console.log("BODY: " + message.body);
    console.log("Got message: " + message.headers['message-id']);
    console.log("\n--8<----8<----8<----8<----8<----8<----8<----8<----8<--\n");
    client.ack(message.headers['message-id']);
    messages++;
});

client.on('error', function(error_frame) {
    console.log(error_frame.body);
    client.disconnect();
});

process.on('SIGINT', function() {
    console.log('\nConsumed ' + messages + ' messages');
    client.disconnect();
});

