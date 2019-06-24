var express = require('express');
var router = express.Router();

/* GET chat listing. */

router.get('/', function(req, res, next) {
  if (req.signedCookies.username === undefined) {
    return res.redirect('/');
  }
  res.render('chat', { title: 'Websocket chat' });
});

module.exports = router;
