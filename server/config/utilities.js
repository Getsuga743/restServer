//paginad
let paginado = (req) => {
  let desde = req.query.desde || 0;
  let limite = req.query.hasta || 5;
  desde = Number(desde);
  limite = Number(limite);
  return { desde, limite };
};

module.exports = paginado;
