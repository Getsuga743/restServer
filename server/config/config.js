//=====================
// Puerto
//=====================
process.env.PORT = process.env.PORT || 3080;

//=====================
// Entorno
//=====================

process.env.NODE_ENV = process.env.NODE_ENV || "desarrollo";

//=====================
// DB
//=====================

let urlDB;

if (process.env.NODE_ENV === "desarrollo") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB= "mongodb+srv://Aragorn1234:123ImG4561806@cluster0.axkig.mongodb.net/cafe";
}
process.env.URLDB = urlDB
