var express = require('express');
var router = express.Router();
var cnutil = require('../self_modules/cnutil');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/book/:id', function(req, res, next) {
  var sid = req.params.id;
  cnutil.catchnovel(function() {
      res.render('book', {
          title: 'Express',
          bookId: sid
      });
  });
});

module.exports = router;
