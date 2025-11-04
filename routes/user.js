const express = require("express");
const router = express.Router();
const User = require("../models/User");
const isMiddleware = require("../middlewares/isMiddleware");

// packages pour cryptage et token
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const enBase64 = require("crypto-js/enc-base64");
const { long } = require("webidl-conversions");

router.post("/user/signup", async (req, res) => {
  try {
    // console.log(req.body);

    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "missing parameters" });
    }

    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: "email already taken" });
    }

    // création d'un compte :
    // 1- générer un mdp hashé
    const salt = uid2(16);
    const token = uid2(64);

    const hash = SHA256(req.body.password + salt).toString(enBase64);

    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      token: token,
      salt: salt,
      hash: hash,
    });

    await newUser.save();

    const response = {
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    };

    res.status(201).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error while signing up", error: error });
  }
});

router.post("/user/login", isMiddleware, async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });

    if (!userFound) {
      return res.status(401).json({ message: "Email or password incorrect" });
    }

    // si on est là c'est qu'un user a été trouvé
    // il faut saler et hasher le mdp reçu et le comparé au hash de userFound

    // console.log(userFound);

    const saltedPassword = req.body.password + userFound.salt;
    const hashToTest = SHA256(saltedPassword).toString(enBase64);

    if (hashToTest !== userFound.hash) {
      return res.status(401).json({ message: "email or Password incorrect" });
    }
    // si on est là c'est que les hash correspondent
    const response = {
      _id: userFound._id,
      token: userFound.token,
      account: userFound.account,
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error while login in", error: error });
  }
});

// ⚠️ export du router !
module.exports = router;
