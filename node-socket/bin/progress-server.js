var io = require('socket.io')();

var num = 0;

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('start', function() {
        setInterval(function() {
            num++;
            io.emit('from', num);
        }, 1000);
    });

});

exports.register = function (server) {
    return io.listen(server);
};