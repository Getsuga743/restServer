const express = require("express");

const bcrypt = require("bcrypt");
const _ = require("underscore");
const { Usuario } = require("../models/usuario");
const { verificaToken, verificaAdmin_Role } = require("../middlewares/authenticaction");

const app = express();

app.get("/usuario", verificaToken, function (req, res) {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  let limite = req.query.limite || 5;
  limite = Number(limite);

  Usuario.find({ estado: true }, "nombre email role estado google img")
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Usuario.count({ estado: true }, (err, count) => {
        if (err) {
          console.log(err);
        }
        res.json({
          ok: true,
          usuarios,
          cuantos: count,
        });
      });
    });
});

//crear data(registros)
app.post("/usuario", [verificaToken, verificaAdmin_Role], function (req, res) {
  //el body es el que va a aparecer cuando el body parser
  //capte las peticiones
  let body = req.body;
  // el modelo de usuario importado de "../models/usuario"

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 12),
    role: body.role,
  });

  // el metodo save. usa un callback apra administras el guardado del nuevo usuario
  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({ ok: true, usuario: usuarioDB });
  });
});

//actualizar data(registros,similar a post)
app.put("/usuario/:id", verificaToken, function (req, res) {
  let id = req.params.id;
  let body = _.pick(req.body, ["nombre", "email", "img", "role"]);

  //runvalidator para correr las validaciones del scheema
  Usuario.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, usuarioDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        usuarioDB: usuarioDB,
      });
    }
  );
});

app.delete("/usuario/:id", verificaToken, function (req, res) {
  let id = req.params.id;
  let cambiaEstado = { estado: false };
  Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, user) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    if (user === null) {
      return res.status(400).json({
        ok: false,
        error: {
          message: "userNotFound",
        },
      });
    }
    res.json({
      ok: true,
      user: user,
    });
  });
});

//se exporta app
module.exports = app;
