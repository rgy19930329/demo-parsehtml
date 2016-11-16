var io = require('socket.io')();
var cnutil = require('../self_modules/cnutil');
var Program = cnutil.catchnovel;

io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('catch', function(opts) {
        var obj = {
            bookId: opts.id,
            startChapter: opts.start
        };
        Program.snatchCallback = function(chapter, progress) {
            socket.emit('catching', {
                chapter: chapter,
                progress: progress
            });
        },
        Program.callback = function() {
            var book = this.getBook() + '.txt',
                url = '/download/' + encodeURIComponent(book);
            socket.emit('catchend', {
                book: book,
                url: url
            });
        };
        Program.reset();
        Program.run(obj);
    });

    socket.on('stop', function() {
        Program.stop();
    });

});

exports.register = function (server) {
    return io.listen(server);
};