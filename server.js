const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const cors = require("cors");

const uri =
  "mongodb+srv://macknz7:I6ZoDlS9ipLuP8qB@cluster0.j79xz.mongodb.net/grey?retryWrites=true&w=majority";
const mongoose = require("mongoose");
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// const collection = client.db("grey").collection("swanky");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Not found middleware
/*
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})
*/

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

/* * * * * * * * ** * * *  * * * * * * ** *  * * **  * * * * * * * * * * **  */

// schema
const userSchema = new mongoose.Schema({
  username: String
});

// model, used to construct documents
const User = mongoose.model("User", userSchema);

// routes
app.post("/api/exercise/new-user", (req, res) => {
  User.findOne({ username: req.body.username }, function(err, doc) {
    if(err){
      console.log(err);
    } else {
      if(doc == null){
        doc = new User({username: req.body.username});
        doc.save();
      }
      res.json({_id: doc._id, username: doc.username});
    }
  });  
});
