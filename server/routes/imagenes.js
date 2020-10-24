const express = require("express");
const fs = require("fs");
const path = require("path");

const {
  verificaToken,
  VerificaTokenImg,
} = require("../middlewares/authenticaction");
let app = express();

//ruta para obtener la imagenes guardadas en uploads, se requiere el tipo, y la imagen,
//como en upload, sino encuentra devuelve una not image de assets
app.get("/imagenes/:tipo/:img", VerificaTokenImg, (req, res) => {
  let tipo = req.params.tipo;
  let img = req.params.img;

  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

  //checkeamos la ruta de la imagen, si no está repetida con
  //fs.existSync regresa true si existe, si existe, la borra

  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    console.log("Not image");
    let noImagePath = path.resolve(__dirname, "../assets/no-image.jpg");
    res.sendFile(noImagePath);
  }
});

module.exports = app;
