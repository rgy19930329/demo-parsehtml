var express = require('express');
var router = express.Router();
var cnutil = require('../self_modules/cnutil');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/book/:id', function(req, res, next) {
  var sid = req.params.id,
  	  opts = {
  	  	'bookId': sid,
  	  	'startChapter': '第一一二章藏不住了'
  	  };
  cnutil.catchnovel.callback = function() {
      res.render('book', {
          title: 'Express',
          bookId: sid
      });
  };
  cnutil.catchnovel.run(opts);
});

module.exports = router;
