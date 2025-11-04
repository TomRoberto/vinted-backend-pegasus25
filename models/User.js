const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String, // { type:String, unique: true }
  account: {
    username: String,
    avatar: Object, // on s'en fout pour le moment c'est un bonus !
  },
  newsletter: { type: Boolean, default: false },
  token: String,
  salt: String,
  hash: String,
});

module.exports = User;
