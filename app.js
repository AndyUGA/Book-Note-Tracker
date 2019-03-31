const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");

const app = express();

//DB config connection string

const db = require("./config/keys").MongoURI;

//Connect to mongoose
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

//EJS layouts
app.use(expressLayouts);
app.set("view engine", "ejs");

//Bodyparser
app.use(express.urlencoded({ extended: false }));

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const PORT = process.env.port || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
