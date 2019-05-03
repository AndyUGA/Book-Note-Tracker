var ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const uri = require("../config/keys").MongoURI;
const client = new MongoClient(uri, { useNewUrlParser: true });
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

var result;

//Welcome
router.get("/", (req, res) => res.render("Homepage", { layout: "Homepage" }));

//Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  client.connect(err => {
    const collection = client.db("test").collection("users");

    collection.find({}).toArray(function(err, result) {
      if (err) {
        res.send({ error: " An error has occurred" });
      } else {
        const currentID = { _id: ObjectID(req.user._id) };

        for (let i = 0; i < result.length; i++) {
          let dbID = { _id: ObjectID(result[i]._id) };

          if (currentID._id.equals(dbID._id)) {
            result = result[i];
          }
        }

        let name = req.user.name;
        let fullname;
        firstChar = name.charAt(0);
        fullname = firstChar.toUpperCase() + name.substring(1, name.length);
        res.render("dashboard", {
          name: name,
          fullname: fullname,
          email: req.user.email,
          id: req.user._id,
          result: result
        });
      }
    });
  });
});

router.get("/getBookNotes/:index/:name", ensureAuthenticated, (req, res) => {
  const index = req.params.index;
  const name = req.params.name;
  client.connect(err => {
    const collection = client.db("test").collection("users");
    let bookTitle;
    collection.find({}).toArray(function(err, result) {
      if (err) {
        res.send({ error: " An error has occurred" });
      } else {
        const currentID = { _id: ObjectID(req.user._id) };
        for (let i = 0; i < result.length; i++) {
          let dbID = { _id: ObjectID(result[i]._id) };
          if (currentID._id.equals(dbID._id)) {
            result = result[i];
            bookTitle = result.BookTitle[index].Title;
          }
        }

        res.render("BookNotes", {
          result: result,
          index: index,
          name: name,
          bookTitle: bookTitle
        });
      }
    });
  });
});

router.get("/UpdateNoteForm", ensureAuthenticated, (req, res) => {
  res.render("Forms/UpdateNote");
});

router.post("/createBookEntry/:name", (req, res, next) => {
  const name = req.params.name;

  const title = req.body.title;
  let tempData = { Title2: title };
  client.connect(err => {
    const collection = client.db("test").collection("users");
    collection.updateOne({ name: name }, { $push: { BookTitle: { Title: title, Note: [] } } });

    res.redirect("/dashboard");
  });
});

router.post("/insertNote/:index/:name/:bookTitle", (req, res, next) => {
  const name = req.params.name;
  const index = req.params.index;
  const title = req.body.title;
  const bookTitle = req.params.bookTitle;
  const note = req.body.note;

  client.connect(err => {
    const collection = client.db("test").collection("users");
    collection.updateOne({ name: name, "BookTitle.Title": bookTitle }, { $push: { "BookTitle.$.Note": note } });

    res.redirect("/getBookNotes/" + index + "/" + name);
  });
});

router.post("/updateNote/:noteIndex/:name/:bookTitle/:bookIndex", (req, res, next) => {
  const name = req.params.name;
  const bookIndex = req.params.bookIndex;
  const noteIndex = req.params.noteIndex;
  const title = req.body.title;
  const bookTitle = req.params.bookTitle;
  const note = req.body.note;

  client.connect(err => {
    const collection = client.db("test").collection("users");
    collection.updateOne({ name: name, "BookTitle.Title": bookTitle }, { $set: { ["BookTitle.$.Note." + noteIndex]: note } });

    res.redirect("/getBookNotes/" + bookIndex + "/" + name);
  });
});

router.post("/deleteNote/:bookTitle/:name", (req, res, next) => {
  const name = req.params.name;
  const bookTitle = req.params.bookTitle;

  client.connect(err => {
    const collection = client.db("test").collection("users");
    collection.updateOne({ name: name, "BookTitle.Title": bookTitle }, { $pull: { BookTitle: { Title: bookTitle } } });

    res.redirect("/dashboard");
  });
});

module.exports = router;
