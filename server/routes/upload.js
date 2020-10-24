const express = require("express");
const fileUpload = require("express-fileupload");

const app = express();
const Producto = require("../models/producto");
const { Usuario } = require("../models/usuario");

const fs = require("fs");
const path = require("path");

app.use(fileUpload({ useTempFiles: true }));
//tipo de producto y la id
app.post("/upload/:tipo/:id", (req, res) => {
  let tipo = req.params.tipo;
  let id = req.params.id;

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "No files were Uploaded",
      },
    });
  }
  //validacion de los tipos

  let tiposValidos = ["productos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "Los tipos permitidas son " + tiposValidos.join(),
      },
    });
  }

  //requerir el objeto del archivo
  let archivo = req.files.archivo;
  //nombre y array con las extensiones
  let nombreCortado = archivo.name.split(".");
  //extension del archivo
  let extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //extensiones validas
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  //comprobacion
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message:
          "Las extensiones permitidas son " + extensionesValidas.join(" , "),
        ext: archivo.mimetype,
      },
    });
  }

  //Cambiar nombre del archivo, utiliza los milisegundos para evitar coincindencias
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    }
    switch (tipo) {
      case "usuarios":
        imagenUsuarios(id, res, nombreArchivo);
        break;
      case "productos":
        imagenProducto(id, res, nombreArchivo);
      default:
        return err;
        break;
    }
  });
});

function imagenUsuarios(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      {
        borrarArchivo(nombreArchivo, "usuarios");
        return res.status(500).json({
          ok: false,
          err,
          message: "Problem with the Find"
        });
      }
    }
    if (!usuarioDB) {
      imagenUsuarios(id, res, nombreArchivo);
      res.status(400).json({
        ok: false,
        err: {
          message: "Usuario no existe",
        },
      });
    }
    //si no falla la conexion, y el usuario existe, se crea la ruta de la imagen
    borrarArchivo(usuarioDB.img, "usuarios");

    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioGuardado) => {
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo,
      });
    });
  });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borrarArchivo(nombreArchivo, "productos");
      return res.status(500).json({
        ok: false,
        err,
        message: `La id ${id}, no coinci`,
      });
    }
    if (!productoDB) {
      borrarArchivo(nombreArchivo, "productos");
      return res.status(400).json({
        ok: false,
        err: {
          message: "no se ha encontrado un producto con una ID Valida",
        },
      });
    }
    borrarArchivo(productoDB.img, "productos");

    productoDB.img = nombreArchivo;

    productoDB.save((err, productoGuardado) => {
      res.json({ ok: true, producto: productoGuardado });
    });
  });
}
//borra archivos de los directoris de uploads
//ejemplo  /upĺoads/ruta/idimagen

function borrarArchivo(imagen, ruta) {
  let pathImagen = path.resolve(__dirname, `../../uploads/${ruta}/${imagen}`);

  //checkeamos la ruta de la imagen, si no está repetida con
  //fs.existSync regresa true si existe, si existe, la borra

  if (fs.existsSync(pathImagen)) {
    //borrar imagen
    fs.unlinkSync(pathImagen);
    console.log(
      "archivo borrado con nombre " + "imagen " + " en ruta " + pathImagen
    );
  }
  console.log("archivo no borrado");
}

module.exports = app;
