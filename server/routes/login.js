const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("underscore");

const { Usuario } = require("../models/usuario");

const app = express();
//agarra las peticiones post, de /login, y matchea si hay algun
//usuario en la base de datos que coincida
app.post("/login", (req, res) => {
  let body = req.body;
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    //si hay error, se retorna error 500 error servidor y se imprime el erro tal cual

    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    //usuario no encontrado
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "(User) or password are wrong",
        },
      });
    }
    //funcion de bcrypt q compara un campo al cual hashea, con la base de datos
    //y retorna un boolean
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "User or (password) are wrong",
        },
      });
    }
    //generar token
    let token = jwt.sign(
      {
        usuario: usuarioDB,
      },
      "this-is-the-seed",
      {
        //30dias
        expiresIn: 60 * 60 * 24 * 30,
      }
    );
    res.json({
      ok: true,
      usuario: usuarioDB,
      token: token,
    });
  });
});

module.exports = app;
