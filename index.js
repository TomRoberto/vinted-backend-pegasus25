require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

// import des routers ou routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");

const app = express();
// On rend notre serveur interrogeable par n'importe qui
app.use(cors());
app.use(express.json()); // bodys !!!

mongoose.connect(process.env.MONGODB_URI);

// Configuration de cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.get("/", (req, res) => {
  res.json({ message: "server ON" });
});

// utilisation des routes
app.use(userRoutes);
app.use(offerRoutes);

app.listen(process.env.PORT, () => {
  console.log("server started 👗");
});
