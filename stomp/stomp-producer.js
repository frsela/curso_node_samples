#!/usr/bin/env node
/* jshint node: true */
/**
 * Simple STOMP producer
 * (c) Telefonica Digital, 2013 - All rights reserved
 * License: GNU Affero V3 (see LICENSE file)
 * Fernando Rodríguez Sela <frsela@tid.es>
 */

var stomp = require('stomp');

var num = process.argv[2];

// Set to true if you want a receipt of all messages sent.
var receipt = true;

// Set debug to true for more verbose output.
// login and passcode are optional (required by RabbitMQ)
var stomp_args = {
    port: 61613,
    host: '127.0.0.1',
    debug: false,
    login: 'guest',
    passcode: 'guest',
}

var client = new stomp.Stomp(stomp_args);

var queue = '/queue/messages';

client.connect();

client.on('connected', function() {
    num = num || 1000;
    for (var i = 0; i < num; i++) {
        client.send({
            'destination': queue,
            'body': 'Testing\n\ntesting1\n\ntesting2 ' + i,
            'persistent': 'false'
        }, receipt);
    }
    console.log('Produced ' + num + ' messages');
    client.disconnect();
});

client.on('receipt', function(receipt) {
    console.log("RECEIPT: " + receipt);
});

client.on('error', function(error_frame) {
    console.log(error_frame.body);
    client.disconnect();
});

process.on('SIGINT', function() {
    console.log('Produced ' + num + ' messages');
    client.disconnect();
    process.exit(0);
});

