console.log('Connecting...');
var socket = io.connect('http://localhost:8888');

socket.on('Greetings', function (data) {
  alert(JSON.stringify(data));
  setTimeout(function() {
    socket.emit('PingPong', "Hola");
  }, 5000);
});

socket.on('PingPong', function (data) {
  alert(data);
});

socket.on('Time', function (data) {
  console.log(data);
});
