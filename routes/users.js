const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodemailer = require("nodemailer");
const uuidv4 = require("uuid/v4");

const MongoClient = require("mongodb").MongoClient;

const uri = require("../config/keys").MongoURI;

const client = new MongoClient(uri, { useNewUrlParser: true });

//User model
const User = require("../models/User");

//Login page
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("Account/login", { layout: "userLayout", title: "Login" });
  }
});

//Register page
router.get("/register", (req, res) =>
  res.render("Account/register", { layout: "userLayout", title: "Register" })
);

//Register Post Request
router.post("/register", (req, res) => {
  console.log(33, req);
  const { name, email, password, password2 } = req.body;

  let errors = [];

  //Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("Account/register", {
      errors,
      name,
      email,
      password,
      password2,
      title: "Register"
    });
  } else {
    User.findOne({ email: email }).then(user => {
      //When user exists
      if (user) {
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        let token = uuidv4();
        const newUser = new User({
          name,
          email,
          password,
          token
        });

        //Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;

            newUser.password = hash;

            //Save user
            newUser
              .save()
              .then(() => {
                transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  service: "smtp.gmail.com",
                  //secure: process.env.EMAIL_SMTP_SECURE, // lack of ssl commented this. You can uncomment it.
                  auth: {
                    user: "VincentRentalApplication@gmail.com",
                    pass: "truongduluth123@@"
                  }
                });

                let baseURL = req.protocol + "://" + req.hostname + "/activateAccount/";
                let mailOptions = {
                  from: "VincentRentalApplication@email.com", // sender address
                  to: "tandy09@gmail.com", // list of receivers
                  subject: "test", // Subject line
                  html: `<p> Click on link to confirm account: uuid: ${baseURL}${token} </p>` // html body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    return console.log(error);
                  }
                  console.log("Message sent: %s", info.messageId);
                  console.log(
                    "Preview URL: %s",
                    nodemailer.getTestMessageUrl(info)
                  );
                });
              })
              .then(user => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch(err => console.log(err));
          })
        );
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {

  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});



//logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
