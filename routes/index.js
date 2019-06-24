var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.signedCookies.username !== undefined) {
    return res.redirect('/chat');
  }
  res.render('index', { title: 'Choose Username' });
});

/* POST user. */
router.post('/', [
  check('username').isString()
], async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('index', {
      title: 'Choose Username',
      invalidUsernameMessage: 'Invalid username'
    });
  }

  if (await User.exists({ name: req.body.username })) {
    return res.render('index', {
      title: 'Choose Username',
      invalidUsernameMessage: 'Non-unique username'
    });
  }

  User.create({
    name: req.body.username.trim(),
  }, function (err, user) {
    res.cookie('username', user.name, {
      maxAge: 2**31 - 1,
      signed: true
    });
    res.redirect('/chat');
  });
});

module.exports = router;
