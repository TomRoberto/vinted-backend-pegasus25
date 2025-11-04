const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");

const fileUpload = require("express-fileupload");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    console.log("route POST /offer/publish");

    try {
      // Destructuration de 'req.body'
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      //   console.log(req.files.picture);

      // if (!title || !price || !req.files || !req.files.picture) {
      if (!title || !price || !req.files?.picture) {
        return res.status(406).json({ message: "missing informations" });
      }

      // On peut créer une offre s'il y a un title, un prix et une photo

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        owner: req.user._id,
      });

      // Convertion du buffer de l'image en base64
      const imageBase64 = convertToBase64(req.files.picture);
      // console.log(imageBase64);

      // Enregistrement de l'image dans Cloudinary
      const result = await cloudinary.uploader.upload(imageBase64, {
        folder: "/vinted/2025",
      });
      console.log(result);

      // Ajoute de la clé de l'image à l'offre nouvellement créée
      newOffer.product_image = result;

      // Sauvegarde de la nouvelle offre dans le DB
      await newOffer.save();

      res.status(201).json(newOffer);
    } catch (error) {
      console.log(error);

      res
        .status(500)
        .json({ message: "error while creating a new offer", error: error });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    // const filters = {
    //   product_name: new RegExp(req.query.title, "i"),
    //   product_price: {
    //     $gte: req.query.priceMin,
    //     $lte: req.query.priceMax,
    //   },
    // };

    console.log("req.query", req.query);

    const filters = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = {
        $gte: req.query.priceMin,
      };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }

    console.log("filters", filters);

    const sort = {
      // product_price: "descending",
    };

    if (req.query.sort === "price-desc") {
      sort.product_price = "descending";
    } else if (req.query.sort === "price-asc") {
      sort.product_price = "ascending";
    }

    console.log("sort", sort);

    const limit = 5;
    console.log(req.query.page - 1);
    console.log((req.query.page - 1) * limit);

    let skip = 0;

    if (req.query.page) {
      skip = (req.query.page - 1) * limit;
    }

    // skip = (page - 1) * limit

    // 5 produits par page : 1ère page => 0 ; 2ème page => 5 ; 3ème page => 10 ; 4ème page => 15
    // 3 produits par page : 1ère page => 0 ; 2ème page => 3 ; 3ème page => 6 ; 4ème page => 9

    const offers = await Offer.find(filters)
      .populate("owner", "account")
      .sort(sort)
      .skip(skip)
      .limit(limit);
    // .select("product_name product_price");

    const count = await Offer.countDocuments(filters);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(500).json({
      message: "error while creating a new offer",
      error: error.message,
    });
  }
});

module.exports = router;
