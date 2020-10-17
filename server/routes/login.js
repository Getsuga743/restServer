const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
const _ = require("underscore");

const { Usuario } = require("../models/usuario");
const usuario = require("../models/usuario");

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
      process.env.SEED_TOKEN,
      {
        //30dias
        expiresIn: process.env.CADUCIDAD_TOKEN,
      }
    );
    res.json({
      ok: true,
      usuario: usuarioDB,
      token: token,
    });
  });
});

//configuracion de google

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
 
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

//aca llega el token de autentificacion del google Sign, se utiliza en forma async
//si esta todo ok, se crea un googleUser, con los datos de google
app.post("/google", async (req, res) => {
  let token = req.body.idtoken;
  let googleUser = await verify(token).catch((err) => {
    return res.status(403).json({
      ok: false,
      err: err,
    });
  });
  //aca vemos si el mail de google, matchea con uno en la db, si no hay ninguna coincidencia
  //crea un nuevo user, si la hay, evalua si ya se ha logeado con google o no, y si esta autentifcado con google
  //si lo esta, renueva el token de la api
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }
    //si existe el user con ese mail

    if (usuarioDB) {
      //si ese user no se autentifico con google
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "You must to use your normal ID",
          },
        });
      } else {
        //si el user está logeado con google, crear o actualzia rtoken
        let token = jwt.sign(
          {
            usuario: usuarioDB,
          },
          process.env.SEED_TOKEN,
          {
            //30dias
            expiresIn: process.env.CADUCIDAD_TOKEN,
          }
        );
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      }
    } else {
      //si el usaruio no existe = new Usuario (los campos salen del payload de google)
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ":)";

      //guardar en al db
      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err,
          });
        }
        //nuevo token
        let token = jwt.sign(
          {
            usuario: usuarioDB,
          },
          process.env.SEED_TOKEN,
          {
            //30dias
            expiresIn: process.env.CADUCIDAD_TOKEN,
          }
        );

        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      });
    }
  });
});

module.exports = app;
