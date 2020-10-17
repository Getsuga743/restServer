const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

//validacion del role, solo 2 permitidos
let rolesValidos = {
  values: ["ADMIN_ROLE", "USER_ROLE"],
  message: "{VALUE} no es un rol válido",
};  

let Schema = mongoose.Schema;

//Creamos un nuevo esquema

let usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es necesario"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "El mail es obligatorio"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
  },
  img: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    default: "USER_ROLE",
    enum: rolesValidos,
  },
  estado: {
    type: Boolean,
    default: true,
  },

  google: {
    type: Boolean,
    default: false,
  },
});

usuarioSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;
  return userObject;
};
usuarioSchema.plugin(uniqueValidator, { message: "{PATH} must be unique" });

module.exports = { Usuario: mongoose.model("Usuario", usuarioSchema) };
