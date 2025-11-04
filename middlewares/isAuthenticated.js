const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  console.log("Middleware isAuthenticated");

  try {
    // console.log(req.headers.authorization);

    if (!req.headers.authorization) {
      // On stop tout s'il n'y pas de bearer token
      return res.status(406).json({ message: "UnAuthorized" });
    }

    // Extraction du token
    const token = req.headers.authorization.replace("Bearer ", "");
    // console.log(token);

    // Recheche du user correspondant
    const user = await User.findOne({
      token: token,
    }).select("-salt -hash");

    // console.log(user);

    if (user) {
      // Transmission du user trouvé pour y avoir accès dans la route
      req.user = user;

      // Pourvoir sortir du middleware et continuer dans la route
      next();
    } else {
      return res.status(406).json({ message: "UnAuthorized" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "UnAuthorized", error: error });
  }
};

module.exports = isAuthenticated;
