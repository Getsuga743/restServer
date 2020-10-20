const express = require("express");
let {
  verificaToken,
  verificaAdmin_Role,
} = require("../middlewares/authenticaction");

const _ = require("underscore");
let paginado = require("../config/utilities");
let app = express();
let Producto = require("../models/producto");
const usuario = require("../models/usuario");

//==============================
// Buscar productos por termino
//==============================
app.get("/productos/buscar/:termino", verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regex = new RegExp(termino, "i")
  Producto.find({ nombre: regex })
    .populate("categoria", "nombre")
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!productos) {
        return res.status(400).json({
          ok: false,
          err: { message: "error al cargar los productos, no encontrados" },
        });
      } else {
      }
    });
});

//==============================
// Obtener productos
//==============================

app.get("/productos", verificaToken, (req, res) => {
  //paginado
  let { desde, limite } = paginado(req);
  //trae todos los productos, populate: usuario categoria
  Producto.find({ disponible: true })
    .skip(desde)
    .limit(limite)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({ ok: false, err });
      }
      Producto.count((err, count) => {
        if (err) {
          console.log(err);
        }
        res.json({
          ok: true,
          productos,
          cuantos: count,
        });
      });
    });
});

//==============================
//Obtener un producto por ID
//==============================

app.get("/productos/:id", verificaToken, (req, res) => {
  //paginado
  let id = req.params.id;

  //populate_ usuario categoria
  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productoDB) => {
      if (err) {
        return res.status(500).json({ ok: false, err });
      }

      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: { message: " producto no encontrado " },
        });
      }

      res.json({
        ok: true,
        producto: productoDB,
      });
    });
});

//==============================
//crear un producto
//==============================
app.post("/productos", verificaToken, (req, res) => {
  //grabar el usuario, categoria del listado
  // nombre:
  // precioUni:
  // descripcion:
  // disponible:
  // categoria:
  // usuario:
  let body = req.body;

  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoriaId,
    usuario: req.usuario._id,
  });
  producto.save((err, productoDB) => {
    res.status(201).json({ ok: true, producto: productoDB });
  });
});
//==============================
//Actualizar un producto
//==============================

app.put("/productos/:id", verificaToken, (req, res) => {
  //grabar el usuario
  let id = req.params.id;
  let body = req.body;
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
  });
  if (!productoDB) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "producto not found",
      },
    });
  }
  productoDB.nombre = body.nombre;
  productoDB.precioUni = body.precioUni;
  productoDB.categoria = body.categoria;
  productoDB.disponible = body.disponible;
  productoDB.descripcion = body.descripcion;

  productoDB.save((err, saveProduct) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      producto: saveProduct,
    });
  });
});

//grabar una categoria del listado
//==============================
//eliminar un producto
//==============================

app.delete("/productos/:id", (req, res) => {
  //grabar el usuario, categoria del listado
  //cambiar estado
  let id = req.params.id;
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: { message: "producto no encontrado" },
      });
    } else {
      productoDB.disponible = false;
      productoDB.save((err, productoBorrado) => {
        res.json({
          ok: true,
          productoBorrado,
        });
      });
    }
  });
});

module.exports = app;
