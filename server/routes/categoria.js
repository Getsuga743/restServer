const express = require("express");

let {
  verificaToken,
  verificaAdmin_Role,
} = require("../middlewares/authenticaction");
const _ = require("underscore");
const app = express();

let { Categoria } = require("../models/categoria");

//==============================
//mostrar todas las categorias
//==============================

app.get("/categoria", (req, res) => {
  //populate, permite buscar en las los object ids, y retornar esa instancia
  Categoria.find({})
    .sort("descripcion")
    .populate("usuario", "nombre email")
    .exec((err, categorias) => {
      if (err) {
        return res.status(400).json({ ok: false, err });
      }
      Categoria.count((err, count) => {
        if (err) {
          console.log(err);
        }
        res.json({
          ok: true,
          categorias,
          cuantos: count,
        });
      });
    });
});

//==============================
//mostrar una categoria por id
//==============================
app.get("/categoria/:id", (req, res) => {
  let id = req.params.id;
  console.log(req.usuario);
  Categoria.findById(id, (err, categoria) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    //si el user no existe
    if (categoria === null) {
      return res.status(400).json({
        ok: false,
        error: {
          message: "categoriaNotFound",
        },
      });
    }
    res.json({
      ok: true,
      categoria: categoria,
    });
  });
});

//==============================
//crear una nueva categoria
//==============================

app.post("/categoria", verificaToken, (req, res) => {
  //regresa la nueva categoria
  let body = req.body;
  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario._id,
  });
  categoria.save((err, categoriaDB) => {
    if (err) {
      if (err.code === 11000) {
        console.log(err);
      }
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({ ok: true, categoria: categoriaDB });
  });

  //req.usuario._id
});

//==============================
//editar una categoria por id
//==============================

app.put("/categoria/:id", verificaToken, (req, res) => {
  id = req.params.id;
  let body = _.pick(req.body, ["descripcion"]);
  Categoria.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, categoriaDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        categoria: categoriaDB,
      });
    }
  );
});
//==============================
//Eliminar una categoria
//==============================

app.delete("/categoria/:id", verificaToken, verificaAdmin_Role, (req, res) => {
  //solo un admini puede borrar categorias

  let id = req.params.id;

  Categoria.findByIdAndRemove(id, (err, del) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    if (del === null) {
      return res.status(400).json({
        ok: false,
        error: {
          message: "categoriaNotFound",
        },
      });
    }
    res.json({ ok: true, message: `categoria with id ${id} was removed` });
  });
});

//Categoria.findByIdAndRemove
module.exports = app;
