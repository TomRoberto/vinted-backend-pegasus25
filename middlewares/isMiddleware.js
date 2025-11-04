const isMiddleware = (req, res, next) => {
  console.log("je suis dans le middleware");

  // if(probleme){
  //  return res.json("réponse du middleware");
  // on arrete donc le code s'il y a un problème
  // la suite ne sera pas lue !
  // }

  next();
};

module.exports = isMiddleware;
