var ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const uri = require("../config/keys").MongoURI;
const client = new MongoClient(uri, { useNewUrlParser: true });
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

var result;

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
        console.log(result);
        console.log("Result length is " + result.length);

        const currentID = { _id: ObjectID(req.user._id) };
        //console.log("24");
        //console.log(currentID._id);
        for (let i = 0; i < result.length; i++) {
          let dbID = { _id: ObjectID(result[i]._id) };
          //console.log("Comparing " + currentID._id + " with " + dbID._id);
          if (currentID._id.equals(dbID._id)) {
            //console.log("Name is " + req.user.name
            result = result[i];
            console.log("Result is");
            console.log(result);
          }
        }

        res.render("dashboard", {
          name: req.user.name,
          email: req.user.email,
          id: req.user._id,
          result: result
        });
      }
    });
  });
});

router.get("/getListOfBooks", ensureAuthenticated, (req, res) => {
  client.connect(err => {
    const collection = client.db("test").collection("users");
    collection.find({}).toArray(function(err, result) {
      if (err) {
        res.send({ error: " An error has occurred" });
      } else {
        console.log(result);
        console.log("Result length is " + result.length);
        const currentID = { _id: ObjectID(req.user._id) };
        for (let i = 0; i < result.length; i++) {
          let dbID = { _id: ObjectID(result[i]._id) };
          if (currentID._id.equals(dbID._id)) {
            result = result[i];
            console.log("Result is");
            console.log(result);
          }
        }

        res.render("ListOfBooks", {
          result: result
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
    collection.updateOne(
      { name: name },
      { $push: { BookTitle: { Title: title, Note: ["Note2"] } } }
    );

    res.redirect("/dashboard");
  });
});

module.exports = router;
