const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
  descripcion: {
    type: String,
    unique: true,
    required: [true, "Se necesita descripcion"],
  },
  //devuelve la id del usuario
  usuario: { type: Schema.Types.ObjectId, ref: "Usuario" },
});

module.exports = { Categoria: mongoose.model("Categoria", categoriaSchema) };
