require("./config/config");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

// parse appliaction/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parser application/json
app.use(bodyParser.json());



app.get("/", function (req, res) {
  res.redirect("/usuario");
});


//Global config de rutas s

app.use(require("./routes/index"));

mongoose.connect(
  process.env.URLDB,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
  },
  (err, res) => {
    if (err) throw err;
    console.log("Database online--- "+ process.env.URLDB);
  }
);

app.listen(process.env.PORT, () => {
  console.log("Escuchando puerto: " + process.env.PORT);
});
