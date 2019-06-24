var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
  user_name: String,
  channel_name: String,
  message: String
});

module.exports = mongoose.model('Message', messageSchema);
