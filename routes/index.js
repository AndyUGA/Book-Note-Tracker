const MongoClient = require("mongodb").MongoClient;
const uri = require("../config/keys").MongoURI;
const client = new MongoClient(uri, { useNewUrlParser: true });
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

//Welcome
router.get("/", (req, res) => res.render("welcome"));

//Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  client.connect(err => {
    const collection = client.db("test").collection("users");
    collection.find({}).toArray(function(err, result) {
      if (err) {
        res.send({ error: " An error has occurred" });
      } else {
        console.log(req);
        res.render("dashboard", {
          name: req.user.name,
          email: req.user.email,
          id: req.user._id,
          result: result[0]
        });
      }
    });
  });
});

router.post("/createBookEntry/:name", (req, res, next) => {
  const name = req.params.name;
  const title = req.body.title;
  let tempData = { Title2: title };
  client.connect(err => {
    const collection = client.db("test").collection("users");
    collection.updateOne({ name: name }, { $push: { Books: title } });

    res.redirect("/dashboard");
  });
});

module.exports = router;
