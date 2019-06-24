var mongoose = require("mongoose");

var channelSchema = new mongoose.Schema({
  name: String
});

channelSchema.statics.initChannel = Channel => {
  var _channels = [
    {
      name: 'general'
    },
    {
      name: 'other'
    }
  ];

  Channel.remove({}, err => {
    _channels.forEach(channel => {
      Channel.create(channel);
    });
  });
};

module.exports = mongoose.model('Channel', channelSchema);
