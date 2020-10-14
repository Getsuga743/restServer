//=====================
// Puerto
//=====================
process.env.PORT = process.env.PORT || 3080;

//=====================
// Entorno
//=====================

process.env.NODE_ENV = process.env.NODE_ENV || "desarrollo";

//=====================
// vencimiento del token
//=====================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30

//=====================
// token seed
//=====================
process.env.SEED_TOKEN = process.env.SEED || "this-is-the-seed";

//=====================
// DB
//=====================

let urlDB;

if (process.env.NODE_ENV === "desarrollo") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB = process.env.MONGO_URL;
}

process.env.URLDB = urlDB;
