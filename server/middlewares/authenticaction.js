const jwt = require("jsonwebtoken");

//===================
//verificar token
//===================
//paramentro next, sirve para que se siga ejecutando las cosas en la ruta
let verificaToken = (req, res, next) => {
  let token = req.get("authorization");
  console.log(token);
  jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: { message: "not valid Token" },
      });
    }
    req.usuario = decoded.usuario;
    next();
  });
};

//===================
//verificar AdminRole
//===================
let verificaAdmin_Role = (req, res, next) => {
  let usuario = req.usuario;
  console.log(req.usuario);
  if (usuario.role === "ADMIN_ROLE") {
    next();
  } else {
    return res.json({
      ok: false,
      err: {
        message: "El usuario no es administrador",
      },
    });
  }
};

//==============================
// VerificaTokenImg
//==============================

let VerificaTokenImg = (req, res, next) => {
  let token = req.query.tkn;

  console.log(token);
  jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: { message: "not valid Token" },
      });
    }
    req.usuario = decoded.usuario;
    next();
  });
};

module.exports = {
  verificaToken,
  verificaAdmin_Role,
  VerificaTokenImg,
};
