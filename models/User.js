const mongoose = require("mongoose");

const UserSchema = new mongooses.Schema({
  name: {
    type: String,
    required: True
  },
  email: {
    type: String,
    required: True
  },
  password: {
    type: String,
    required: True
  },
  data: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
