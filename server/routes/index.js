var express = require('express');
var router = express.Router();
var cnutil = require('../self_modules/cnutil');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'Express'
	});
});

router.get('/book', function(req, res, next) {
	res.render('book', {
		title: 'Express'
	});
});

// 小说抓取
router.post('/catch', function(req, res, next) {
	var bid = req.body.id,
		start = req.body.start,
		opts = {
			bookId: bid,
			startChapter: start
		},
		Program = cnutil.catchnovel;

	Program.callback = function() {
		var book = this.getBook() + '.txt',
			url = '/download/' + encodeURIComponent(book);
		res.send({
			success: true,
			data: {
				book: book,
				url: url
			}
		});
	};
	Program.run(opts);
});

// 小说下载
router.get('/download/:book', function(req, res) {
	var book = req.params.book;
		book = decodeURIComponent(book);
	var	path = './data/' + book;
	res.download(path);
});

module.exports = router;
