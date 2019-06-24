var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  name: String
});

userSchema.statics.initUser = User => {
  var _users = [
    {
      name: 'admin'
    }
  ];

  User.remove({}, err => {
    _users.forEach(user => {
      User.create(user);
    });
  });
};

module.exports = mongoose.model('User', userSchema);
