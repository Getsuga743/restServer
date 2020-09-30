require("./config/config")
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// parse appliaction/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parser application/json
app.use(bodyParser.json());

app.get("/usuario", function (req, res) {
  res.json("get Usuario");
});

//crear data(registros)
app.post("/usuario", function (req, res) {
  //el body es el que va a aparecer cuando el body parser
  //capte las peticiones
  let body = req.body;
  if (body.nombre === undefined) {
    res.status(400).json({
      ok: false,
      mensaje: "El nombres es necesario",
    });
  } else {
    res.status(200);
    res.json({ persona: body });
  }
});

//actualizar data(registros,similar a post)
app.put("/usuario/:id", function (req, res) {
  let id = req.params.id;

  res.json(id);
});
app.delete("/usuario", function (req, res) {
  res.json("delete Usuario");
});

app.listen(3000, () => {
  console.log("Escuchando puerto: " + process.env.PORT);
});

