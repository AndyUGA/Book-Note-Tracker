const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  BookTitle: {
    type: Array
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  token: {
    type: String,
    required: true,
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
