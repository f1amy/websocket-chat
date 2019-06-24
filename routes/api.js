var express = require('express');
var router = express.Router();
var Channel = require('../models/channel');

/* GET chat listing. */

router.get('/channels', function(req, res, next) {
  Channel.find({}, 'name', function (err, channels) {
    if (err) throw err;
    res.json(channels);
  });
});

module.exports = router;
